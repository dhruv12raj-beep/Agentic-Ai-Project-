import asyncio
from db.postgres import AsyncSessionLocal
from db.pg_models import Executive
from auth.auth_handler import hash_password

async def seed():
    async with AsyncSessionLocal() as session:
        executives = [ Executive(
                name="Alex Smith",
                email="dhruv12megh@gmail.com",
                password_hash=hash_password("exec1234"),
            )
            ]
        
        session.add_all(executives)
        await session.commit()
        print("Executives seeded successfully")

asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
asyncio.run(seed())