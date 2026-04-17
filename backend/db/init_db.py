from sqlalchemy import text 
import asyncio
import selectors
from db.postgres import engine , Base
from db.pg_models import Role , Department , User , Executive


async def init():
    async with engine.begin() as conn:
        await conn.execute(text('DROP TABLE IF EXISTS "Roles", "Users", "Departments", "Executives", roles, departments, "Users", "Executives" CASCADE;'))        
        await conn.run_sync(Base.metadata.create_all)
        print("all tables  dropped and created successfully ")

if __name__== "__main__":
    asyncio.run(init(),loop_factory=asyncio.SelectorEventLoop)