from typing import List
from fastapi import APIRouter, Depends
from app.db.database import get_database
from app.schemas.amenity import AmenityResponse
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/amenities", tags=["Amenities"])

@router.get("", response_model=List[AmenityResponse])
async def list_amenities(current_user: dict = Depends(get_current_user)):
    """List all available society amenities and booking policies."""
    db = get_database()
    cursor = db.amenities.find().sort("name", 1)
    results = []
    async for a in cursor:
        results.append(AmenityResponse(
            id=a["id"],
            name=a["name"],
            description=a["description"],
            capacity=a["capacity"],
            deposit_amount=a["deposit_amount"],
            is_free=a["is_free"],
            allowed_slots=a.get("allowed_slots", [
                "06:00 AM - 08:00 AM",
                "04:00 PM - 06:00 PM",
                "06:00 PM - 09:00 PM",
                "09:00 PM - 11:30 PM"
            ])
        ))
    return results
