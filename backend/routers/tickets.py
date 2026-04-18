from fastapi import APIRouter, Depends, HTTPException , BackgroundTasks
from db.mongo import conversation_logs
from db.mongo_schemas import TicketCreate, TicketDocument, TicketResponse
from auth.dependencies import get_current_user, get_current_executive
from agents.agent import run_agent
from db.pg_models import User, Executive
from datetime import datetime, timezone
from typing import List

router = APIRouter(prefix="/tickets", tags=["Tickets"])


@router.post("/", response_model=TicketResponse)
async def create_ticket(
    data: TicketCreate,
    background_tasks : BackgroundTasks,
    current_user: User = Depends(get_current_user)
):
    ticket = TicketDocument(
        customer_id=str(current_user.id),
        customer_email=current_user.email,
        subject=data.subject,
        description=data.description,
    )

    await conversation_logs.insert_one(ticket.model_dump())

    background_tasks.add_task(
        run_agent,
        ticket_id=ticket.id,
        subject=ticket.subject,
        description=ticket.description,
        customer_email=ticket.customer_email
    )

    return ticket


@router.get("/my", response_model=List[TicketResponse])
async def get_my_tickets(
    current_user: User = Depends(get_current_user)
):
    cursor = conversation_logs.find(
        {"customer_id": str(current_user.id)},
        sort=[("created_at", -1)]
    )
    tickets = await cursor.to_list(length=100)
    return tickets


@router.get("/all", response_model=List[TicketResponse])
async def get_all_tickets(
    current_executive: Executive = Depends(get_current_executive)
):
    cursor = conversation_logs.find(
        {},
        sort=[("created_at", -1)]
    )
    tickets = await cursor.to_list(length=500)
    return tickets


@router.get("/{ticket_id}", response_model=TicketResponse)
async def get_ticket(
    ticket_id: str,
    current_user: User = Depends(get_current_user)
):
    ticket = await conversation_logs.find_one({"id": ticket_id})
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    if ticket["customer_id"] != str(current_user.id):
        raise HTTPException(status_code=403, detail="Access denied")
    return ticket