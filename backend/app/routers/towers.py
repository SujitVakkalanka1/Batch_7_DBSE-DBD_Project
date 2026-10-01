import uuid
from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from app.db.database import get_database
from app.schemas.tower import (
    TowerResponse,
    TowerCreate,
    TowerUpdate,
    TransferResidentRequest,
)
from app.schemas.user import UserProfileResponse
from app.services.auth_service import get_current_user, require_admin

router = APIRouter(prefix="/towers", tags=["Towers & Tower Management"])

DEFAULT_TOWERS = [
    {"id": "TOW-A", "name": "Tower A", "total_flats": 84, "floor_count": 14, "description": "Residential Tower A (14 Floors, 6 units/floor)"},
    {"id": "TOW-B", "name": "Tower B", "total_flats": 84, "floor_count": 14, "description": "Residential Tower B (14 Floors, 6 units/floor)"},
    {"id": "TOW-C", "name": "Tower C", "total_flats": 80, "floor_count": 16, "description": "Residential Tower C (16 Floors, 5 units/floor)"},
]

async def ensure_default_towers(db):
    """Ensure baseline towers exist in the collection."""
    count = await db.towers.count_documents({})
    if count == 0:
        for t in DEFAULT_TOWERS:
            await db.towers.update_one(
                {"id": t["id"]},
                {"$setOnInsert": t},
                upsert=True
            )

@router.get("", response_model=List[TowerResponse])
async def list_towers(current_user: dict = Depends(get_current_user)):
    """
    List all towers with dynamically calculated occupied flats, vacant flats,
    and occupancy/vacancy percentages based on active resident records.
    """
    db = get_database()
    await ensure_default_towers(db)

    cursor = db.towers.find({}).sort("name", 1)
    results = []
    
    async for tower in cursor:
        tower_name = tower.get("name", "Tower A")
        total_flats = tower.get("total_flats", 84)

        # Count active residents assigned to this tower
        # Check by tower field or unit string pattern
        occupied_count = await db.users.count_documents({
            "role": "resident",
            "status": {"$ne": "Inactive"},
            "$or": [
                {"tower": tower_name},
                {"unit": {"$regex": f"^{tower_name}", "$options": "i"}},
            ]
        })

        vacant_count = max(0, total_flats - occupied_count)
        occupancy_pct = round((occupied_count / total_flats) * 100) if total_flats > 0 else 0
        vacancy_pct = round((vacant_count / total_flats) * 100) if total_flats > 0 else 0

        results.append(TowerResponse(
            id=tower.get("id", str(tower.get("_id"))),
            name=tower_name,
            total_flats=total_flats,
            floor_count=tower.get("floor_count", 14),
            description=tower.get("description", ""),
            occupied_flats=occupied_count,
            vacant_flats=vacant_count,
            occupancy_rate=f"{occupancy_pct}%",
            vacancy_rate=f"{vacancy_pct}%",
        ))

    return results

@router.post("", response_model=TowerResponse, status_code=status.HTTP_201_CREATED)
async def create_tower(req: TowerCreate, current_user: dict = Depends(require_admin)):
    """Admin: Add a new tower with custom capacity and specifications."""
    db = get_database()
    
    # Check duplicate tower name
    existing = await db.towers.find_one({"name": {"$regex": f"^{req.name.strip()}$", "$options": "i"}})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Tower with name '{req.name.strip()}' already exists."
        )

    tower_id = f"TOW-{uuid.uuid4().hex[:6].upper()}"
    new_doc = {
        "id": tower_id,
        "name": req.name.strip(),
        "total_flats": req.total_flats,
        "floor_count": req.floor_count or 14,
        "description": req.description or "",
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat(),
    }
    await db.towers.insert_one(new_doc)

    return TowerResponse(
        id=tower_id,
        name=req.name.strip(),
        total_flats=req.total_flats,
        floor_count=req.floor_count or 14,
        description=req.description or "",
        occupied_flats=0,
        vacant_flats=req.total_flats,
        occupancy_rate="0%",
        vacancy_rate="100%",
    )

