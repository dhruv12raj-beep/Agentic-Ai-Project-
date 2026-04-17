from sqlalchemy.ext.asyncio import create_async_engine , AsyncSession
from config import POSTGRES_URL
from sqlalchemy.orm import sessionmaker, DeclarativeBase

engine = create_async_engine(POSTGRES_URL, echo = True)

AsyncSessionLocal = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False
)

class Base(DeclarativeBase):
    pass

async def get_db():
    async with AsyncSessionLocal as session:
        yield session

    