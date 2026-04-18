from sqlalchemy import text 
import asyncio
import selectors
from db.postgres import engine , Base
from db.pg_models import Role , User , Executive


async def init():
    async with engine.begin() as conn:
        await conn.execute(text('DROP TABLE IF EXISTS "Roles", "Users", "Departments", "Executives", roles, departments, "Users", "Executives" CASCADE;'))        
        await conn.run_sync(Base.metadata.create_all)
        print("all tables  dropped and created successfully ")

asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
asyncio.run(init())