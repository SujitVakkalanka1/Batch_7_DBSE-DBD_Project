from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from app.db.database import get_database
from app.schemas.flat import FlatResponse, FlatCreate
from app.services.auth_service import get_current_user, require_admin

router = APIRouter(prefix="/flats", tags=["Flats"])

@router.get("", response_model=List[FlatResponse])
async def list_flats(
    tower: Optional[str] = None,
    occupancy_status: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """List flats with tower/occupancy filters."""
    db = get_database()
    query = {}
    if tower:
        query["tower"] = tower
    if occupancy_status:
        query["occupancy_status"] = occupancy_status
        
    cursor = db.flats.find(query).sort("flat_number", 1)
    results = []
    async for f in cursor:
        resident_name = None
        resident_phone = None
        if f.get("resident_id"):
            u = await db.users.find_one({"id": f["resident_id"]})
            if u:
                resident_name = u.get("name")
                resident_phone = u.get("phone")
        
        results.append(FlatResponse(
            id=str(f["_id"]),
            flat_number=f["flat_number"],
            tower=f["tower"],
            floor=f.get("floor", 1),
            occupancy_status=f.get("occupancy_status", "Occupied"),
            parking_bay=f.get("parking_bay"),
            resident_id=f.get("resident_id"),
            resident_name=resident_name,
            resident_phone=resident_phone,
        ))
    return results

@router.get("/{flat_number}", response_model=FlatResponse)
async def get_flat(flat_number: str, current_user: dict = Depends(get_current_user)):
    """Get details of a specific flat."""
    db = get_database()
    f = await db.flats.find_one({"flat_number": flat_number})
    if not f:
        raise HTTPException(status_code=404, detail=f"Flat {flat_number} not found")
    
    resident_name = None
    resident_phone = None
    if f.get("resident_id"):
        u = await db.users.find_one({"id": f["resident_id"]})
        if u:
            resident_name = u.get("name")
            resident_phone = u.get("phone")

    return FlatResponse(
        id=str(f["_id"]),
        flat_number=f["flat_number"],
        tower=f["tower"],
        floor=f.get("floor", 1),
        occupancy_status=f.get("occupancy_status", "Occupied"),
        parking_bay=f.get("parking_bay"),
        resident_id=f.get("resident_id"),
        resident_name=resident_name,
        resident_phone=resident_phone,
    )
