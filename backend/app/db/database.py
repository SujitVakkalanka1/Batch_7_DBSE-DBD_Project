import logging
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from app.core.config import settings

logger = logging.getLogger("society_portal.db")

class Database:
    client: AsyncIOMotorClient = None
    db: AsyncIOMotorDatabase = None

db_instance = Database()

async def connect_to_mongo():
    logger.info(f"Connecting to MongoDB at {settings.MONGODB_URI}...")
    db_instance.client = AsyncIOMotorClient(settings.MONGODB_URI)
    db_instance.db = db_instance.client[settings.DATABASE_NAME]
    logger.info(f"Connected to MongoDB database: {settings.DATABASE_NAME}")
    
    # Create required indexes
    await init_indexes()

async def close_mongo_connection():
    logger.info("Closing MongoDB connection...")
    if db_instance.client:
        db_instance.client.close()
        logger.info("MongoDB connection closed.")

async def init_indexes():
    """Ensure indexes exist for performance and integrity."""
    try:
        db = db_instance.db
        # Users indexes
        await db.users.create_index("email", unique=True, sparse=True)
        await db.users.create_index("phone", sparse=True)
        await db.users.create_index("unit", sparse=True)
        await db.users.create_index("role")

        # Flats indexes
        await db.flats.create_index("flat_number", unique=True)
        await db.flats.create_index("tower")

        # Payments indexes
        await db.payments.create_index("id", unique=True)
        await db.payments.create_index("resident_id")
        await db.payments.create_index("unit")
        await db.payments.create_index("status")
        await db.payments.create_index("bill_month")

        # Complaints indexes
        await db.complaints.create_index("id", unique=True)
        await db.complaints.create_index("resident_id")
        await db.complaints.create_index("status")
        await db.complaints.create_index("category")

        # Gate passes indexes
        await db.gate_passes.create_index("id", unique=True)
        await db.gate_passes.create_index("pass_code")
        await db.gate_passes.create_index("resident_id")
        await db.gate_passes.create_index("status")

        # Amenities indexes
        await db.amenities.create_index("name", unique=True)

        # Bookings indexes
        await db.bookings.create_index("id", unique=True)
        await db.bookings.create_index("resident_id")
        await db.bookings.create_index([("amenity_name", 1), ("date", 1), ("time_slot", 1)])

        # Notices indexes
        await db.notices.create_index("id", unique=True)
        await db.notices.create_index("priority")
        await db.notices.create_index("created_at")

        # Family members indexes
        await db.family_members.create_index("id", unique=True)
        await db.family_members.create_index("resident_id")
        await db.family_members.create_index("phone", sparse=True)
        await db.family_members.create_index("email", sparse=True)

        logger.info("MongoDB indexes verified successfully.")
    except Exception as e:
        logger.error(f"Error initializing indexes: {e}")

def get_database() -> AsyncIOMotorDatabase:
    return db_instance.db
