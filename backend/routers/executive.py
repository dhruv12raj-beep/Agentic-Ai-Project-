from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from db.postgres import get_db
from db.pg_models import Executive
from db.mongo import conversation_logs
from db.mongo_schemas import TicketResponse
from db.schemas import ExecutiveResponse
from auth.dependencies import get_current_executive
from typing import List

router = APIRouter(prefix="/executive", tags=["Executive"])


@router.get("/me", response_model=ExecutiveResponse)
async def get_executive_profile(
    current_executive: Executive = Depends(get_current_executive),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Executive).where(Executive.id == current_executive.id)
    )
    executive = result.scalar_one_or_none()
    return executive


@router.get("/tickets", response_model=List[TicketResponse])
async def get_all_tickets(
    current_executive: Executive = Depends(get_current_executive)
):
    cursor = conversation_logs.find(
        {},
        sort=[("created_at", -1)]
    )
    tickets = await cursor.to_list(length=500)
    return tickets


@router.get("/tickets/{ticket_id}", response_model=TicketResponse)
async def get_ticket_detail(
    ticket_id: str,
    current_executive: Executive = Depends(get_current_executive)
):
    ticket = await conversation_logs.find_one({"id": ticket_id})
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return ticket


@router.patch("/tickets/{ticket_id}/status")
async def update_ticket_status(
    ticket_id: str,
    status: str,
    current_executive: Executive = Depends(get_current_executive)
):
    valid_statuses = ["open", "in_progress", "resolved", "escalated"]
    if status not in valid_statuses:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid status. Must be one of {valid_statuses}"
        )

    result = await conversation_logs.update_one(
        {"id": ticket_id},
        {"$set": {"status": status}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Ticket not found")

    return {"message": f"Ticket status updated to {status}"}