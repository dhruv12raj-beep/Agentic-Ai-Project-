import json
from autogen_agentchat.agents import AssistantAgent
from autogen_agentchat.messages import TextMessage
from autogen_ext.models.openai import OpenAIChatCompletionClient
from autogen_core import CancellationToken  
from db.mongo import conversation_logs
from db.mongo_schemas import ConversationEntry, EscalationEntry
from agents.rag import retrieve_context
from agents.email_service import resolution_email, escalation_email
from config import GROQ_API_KEY
from datetime import datetime, timezone

groq_client = OpenAIChatCompletionClient(
    model="openai/gpt-oss-120b",
    api_key=GROQ_API_KEY,
    base_url="https://api.groq.com/openai/v1",
    model_info={
        "family": "gpt",
        "vision": False,
        "function_calling": True,
        "json_output": True,
    },
)

ESCALATION_EMAIL = "dhruv12megh@gmail.com"


async def log_conversation(ticket_id: str, role: str, message: str):
    entry = ConversationEntry(role=role, message=message)
    await conversation_logs.update_one(
        {"id": ticket_id},
        {
            "$push": {"conversation_history": entry.model_dump()},
            "$set": {"updated_at": datetime.now(timezone.utc)}
        }
    )


async def run_agent(ticket_id: str, subject: str, description: str, customer_email: str):
    # Step 1 — retrieve RAG context
    rag_docs = retrieve_context(f"{subject} {description}")
    rag_text = "\n".join([f"- {doc}" for doc in rag_docs])

    await log_conversation(ticket_id, "agent", "Ticket received. Searching knowledge base...")

    await conversation_logs.update_one(
        {"id": ticket_id},
        {"$set": {"rag_context_snapshot": rag_docs}}
    )

    await log_conversation(ticket_id, "agent", f"Found {len(rag_docs)} relevant knowledge base entries.")

    # Step 2 — build agent with system prompt
    agent = AssistantAgent(
        name="SupportAgent",
        model_client=groq_client,
        system_message="""
You are an intelligent customer support agent.

You will receive a support ticket and relevant knowledge base context.
Your job is to analyse the ticket and respond ONLY with a valid JSON object.

Your response must follow this exact structure:
{
    "category": "billing | technical | delivery | general",
    "priority": "low | medium | high",
    "can_resolve": true or false,
    "resolution": "your resolution message if can_resolve is true, else null",
    "escalation_reason": "reason for escalation if can_resolve is false, else null"
}

Rules:
- Set priority to high if the issue involves money, account lockout, or data loss
- Set priority to medium for delivery issues or app bugs
- Set priority to low for general questions or information requests
- Only set can_resolve to true if the knowledge base context directly answers the issue
- If you are not certain, escalate — do not guess
- Return ONLY the JSON object, no extra text
"""
    )

    # Step 3 — run the agent
    user_message = f"""
Ticket subject: {subject}

Ticket description: {description}

Relevant knowledge base context:
{rag_text}
"""

    await log_conversation(ticket_id, "agent", "Analysing ticket with Groq LLM...")

    response = await agent.on_messages(
        [TextMessage(content=user_message, source="user")],
        cancellation_token=CancellationToken()
    )

    raw_response = response.chat_message.content
    await log_conversation(ticket_id, "agent", "Agent reasoning complete. Processing decision...")

    # Step 4 — parse agent decision
    try:
        # ✅ FIX: strip markdown fences if model wraps response in ```json ... ```
        cleaned = raw_response.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.split("```")[1]
            if cleaned.startswith("json"):
                cleaned = cleaned[4:]
        decision = json.loads(cleaned.strip())
    except json.JSONDecodeError:
        decision = {
            "category": "general",
            "priority": "medium",
            "can_resolve": False,
            "resolution": None,
            "escalation_reason": "Agent response could not be parsed. Manual review required."
        }
 
    category = decision.get("category", "general")
    priority = decision.get("priority", "medium")
    can_resolve = decision.get("can_resolve", False)

    # Step 5 — update category and priority immediately
    await conversation_logs.update_one(
        {"id": ticket_id},
        {"$set": {
            "category": category,
            "priority": priority,
            "agent_reasoning": raw_response,
            "updated_at": datetime.now(timezone.utc)
        }}
    )

    # Step 6a — resolved path
    if can_resolve:
        resolution = decision.get("resolution")
        await log_conversation(ticket_id, "agent", "Resolution found. Updating ticket...")

        await conversation_logs.update_one(
            {"id": ticket_id},
            {"$set": {
                "status": "resolved",
                "resolution_summary": resolution,
                "updated_at": datetime.now(timezone.utc)
            }}
        )

        try:
            resolution_email(customer_email, subject, resolution)
            await conversation_logs.update_one(
                {"id": ticket_id},
                {"$set": {"email_sent": True}}
            )
            await log_conversation(ticket_id, "agent", "Resolution email sent to customer.")
        except Exception as e:
            await log_conversation(ticket_id, "agent", f"Email failed: {str(e)}")

    # Step 6b — escalation path
    else:
        escalation_reason = decision.get("escalation_reason", "Issue requires human intervention.")

        await log_conversation(ticket_id, "agent", "Cannot resolve. Escalating to executive team...")

        escalation_entry = EscalationEntry(
            escalated_to="Executive Team",
            department_email=ESCALATION_EMAIL,
            reason=escalation_reason
        )

        await conversation_logs.update_one(
            {"id": ticket_id},
            {
                "$set": {
                    "status": "escalated",
                    "assigned_department": "executive_team",
                    "updated_at": datetime.now(timezone.utc)
                },
                "$push": {
                    "escalation_trail": escalation_entry.model_dump()
                }
            }
        )

        try:
            escalation_email(
                department_email=ESCALATION_EMAIL,
                ticket_id=ticket_id,
                subject=subject,
                description=description,
                reason=escalation_reason,
                priority=priority
            )
            await conversation_logs.update_one(
                {"id": ticket_id},
                {"$set": {"email_sent": True}}
            )
            await log_conversation(ticket_id, "agent", "Escalation email sent to executive team.")
        except Exception as e:
            await log_conversation(ticket_id, "agent", f"Email failed: {str(e)}")

    await log_conversation(ticket_id, "agent", "Agent workflow complete.")