import asyncio 
import selectors
from db.postgres import AsyncSessionLocal
from db.pg_models import Role

async def seed():
    async with AsyncSessionLocal() as session:
        customer_role = Role(name="customer")
        executive_role = Role(name="executive")
        session.add_all([customer_role, executive_role])
        await session.commit()
        print("Roles seeded successfully")


asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
asyncio.run(seed())