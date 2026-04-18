from sqlalchemy import Column, String, DateTime, ForeignKey, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from db.postgres import Base
from datetime import datetime , timezone
import uuid

class Role(Base):
    __tablename__ = "roles"

    id = Column(UUID(as_uuid=True), primary_key = True , default= uuid.uuid4)
    name = Column(String(100), unique = True , nullable=False)
    
    users = relationship("User", back_populates="role")



class User(Base):
    __tablename__= "users"
    id = Column(UUID(as_uuid=True), primary_key = True , default= uuid.uuid4)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role_id = Column(UUID(as_uuid=True), ForeignKey("roles.id"), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    role = relationship("Role", back_populates="users")

class Executive(Base):
    __tablename__="executives"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