@router.put("/{tower_id}", response_model=TowerResponse)
async def update_tower(tower_id: str, req: TowerUpdate, current_user: dict = Depends(require_admin)):
    """Admin: Edit tower specifications, name, and total unit capacity."""
    db = get_database()
    existing = await db.towers.find_one({"$or": [{"id": tower_id}, {"name": tower_id}]})
    if not existing:
        raise HTTPException(status_code=404, detail=f"Tower '{tower_id}' not found.")

    update_fields = {}
    if req.name and req.name.strip():
        # Check duplicate if renaming
        dup = await db.towers.find_one({
            "name": {"$regex": f"^{req.name.strip()}$", "$options": "i"},
            "id": {"$ne": existing["id"]}
        })
        if dup:
            raise HTTPException(status_code=409, detail=f"A tower named '{req.name.strip()}' already exists.")
        
        old_name = existing.get("name")
        new_name = req.name.strip()
        update_fields["name"] = new_name

        # Cascade rename to residents if tower name changed
        if old_name != new_name:
            await db.users.update_many(
                {"tower": old_name},
                {"$set": {"tower": new_name}}
            )
            # Update flat records too
            await db.flats.update_many(
                {"tower": old_name},
                {"$set": {"tower": new_name}}
            )

    if req.total_flats is not None:
        update_fields["total_flats"] = req.total_flats
    if req.floor_count is not None:
        update_fields["floor_count"] = req.floor_count
    if req.description is not None:
        update_fields["description"] = req.description

    update_fields["updated_at"] = datetime.now().isoformat()

    updated = await db.towers.find_one_and_update(
        {"id": existing["id"]},
        {"$set": update_fields},
        return_document=True
    )

    # Compute live stats
    tower_name = updated.get("name")
    total_flats = updated.get("total_flats", 84)
    occupied_count = await db.users.count_documents({
        "role": "resident",
        "status": {"$ne": "Inactive"},
        "$or": [
            {"tower": tower_name},
            {"unit": {"$regex": f"^{tower_name}", "$options": "i"}},
        ]
    })
    vacant_count = max(0, total_flats - occupied_count)
    occupancy_pct = round((occupied_count / total_flats) * 100) if total_flats > 0 else 0
    vacancy_pct = round((vacant_count / total_flats) * 100) if total_flats > 0 else 0

    return TowerResponse(
        id=updated["id"],
        name=tower_name,
        total_flats=total_flats,
        floor_count=updated.get("floor_count", 14),
        description=updated.get("description", ""),
        occupied_flats=occupied_count,
        vacant_flats=vacant_count,
        occupancy_rate=f"{occupancy_pct}%",
        vacancy_rate=f"{vacancy_pct}%",
    )

@router.delete("/{tower_id}")
async def delete_tower(tower_id: str, current_user: dict = Depends(require_admin)):
    """Admin: Delete a tower."""
    db = get_database()
    tower = await db.towers.find_one({"$or": [{"id": tower_id}, {"name": tower_id}]})
    if not tower:
        raise HTTPException(status_code=404, detail="Tower not found.")

    tower_name = tower.get("name")
    # Check if there are active residents in this tower
    resident_count = await db.users.count_documents({
        "role": "resident",
        "$or": [
            {"tower": tower_name},
            {"unit": {"$regex": f"^{tower_name}", "$options": "i"}},
        ]
    })
    
    if resident_count > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot delete '{tower_name}' because it currently has {resident_count} registered resident(s). Please transfer them to another tower before deleting."
        )

    await db.towers.delete_one({"id": tower["id"]})
    return {"message": f"Tower '{tower_name}' deleted successfully.", "deleted_id": tower["id"]}

@router.post("/transfer", response_model=UserProfileResponse)
async def transfer_resident_tower(req: TransferResidentRequest, current_user: dict = Depends(require_admin)):
    """
    Admin: Transfer or reflect a resident from their current tower to another tower (e.g. Tower A to Tower B).
    Updates resident's tower, flat number, formatted unit string, and parking bay.
    """
    db = get_database()
    user = await db.users.find_one({"id": req.resident_id})
    if not user:
        raise HTTPException(status_code=404, detail="Resident not found.")

    target_tower = req.target_tower.strip()
    flat_num = req.target_flat.strip() if req.target_flat else user.get("flat_number", "101")
    new_unit = f"{target_tower} · Flat {flat_num}"
    
    tower_letter = target_tower.split()[-1] if len(target_tower.split()) > 1 else target_tower[:1]
    parking_bay = req.target_parking or f"Bay {tower_letter}-{flat_num} (Basement 1)"

    updated = await db.users.find_one_and_update(
        {"id": req.resident_id},
        {
            "$set": {
                "tower": target_tower,
                "flat_number": flat_num,
                "unit": new_unit,
                "parking_bay": parking_bay,
                "updated_at": datetime.now().isoformat(),
            }
        },
        return_document=True
    )

    # Sync flat records
    await db.flats.update_one(
        {"flat_number": flat_num, "tower": target_tower},
        {"$set": {"occupancy_status": "Occupied", "resident_id": req.resident_id, "tower": target_tower, "parking_bay": parking_bay}},
        upsert=True
    )

    return UserProfileResponse(
        id=updated["id"],
        role=updated["role"],
        name=updated["name"],
        initials=updated.get("initials", "SK"),
        residency=updated.get("residency", "Maple Heights Society"),
        unit=updated.get("unit", new_unit),
        tower=updated.get("tower", target_tower),
        flat_number=updated.get("flat_number", flat_num),
        email=updated["email"],
        phone=updated["phone"],
        resident_type=updated.get("resident_type", "Owner Resident"),
        parking_bay=updated.get("parking_bay", parking_bay),
        vehicle_number=updated.get("vehicle_number", ""),
        intercom_ext=updated.get("intercom_ext", f"Ext. {flat_num}"),
        status=updated.get("status", "Active"),
    )
