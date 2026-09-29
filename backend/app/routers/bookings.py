import random
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from app.db.database import get_database
from app.schemas.booking import BookingCreate, BookingStatusUpdate, BookingResponse
from app.services.auth_service import get_current_user, require_resident, require_admin

router = APIRouter(tags=["Amenity Bookings"])

@router.post("/bookings", response_model=BookingResponse, status_code=status.HTTP_201_CREATED)
async def create_booking(
    req: BookingCreate,
    current_user: dict = Depends(require_resident)
):
    """
    Resident: Reserve a society amenity.
    The backend prevents double-booking conflicts for the exact amenity, date, and time slot.
    """
    db = get_database()
    
    # Conflict check
    conflict = await db.bookings.find_one({
        "amenityName": req.amenityName,
        "date": req.date,
        "timeSlot": req.timeSlot,
        "status": {"$in": ["Confirmed", "Pending"]}
    })
    
    if conflict:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"The time slot '{req.timeSlot}' for '{req.amenityName}' on {req.date} is already reserved by {conflict.get('unit', 'another resident')}."
        )

    booking_id = f"BK-{random.randint(1000, 9999)}"
    while await db.bookings.find_one({"id": booking_id}):
        booking_id = f"BK-{random.randint(1000, 9999)}"

    # Determine amount
    amount = "₹5,000 (Refundable deposit)" if req.amenityName == "Clubhouse Banquet" else "₹0 (Complimentary)"
    
    doc = {
        "id": booking_id,
        "amenityName": req.amenityName,
        "date": req.date,
        "timeSlot": req.timeSlot,
        "unit": current_user.get("unit", "Tower B · Flat 704"),
        "resident_id": current_user["id"],
        "bookedBy": current_user["name"],
        "status": "Confirmed",
        "amount": amount,
        "created_at": datetime.now().isoformat(),
    }

    await db.bookings.insert_one(doc)
    return BookingResponse(**doc)

@router.get("/bookings/my", response_model=List[BookingResponse])
async def get_my_bookings(current_user: dict = Depends(require_resident)):
    """Resident: List their amenity bookings."""
    db = get_database()
    cursor = db.bookings.find({
        "$or": [
            {"resident_id": current_user["id"]},
            {"unit": current_user.get("unit", "")}
        ]
    }).sort("date", -1)

    results = []
    async for b in cursor:
        results.append(BookingResponse(
            id=b["id"],
            amenityName=b["amenityName"],
            date=b["date"],
            timeSlot=b["timeSlot"],
            unit=b["unit"],
            bookedBy=b["bookedBy"],
            status=b["status"],
            amount=b["amount"],
            created_at=b.get("created_at")
        ))
    return results

@router.get("/bookings/{id}", response_model=BookingResponse)
async def get_booking_details(id: str, current_user: dict = Depends(get_current_user)):
    """Get single booking details."""
    db = get_database()
    b = await db.bookings.find_one({"id": id})
    if not b:
        raise HTTPException(status_code=404, detail="Booking not found")

    return BookingResponse(
        id=b["id"],
        amenityName=b["amenityName"],
        date=b["date"],
        timeSlot=b["timeSlot"],
        unit=b["unit"],
        bookedBy=b["bookedBy"],
        status=b["status"],
        amount=b["amount"],
        created_at=b.get("created_at")
    )

@router.get("/admin/bookings", response_model=List[BookingResponse])
async def list_admin_bookings(
    amenity_name: Optional[str] = None,
    status_filter: Optional[str] = None,
    current_user: dict = Depends(require_admin)
):
    """Admin: View and manage all amenity bookings."""
    db = get_database()
    query = {}
    if amenity_name:
        query["amenityName"] = amenity_name
    if status_filter:
        query["status"] = status_filter

    cursor = db.bookings.find(query).sort("date", -1)
    results = []
    async for b in cursor:
        results.append(BookingResponse(
            id=b["id"],
            amenityName=b["amenityName"],
            date=b["date"],
            timeSlot=b["timeSlot"],
            unit=b["unit"],
            bookedBy=b["bookedBy"],
            status=b["status"],
            amount=b["amount"],
            created_at=b.get("created_at")
        ))
    return results

@router.patch("/admin/bookings/{id}/status", response_model=BookingResponse)
async def update_booking_status(
    id: str,
    req: BookingStatusUpdate,
    current_user: dict = Depends(require_admin)
):
    """Admin: Update status of amenity reservation."""
    db = get_database()
    b = await db.bookings.find_one_and_update(
        {"id": id},
        {"$set": {"status": req.status, "updated_at": datetime.now().isoformat()}},
        return_document=True
    )
    if not b:
        raise HTTPException(status_code=404, detail="Booking not found")

    return BookingResponse(
        id=b["id"],
        amenityName=b["amenityName"],
        date=b["date"],
        timeSlot=b["timeSlot"],
        unit=b["unit"],
        bookedBy=b["bookedBy"],
        status=b["status"],
        amount=b["amount"],
        created_at=b.get("created_at")
    )
