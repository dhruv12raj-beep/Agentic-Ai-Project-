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


if __name__ == "__main__":
    asyncio.run(seed(), loop_factory=asyncio.SelectorEventLoop)