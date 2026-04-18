from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer , HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from db.postgres import get_db
from db.pg_models import User, Executive
from auth.auth_handler import decode_access_token

security = HTTPBearer()

async def get_current_user(
    auth: HTTPAuthorizationCredentials= Depends(security),
    db: AsyncSession = Depends(get_db)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired token",
        headers={"WWW-Authenticate": "Bearer"},
    )
    token = auth.credentials
    payload = decode_access_token(token)
    if not payload or payload.get("role") != "customer":
        raise credentials_exception

    result = await db.execute(select(User).where(User.id == payload.get("user_id")))
    user = result.scalar_one_or_none()
    if not user or not user.is_active:
        raise credentials_exception
    return user


async def get_current_executive(
    auth: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db)
) -> Executive:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired token",
        headers={"WWW-Authenticate": "Bearer"},
    )
    token = auth.credentials
    payload = decode_access_token(token)
    if not payload or payload.get("role") != "executive":
        raise credentials_exception

    result = await db.execute(select(Executive).where(Executive.id == payload.get("user_id")))
    executive = result.scalar_one_or_none()
    if not executive or not executive.is_active:
        raise credentials_exception
    return executive