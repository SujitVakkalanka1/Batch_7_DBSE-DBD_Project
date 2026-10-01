import asyncio
import logging
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings
from app.core.security import get_password_hash

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("society_portal.seed")

async def seed_database():
    logger.info(f"Connecting to MongoDB at {settings.MONGODB_URI} for seeding...")
    client = AsyncIOMotorClient(settings.MONGODB_URI)
    db = client[settings.DATABASE_NAME]

    # Clean existing demo data safely
    logger.info("Resetting collections with fresh demo seed data...")
    await db.users.delete_many({})
    await db.flats.delete_many({})
    await db.family_members.delete_many({})
    await db.payments.delete_many({})
    await db.complaints.delete_many({})
    await db.gate_passes.delete_many({})
    await db.amenities.delete_many({})
    await db.bookings.delete_many({})
    await db.notices.delete_many({})
    await db.towers.delete_many({})

    # 0. Towers
    towers_data = [
        {"id": "TOW-A", "name": "Tower A", "total_flats": 84, "floor_count": 14, "description": "Residential Tower A (14 Floors, 6 units/floor)"},
        {"id": "TOW-B", "name": "Tower B", "total_flats": 84, "floor_count": 14, "description": "Residential Tower B (14 Floors, 6 units/floor)"},
        {"id": "TOW-C", "name": "Tower C", "total_flats": 80, "floor_count": 16, "description": "Residential Tower C (16 Floors, 5 units/floor)"},
    ]
    await db.towers.insert_many(towers_data)
    logger.info(f"Inserted {len(towers_data)} towers.")

    # 1. Users
    users_data = [
        {
            "id": "USR-ADMIN-01",
            "role": "admin",
            "name": "Maple Heights Admin",
            "initials": "ADM",
            "residency": "Maple Heights Society",
            "unit": "Admin Console · 248 Homes",
            "email": "admin@mapleheights.org",
            "phone": "+91 99887 76655",
            "resident_type": "Society Board",
            "parking_bay": "Admin Reserved Bay",
            "vehicle_number": "MH-02-AD-0001",
            "intercom_ext": "Ext. 100",
            "status": "Active",
            "hashed_password": get_password_hash("admin123"),
            "created_at": datetime.now().isoformat()
        },
        {
            "id": "USR-RES-704",
            "role": "resident",
            "name": "Sujit",
            "initials": "SK",
            "residency": "Maple Heights Society",
            "unit": "Tower B · Flat 704",
            "email": "sujit.k@courtyard.live",
            "phone": "+91 98765 43210",
            "resident_type": "Owner Resident",
            "parking_bay": "Bay B-21 (Basement 1)",
            "vehicle_number": "MH-02-CD-8842 (Sedan)",
            "intercom_ext": "Ext. 704",
            "status": "Active",
            "hashed_password": get_password_hash("123456"),
            "created_at": datetime.now().isoformat()
        },
        {
            "id": "USR-RES-101",
            "role": "resident",
            "name": "Dr. Vikram Mehra",
            "initials": "VM",
            "residency": "Maple Heights Society",
            "unit": "Tower A · Flat 101",
            "email": "vikram.m@mapleheights.org",
            "phone": "+91 98201 11223",
            "resident_type": "Owner Resident",
            "parking_bay": "Bay A-04 (Basement 1)",
            "vehicle_number": "MH-02-EF-1010",
            "intercom_ext": "Ext. 101",
            "status": "Active",
            "hashed_password": get_password_hash("123456"),
            "created_at": datetime.now().isoformat()
        },
        {
            "id": "USR-RES-204",
            "role": "resident",
            "name": "Pooja Agarwal",
            "initials": "PA",
            "residency": "Maple Heights Society",
            "unit": "Tower A · Flat 204",
            "email": "pooja.a@mapleheights.org",
            "phone": "+91 98202 22334",
            "resident_type": "Owner Resident",
            "parking_bay": "Bay A-18 (Basement 1)",
            "vehicle_number": "MH-02-GH-2040",
            "intercom_ext": "Ext. 204",
            "status": "Active",
            "hashed_password": get_password_hash("123456"),
            "created_at": datetime.now().isoformat()
        },
        {
            "id": "USR-RES-705",
            "role": "resident",
            "name": "Amitabh Sen",
            "initials": "AS",
            "residency": "Maple Heights Society",
            "unit": "Tower B · Flat 705",
            "email": "amitabh.s@mapleheights.org",
            "phone": "+91 98203 33445",
            "resident_type": "Tenant Resident",
            "parking_bay": "Bay B-22 (Basement 1)",
            "vehicle_number": "MH-02-IJ-7050",
            "intercom_ext": "Ext. 705",
            "status": "Active",
            "hashed_password": get_password_hash("123456"),
            "created_at": datetime.now().isoformat()
        },
        {
            "id": "USR-RES-302",
            "role": "resident",
            "name": "Kavita Nair",
            "initials": "KN",
            "residency": "Maple Heights Society",
            "unit": "Tower C · Flat 302",
            "email": "kavita.n@mapleheights.org",
            "phone": "+91 98204 44556",
            "resident_type": "Owner Resident",
            "parking_bay": "Bay C-12 (Basement 2)",
            "vehicle_number": "MH-02-KL-3020",
            "intercom_ext": "Ext. 302",
            "status": "Active",
            "hashed_password": get_password_hash("123456"),
            "created_at": datetime.now().isoformat()
        },
        {
            "id": "USR-RES-901",
            "role": "resident",
            "name": "Rohit Deshmukh",
            "initials": "RD",
            "residency": "Maple Heights Society",
            "unit": "Tower C · Flat 901",
            "email": "rohit.d@mapleheights.org",
            "phone": "+91 98205 55667",
            "resident_type": "Owner Resident",
            "parking_bay": "Bay C-25 (Basement 2)",
            "vehicle_number": "MH-02-MN-9010",
            "intercom_ext": "Ext. 901",
            "status": "Active",
            "hashed_password": get_password_hash("123456"),
            "created_at": datetime.now().isoformat()
        }
    ]
    await db.users.insert_many(users_data)
    logger.info(f"Inserted {len(users_data)} users.")

    # 2. Flats
    flats_data = [
        {"flat_number": "A-101", "tower": "Tower A", "floor": 1, "occupancy_status": "Occupied", "parking_bay": "Bay A-04", "resident_id": "USR-RES-101"},
        {"flat_number": "A-204", "tower": "Tower A", "floor": 2, "occupancy_status": "Occupied", "parking_bay": "Bay A-18", "resident_id": "USR-RES-204"},
        {"flat_number": "B-704", "tower": "Tower B", "floor": 7, "occupancy_status": "Occupied", "parking_bay": "Bay B-21", "resident_id": "USR-RES-704"},
        {"flat_number": "B-705", "tower": "Tower B", "floor": 7, "occupancy_status": "Occupied", "parking_bay": "Bay B-22", "resident_id": "USR-RES-705"},
        {"flat_number": "C-302", "tower": "Tower C", "floor": 3, "occupancy_status": "Occupied", "parking_bay": "Bay C-12", "resident_id": "USR-RES-302"},
        {"flat_number": "C-901", "tower": "Tower C", "floor": 9, "occupancy_status": "Occupied", "parking_bay": "Bay C-25", "resident_id": "USR-RES-901"},
    ]
    await db.flats.insert_many(flats_data)
    logger.info(f"Inserted {len(flats_data)} flats.")

    # 3. Family Members
    family_members_data = [
        {
            "id": "FAM-704-01",
            "resident_id": "USR-RES-704",
            "name": "Ananya Vakkalanka",
            "relationship": "Spouse",
            "age": 28,
            "phone": "+91 98765 43211",
            "email": "ananya.v@courtyard.live",
            "gender": "Female",
            "emergency_contact": True,
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat(),
        },
        {
            "id": "FAM-704-02",
            "resident_id": "USR-RES-704",
            "name": "Aarav Vakkalanka",
            "relationship": "Son",
            "age": 4,
            "phone": None,
            "email": None,
            "gender": "Male",
            "emergency_contact": False,
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat(),
        },
        {
            "id": "FAM-101-01",
            "resident_id": "USR-RES-101",
            "name": "Dr. Sunita Mehra",
            "relationship": "Spouse",
            "age": 46,
            "phone": "+91 98201 11224",
            "email": "sunita.m@mapleheights.org",
            "gender": "Female",
            "emergency_contact": True,
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat(),
        },
        {
            "id": "FAM-101-02",
            "resident_id": "USR-RES-101",
            "name": "Rohan Mehra",
            "relationship": "Son",
            "age": 19,
            "phone": "+91 98201 11225",
            "email": "rohan.m@mapleheights.org",
            "gender": "Male",
            "emergency_contact": False,
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat(),
        },
        {
            "id": "FAM-204-01",
            "resident_id": "USR-RES-204",
            "name": "Rahul Sharma",
            "relationship": "Brother",
            "age": 22,
            "phone": "+91 98765 43210",
            "email": "rahul.s@mapleheights.org",
            "gender": "Male",
            "emergency_contact": True,
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat(),
        },
    ]
    await db.family_members.insert_many(family_members_data)
    logger.info(f"Inserted {len(family_members_data)} family members.")

    # 4. Payments
    payments_data = [
        {
            "id": "PAY-SEP-26",
            "billMonth": "September 2026",
            "amount": "₹4,850",
            "dueDate": "10 Sep 2026",
            "paidDate": None,
            "status": "Pending",
            "unit": "Tower B · Flat 704",
            "resident_id": "USR-RES-704",
            "resident_name": "Sujit Kumar",
            "breakdown": {
                "maintenance": "₹3,500",
                "sinkingFund": "₹600",
                "waterCharges": "₹450",
                "parkingCharges": "₹300"
            },
            "created_at": datetime.now().isoformat()
        },
        {
            "id": "PAY-AUG-26",
            "billMonth": "August 2026",
            "amount": "₹4,850",
            "dueDate": "10 Aug 2026",
            "paidDate": "04 Aug 2026",
            "status": "Paid",
            "unit": "Tower B · Flat 704",
            "resident_id": "USR-RES-704",
            "resident_name": "Sujit Kumar",
            "transaction_id": "TXN-AUG-883192",
            "payment_method": "upi",
            "breakdown": {
                "maintenance": "₹3,500",
                "sinkingFund": "₹600",
                "waterCharges": "₹450",
                "parkingCharges": "₹300"
            },
            "created_at": datetime.now().isoformat()
        },
        {
            "id": "PAY-JUL-26",
            "billMonth": "July 2026",
            "amount": "₹4,850",
            "dueDate": "10 Jul 2026",
            "paidDate": "02 Jul 2026",
            "status": "Paid",
            "unit": "Tower B · Flat 704",
            "resident_id": "USR-RES-704",
            "resident_name": "Sujit Kumar",
            "transaction_id": "TXN-JUL-110293",
            "payment_method": "card",
            "breakdown": {
                "maintenance": "₹3,500",
                "sinkingFund": "₹600",
                "waterCharges": "₹450",
                "parkingCharges": "₹300"
            },
            "created_at": datetime.now().isoformat()
        },
        {
            "id": "PAY-B705-SEP-26",
            "billMonth": "September 2026",
            "amount": "₹4,850",
            "dueDate": "10 Sep 2026",
            "paidDate": None,
            "status": "Pending",
            "unit": "Tower B · Flat 705",
            "resident_id": "USR-RES-705",
            "resident_name": "Amitabh Sen",
            "breakdown": {
                "maintenance": "₹3,500",
                "sinkingFund": "₹600",
                "waterCharges": "₹450",
                "parkingCharges": "₹300"
            },
            "created_at": datetime.now().isoformat()
        },
        {
            "id": "PAY-C901-SEP-26",
            "billMonth": "September 2026",
            "amount": "₹9,700",
            "dueDate": "10 Sep 2026",
            "paidDate": None,
            "status": "Pending",
            "unit": "Tower C · Flat 901",
            "resident_id": "USR-RES-901",
            "resident_name": "Rohit Deshmukh",
            "breakdown": {
                "maintenance": "₹7,000",
                "sinkingFund": "₹1,200",
                "waterCharges": "₹900",
                "parkingCharges": "₹600"
            },
            "created_at": datetime.now().isoformat()
        }
    ]
    await db.payments.insert_many(payments_data)
    logger.info(f"Inserted {len(payments_data)} payments.")

    # 4. Complaints
    complaints_data = [
        {
            "id": "TKT-1082",
            "title": "Corridor emergency light flickering on 7th Floor",
            "category": "Electrical",
            "status": "In Progress",
            "unit": "Tower B · Flat 704",
            "resident_id": "USR-RES-704",
            "submittedBy": "Sujit Kumar",
            "date": "08 Sep 2026",
            "urgency": "Medium",
            "description": "The ceiling LED panel outside Flat 704 and 705 blinks continuously after 7 PM.",
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        },
        {
            "id": "TKT-1079",
            "title": "Water seepage near utility balcony pipe",
            "category": "Plumbing",
            "status": "Pending",
            "unit": "Tower B · Flat 704",
            "resident_id": "USR-RES-704",
            "submittedBy": "Sujit Kumar",
            "date": "06 Sep 2026",
            "urgency": "High",
            "description": "Minor moisture observed around the rainwater drainage junction.",
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        },
        {
            "id": "TKT-1065",
            "title": "Intercom speaker crackling during security calls",
            "category": "Lift / Common Area",
            "status": "Resolved",
            "unit": "Tower B · Flat 704",
            "resident_id": "USR-RES-704",
            "submittedBy": "Sujit Kumar",
            "date": "28 Aug 2026",
            "urgency": "Low",
            "description": "Replaced receiver module on 29 Aug. Working smoothly.",
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        },
        {
            "id": "TKT-1050",
            "title": "Tower A Lift 2 slow door sensor response",
            "category": "Lift / Common Area",
            "status": "Resolved",
            "unit": "Tower A · Flat 302",
            "resident_id": "USR-RES-101",
            "submittedBy": "Ramesh Sharma",
            "date": "25 Aug 2026",
            "urgency": "High",
            "description": "Technician recalibrated the optical obstruction sensor.",
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        }
    ]
    await db.complaints.insert_many(complaints_data)
    logger.info(f"Inserted {len(complaints_data)} complaints.")

    # 5. Gate Passes
    gate_passes_data = [
        {
            "id": "GP-8831",
            "visitorName": "Amazon Logistics (Delivery)",
            "visitorPhone": "+91 98112 34567",
            "purpose": "Delivery",
            "unit": "Tower B · Flat 704",
            "resident_id": "USR-RES-704",
            "validDate": "Today",
            "validTime": "10:00 AM - 08:00 PM",
            "passCode": "942-883",
            "status": "Active",
            "created_at": datetime.now().isoformat()
        },
        {
            "id": "GP-8812",
            "visitorName": "Dr. Ananya Sen (Guest)",
            "visitorPhone": "+91 97234 56789",
            "purpose": "Guest",
            "unit": "Tower B · Flat 704",
            "resident_id": "USR-RES-704",
            "validDate": "07 Sep 2026",
            "validTime": "06:00 PM - 11:00 PM",
            "passCode": "715-204",
            "status": "Used",
            "created_at": datetime.now().isoformat()
        }
    ]
    await db.gate_passes.insert_many(gate_passes_data)
    logger.info(f"Inserted {len(gate_passes_data)} gate passes.")

    # 6. Amenities
    amenities_data = [
        {
            "id": "AMN-01",
            "name": "Clubhouse Banquet",
            "description": "Grand multi-purpose hall with audio system & stage, max 120 guests",
            "capacity": "120 Guests",
            "deposit_amount": "₹5,000",
            "is_free": False,
            "allowed_slots": ["06:00 PM - 11:00 PM", "10:00 AM - 03:00 PM"]
        },
        {
            "id": "AMN-02",
            "name": "Tennis Court",
            "description": "Synthetic surface tennis court with floodlights",
            "capacity": "4 Players",
            "deposit_amount": "₹0",
            "is_free": True,
            "allowed_slots": ["06:00 AM - 08:00 AM", "04:00 PM - 06:00 PM", "06:00 PM - 09:00 PM"]
        },
        {
            "id": "AMN-03",
            "name": "Swimming Pool",
            "description": "Olympic-sized temperature-controlled pool with lifeguard",
            "capacity": "25 Swimmers",
            "deposit_amount": "₹0",
            "is_free": True,
            "allowed_slots": ["06:00 AM - 09:00 AM", "05:00 PM - 09:00 PM"]
        },
        {
            "id": "AMN-04",
            "name": "BBQ Gazebo",
            "description": "Open-air grill station and dining deck on rooftop",
            "capacity": "15 Guests",
            "deposit_amount": "₹0",
            "is_free": True,
            "allowed_slots": ["06:00 PM - 09:00 PM", "09:00 PM - 11:30 PM"]
        },
        {
            "id": "AMN-05",
            "name": "Conference Room",
            "description": "High-tech business center room with projector and 4K screen",
            "capacity": "12 Persons",
            "deposit_amount": "₹0",
            "is_free": True,
            "allowed_slots": ["09:00 AM - 01:00 PM", "02:00 PM - 06:00 PM", "06:00 PM - 09:00 PM"]
        }
    ]
    await db.amenities.insert_many(amenities_data)
    logger.info(f"Inserted {len(amenities_data)} amenities.")

    # 7. Bookings
    bookings_data = [
        {
            "id": "BK-4421",
            "amenityName": "Tennis Court",
            "date": "2026-09-12",
            "timeSlot": "07:00 AM - 08:00 AM",
            "unit": "Tower B · Flat 704",
            "resident_id": "USR-RES-704",
            "bookedBy": "Sujit Kumar",
            "status": "Confirmed",
            "amount": "₹0 (Free amenity)",
            "created_at": datetime.now().isoformat()
        },
        {
            "id": "BK-4390",
            "amenityName": "Clubhouse Banquet",
            "date": "2026-09-27",
            "timeSlot": "06:00 PM - 11:00 PM",
            "unit": "Tower B · Flat 704",
            "resident_id": "USR-RES-704",
            "bookedBy": "Sujit Kumar",
            "status": "Pending",
            "amount": "₹5,000 (Deposit)",
            "created_at": datetime.now().isoformat()
        }
    ]
    await db.bookings.insert_many(bookings_data)
    logger.info(f"Inserted {len(bookings_data)} bookings.")

    # 8. Notices
    notices_data = [
        {
            "id": "ann-1",
            "eyebrow": "NOTICE · RESIDENTS",
            "title": "Water tank cleaning scheduled this Saturday",
            "body": "The main overhead tanks in Towers A, B, and C will be undergoing routine chemical disinfection this Saturday from 10:00 AM to 3:00 PM. Water pressure may be low during this window. Please store adequate drinking water in advance.",
            "timestamp": "12M AGO",
            "cta": "Read full advisory",
            "priority": "urgent",
            "date": "Saturday, 13 Sep",
            "author": "Estate Management Office",
            "target_audience": "All Residents",
            "created_at": datetime.now().isoformat()
        },
        {
            "id": "ann-2",
            "eyebrow": "EVENT · COMMUNITY",
            "title": "Autumn Garden Festival & Children Painting Workshop",
            "body": "Join fellow residents at the Central Courtyard Lawn for an evening of festive music, organic produce stalls, and painting games for kids. Entry is complimentary for all residents.",
            "timestamp": "2H AGO",
            "cta": "View details",
            "priority": "normal",
            "date": "Sunday, 21 Sep",
            "author": "Cultural Committee",
            "target_audience": "All Residents",
            "created_at": datetime.now().isoformat()
        },
        {
            "id": "ann-3",
            "eyebrow": "SECURITY · ADVISORY",
            "title": "EV Charging Station Bay 4 maintenance completed",
            "body": "Fast Charger #02 at Basement Level 1 has been recalibrated and is now online for all registered resident EV vehicles via RFID tap.",
            "timestamp": "1D AGO",
            "cta": "View status",
            "priority": "normal",
            "date": "Wednesday, 08 Sep",
            "author": "Security & Facilities",
            "target_audience": "All Residents",
            "created_at": datetime.now().isoformat()
        },
        {
            "id": "adm-ann-1",
            "eyebrow": "BROADCAST · ADMIN",
            "title": "Quarterly maintenance reconciliation report ready",
            "body": "Financial report for Q3 ending August has been generated with 82% collection efficiency. 18 units have outstanding dues past 60 days.",
            "timestamp": "UPDATED 28M AGO",
            "cta": "Open review",
            "priority": "urgent",
            "date": "Today, 09 Sep",
            "author": "Accounts Desk",
            "target_audience": "Management Committee",
            "created_at": datetime.now().isoformat()
        }
    ]
    await db.notices.insert_many(notices_data)
    logger.info(f"Inserted {len(notices_data)} notices.")

    client.close()
    logger.info("Database seeding successfully completed!")

if __name__ == "__main__":
    asyncio.run(seed_database())
