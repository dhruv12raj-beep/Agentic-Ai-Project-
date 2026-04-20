from sqlalchemy import text 
import asyncio
import selectors
from db.postgres import engine , Base
from db.pg_models import Role , User , Executive


async def init():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        print("all tables  dropped and created successfully ")

asyncio.run(init())