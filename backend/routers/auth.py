from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from db.postgres import get_db
from db.pg_models import User, Executive, Role
from db.schemas import UserRegister, UserLogin, ExecutiveLogin, TokenResponse, UserResponse, ExecutiveResponse
from auth.auth_handler import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/customer/register", response_model=UserResponse)
async def register_customer(data: UserRegister, db: AsyncSession = Depends(get_db)):
    # Check if email already exists
    result = await db.execute(select(User).where(User.email == data.email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")

    # Fetch customer role
    role_result = await db.execute(select(Role).where(Role.name == "customer"))
    role = role_result.scalar_one_or_none()
    if not role:
        raise HTTPException(status_code=500, detail="Customer role not found. Run seed.py first.")

    new_user = User(
        name=data.name,
        email=data.email,
        password_hash=hash_password(data.password),
        role_id=role.id
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    return new_user


@router.post("/customer/login", response_model=TokenResponse)
async def login_customer(data: UserLogin, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == data.email))
    user = result.scalar_one_or_none()

    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is deactivated")

    token = create_access_token({
        "user_id": str(user.id),
        "email": user.email,
        "role": "customer"
    })
    return {"access_token": token, "token_type": "bearer", "user": user}


@router.post("/executive/login", response_model=TokenResponse)
async def login_executive(data: ExecutiveLogin, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Executive).where(Executive.email == data.email)
    )
    executive = result.scalar_one_or_none()

    if not executive or not verify_password(data.password, executive.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not executive.is_active:
        raise HTTPException(status_code=403, detail="Account is deactivated")

    token = create_access_token({
        "user_id": str(executive.id),
        "email": executive.email,
        "role": "executive"
    })
    return {"access_token": token, "token_type": "bearer", "user": executive}