from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, timezone
from uuid import uuid4
from enum import Enum

class TicketStatus(str, Enum):
    open = "open"
    in_progress = "in_progress"
    resolved = "resolved"
    escalated = "escalated"

class TicketPriority(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"

class ConversationEntry(BaseModel):
    role: str
    message: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class EscalationEntry(BaseModel):
    escalated_to: str
    department_email: str
    reason: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class TicketCreate(BaseModel):
    subject: str
    description: str

class TicketDocument(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    customer_id: str
    customer_email: str
    subject: str
    description: str
    priority: Optional[TicketPriority] = None
    status: TicketStatus = TicketStatus.open
    category: Optional[str] = None
    assigned_department: Optional[str] = None
    agent_reasoning: Optional[str] = None
    conversation_history: List[ConversationEntry] = []
    escalation_trail: List[EscalationEntry] = []
    rag_context_snapshot: List[str] = []
    resolution_summary: Optional[str] = None
    email_sent: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class TicketResponse(BaseModel):
    id: str
    customer_id: str
    customer_email: str
    subject: str
    description: str
    priority: Optional[str]= None
    status: str
    category: Optional[str]
    assigned_department: Optional[str]
    agent_reasoning: Optional[str]
    conversation_history: List[ConversationEntry]
    escalation_trail: List[EscalationEntry]
    resolution_summary: Optional[str]
    email_sent: bool
    created_at: datetime
    updated_at: datetime