import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.db.database import connect_to_mongo, close_mongo_connection

# Routers
from app.routers import (
    auth,
    residents,
    family_members,
    flats,
    payments,
    complaints,
    gate_passes,
    amenities,
    bookings,
    notices,
    admin,
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("society_portal.main")

tags_metadata = [
    {
        "name": "Authentication",
        "description": "User authentication, JWT login tokens for residents and administrators, and active session profile lookup.",
    },
    {
        "name": "Residents",
        "description": "Resident profile management, occupant directory, and administrator unit assignment CRUD operations.",
    },
    {
        "name": "Flats",
        "description": "Apartment units registry, tower occupancy mapping, and parking bay allocations.",
    },
    {
        "name": "Payments & Maintenance",
        "description": "Maintenance bill generation, dues inspection, simulated payment processing, and ledger CSV exports.",
    },
    {
        "name": "Complaints & Tickets",
        "description": "Helpdesk ticketing system for electrical, plumbing, lift, and facility maintenance requests.",
    },
    {
        "name": "Visitor & Gate Passes",
        "description": "Authoritative gate-pass generation with unique security passcodes, QR verification, and visitor status tracking.",
    },
    {
        "name": "Amenities",
        "description": "Catalog of society facilities (Clubhouse Banquet, Tennis Court, Swimming Pool, BBQ Gazebo, Conference Room).",
    },
    {
        "name": "Amenity Bookings",
        "description": "Facility reservation management with backend double-booking conflict prevention.",
    },
    {
        "name": "Notices & Broadcasts",
        "description": "Official estate management announcements, urgent alerts, and noticeboard communications.",
    },
    {
        "name": "Admin Dashboard",
        "description": "Aggregated estate metrics, collection efficiency, occupancy rates, and society operations overview.",
    },
]

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing Society Management Portal Backend...")
    await connect_to_mongo()
    yield
    logger.info("Shutting down Society Management Portal Backend...")
    await close_mongo_connection()

app = FastAPI(
    title="The Society / Apartment Management Portal API",
    description="""
# 🏢 Maple Heights Society Management Portal - Backend API

Official REST API for the Society / Apartment Management Portal.
Built using **FastAPI**, **MongoDB (Motor Async)**, and **JWT Authentication**.

### Core Modules:
- **Authentication**: Role-based access control (Resident & Admin)
- **Resident & Flat Management**: Directory, occupancy status, parking allocations
- **Maintenance & Payments**: Monthly billing, simulated payment processing, ledger CSV export
- **Helpdesk & Complaints**: Facility maintenance requests with priority & resolution tracking
- **Visitor Gate-Passes**: Backend-generated QR security passcodes
- **Amenity Booking**: Facility reservations with slot conflict prevention
- **Broadcast Notices**: Digital society noticeboard with urgent alert broadcasting
- **Admin Operations**: Aggregated society analytics and statistics
    """,
    version="2.4.0",
    openapi_tags=tags_metadata,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS Configuration
allowed_origins = settings.cors_origins_list
if not allowed_origins or "*" in allowed_origins:
    allowed_origins = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://localhost:4173",
        "http://127.0.0.1:3000",
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(residents.router, prefix=settings.API_V1_STR)
app.include_router(family_members.router, prefix=settings.API_V1_STR)
app.include_router(flats.router, prefix=settings.API_V1_STR)
app.include_router(payments.router, prefix=settings.API_V1_STR)
app.include_router(complaints.router, prefix=settings.API_V1_STR)
app.include_router(gate_passes.router, prefix=settings.API_V1_STR)
app.include_router(amenities.router, prefix=settings.API_V1_STR)
app.include_router(bookings.router, prefix=settings.API_V1_STR)
app.include_router(notices.router, prefix=settings.API_V1_STR)
app.include_router(admin.router, prefix=settings.API_V1_STR)

@app.get("/", tags=["Health & Info"])
async def root_health():
    """Root healthcheck endpoint."""
    return {
        "status": "online",
        "project": "Society / Apartment Management Portal",
        "version": "2.4.0",
        "docs_url": "/docs",
        "database": "MongoDB"
    }

@app.get("/api/health", tags=["Health & Info"])
async def api_health():
    """API health status endpoint."""
    return {"status": "ok", "environment": settings.ENVIRONMENT}
