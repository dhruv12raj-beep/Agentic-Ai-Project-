from pydantic import BaseModel , EmailStr , Field
from typing import Optional
from datetime import datetime
from uuid import UUID

#ROles Schemas

class RoleResponse(BaseModel):
    id: UUID
    name: str

    class config:
        from_attributes = True


# User schemas 
class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str= Field(..., min_length=8,max_length=20)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: UUID
    name: str
    email: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


# Executive schemas
class ExecutiveLogin(BaseModel):
    email: EmailStr
    password: str

class ExecutiveResponse(BaseModel):
    id: UUID
    name: str
    email: str
    created_at: datetime

    class Config:
        from_attributes = True


#Auth response 
class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse | ExecutiveResponse
