import uuid
from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from app.db.database import get_database
from app.schemas.user import (
    UserProfileResponse,
    ResidentDirectoryItem,
    UserCreate,
    UserUpdate,
    ResidentStatusUpdate,
    ResidentDetailResponse,
)
from app.schemas.family_member import FamilyMemberResponse
from app.services.auth_service import get_current_user, require_admin, require_resident
from app.core.security import get_password_hash

router = APIRouter(tags=["Residents & Resident Management"])

@router.get("/residents/me", response_model=UserProfileResponse)
async def get_my_resident_profile(current_user: dict = Depends(require_resident)):
    """Get authenticated resident's detailed profile."""
    return UserProfileResponse(
        id=current_user["id"],
        role=current_user["role"],
        name=current_user["name"],
        initials=current_user.get("initials", "SK"),
        residency=current_user.get("residency", "Maple Heights Society"),
        unit=current_user.get("unit", "Tower B · Flat 704"),
        tower=current_user.get("tower", "Tower B"),
        flat_number=current_user.get("flat_number", "704"),
        email=current_user["email"],
        phone=current_user["phone"],
        resident_type=current_user.get("resident_type", "Owner Resident"),
        parking_bay=current_user.get("parking_bay", "Bay B-21 (Basement 1)"),
        vehicle_number=current_user.get("vehicle_number", "MH-02-CD-8842"),
        intercom_ext=current_user.get("intercom_ext", "Ext. 704"),
        status=current_user.get("status", "Active"),
    )

@router.get("/residents", response_model=List[ResidentDirectoryItem])
@router.get("/admin/residents", response_model=List[ResidentDirectoryItem])
async def list_residents(
    search: Optional[str] = None,
    tower: Optional[str] = None,
    status_filter: Optional[str] = None,
    current_user: dict = Depends(require_admin)
):
    """Admin: List all residents with dues status, tower filter, status filter, and family count."""
    db = get_database()
    query = {"role": "resident"}
    
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"unit": {"$regex": search, "$options": "i"}},
            {"phone": {"$regex": search, "$options": "i"}},
            {"email": {"$regex": search, "$options": "i"}},
        ]
    
    if tower and tower != "All":
        query["$or"] = [
            {"tower": tower},
            {"unit": {"$regex": tower, "$options": "i"}}
        ]

    if status_filter and status_filter != "All":
        query["status"] = status_filter
    
    cursor = db.users.find(query).sort("unit", 1)
    results = []
    async for u in cursor:
        # Check pending dues
        pending_payment = await db.payments.find_one({
            "resident_id": u["id"],
            "status": "Pending"
        })
        dues_status = f"Due ({pending_payment['amount']})" if pending_payment else "Dues Cleared"

        # Count family members
        fam_count = await db.family_members.count_documents({"resident_id": u["id"]})
        
        results.append(ResidentDirectoryItem(
            id=u["id"],
            unit=u.get("unit", "Unassigned"),
            tower=u.get("tower"),
            flat_number=u.get("flat_number"),
            name=u["name"],
            phone=u["phone"],
            email=u["email"],
            status=dues_status,
            account_status=u.get("status", "Active"),
            resident_type=u.get("resident_type", "Owner Resident"),
            family_count=fam_count,
        ))
    return results

@router.get("/residents/{id}", response_model=ResidentDetailResponse)
@router.get("/admin/residents/{id}", response_model=ResidentDetailResponse)
async def get_resident_by_id(id: str, current_user: dict = Depends(require_admin)):
    """Admin: View a specific resident by ID along with their registered family members."""
    db = get_database()
    user = await db.users.find_one({"id": id})
    if not user:
        raise HTTPException(status_code=404, detail="Resident not found")
    
    # Check dues
    pending_payment = await db.payments.find_one({
        "resident_id": user["id"],
        "status": "Pending"
    })
    dues_status = f"Due ({pending_payment['amount']})" if pending_payment else "Dues Cleared"

    # Fetch family members
    fam_cursor = db.family_members.find({"resident_id": user["id"]}).sort("created_at", -1)
    family_members = []
    async for fm in fam_cursor:
        family_members.append(FamilyMemberResponse(
            id=fm["id"],
            resident_id=fm["resident_id"],
            name=fm["name"],
            relationship=fm["relationship"],
            age=fm.get("age"),
            phone=fm.get("phone"),
            email=fm.get("email"),
            gender=fm.get("gender"),
            emergency_contact=fm.get("emergency_contact", False),
            created_at=fm.get("created_at"),
            updated_at=fm.get("updated_at"),
        ))

    return ResidentDetailResponse(
        id=user["id"],
        role=user["role"],
        name=user["name"],
        initials=user.get("initials", "SK"),
        residency=user.get("residency", "Maple Heights Society"),
        unit=user.get("unit", ""),
        tower=user.get("tower"),
        flat_number=user.get("flat_number"),
        email=user["email"],
        phone=user["phone"],
        resident_type=user.get("resident_type", "Owner Resident"),
        parking_bay=user.get("parking_bay", "Bay B-21 (Basement 1)"),
        vehicle_number=user.get("vehicle_number", "MH-02-CD-8842"),
        intercom_ext=user.get("intercom_ext", "Ext. 704"),
        status=user.get("status", "Active"),
        family_members=family_members,
        dues_status=dues_status,
    )

@router.post("/residents", response_model=UserProfileResponse, status_code=status.HTTP_201_CREATED)
@router.post("/admin/residents", response_model=UserProfileResponse, status_code=status.HTTP_201_CREATED)
async def create_resident(req: UserCreate, current_user: dict = Depends(require_admin)):
    """Admin: Register a new resident, validate uniqueness and assign unit."""
    db = get_database()
    
    # Check duplicate email
    existing_email = await db.users.find_one({"email": req.email.strip().lower()})
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"A resident with email '{req.email}' is already registered."
        )

    # Check duplicate phone
    if req.phone:
        existing_phone = await db.users.find_one({"phone": req.phone.strip()})
        if existing_phone:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"A resident with phone number '{req.phone}' already exists."
            )

    new_id = f"USR-RES-{uuid.uuid4().hex[:5].upper()}"
    initials = "".join([part[0].upper() for part in req.name.split() if part])[:2] or "RS"
    
    # Format unit string e.g. "Tower B · Flat 704"
    tower = req.tower or ("Tower B" if not req.unit else req.unit.split("·")[0].strip())
    flat_num = req.flat_number or (req.unit.split("·")[-1].replace("Flat", "").strip() if req.unit and "·" in req.unit else "101")
    unit_fmt = f"{tower} · Flat {flat_num}" if not req.unit else req.unit

    doc = {
        "id": new_id,
        "role": "resident",
        "name": req.name.strip(),
        "initials": req.initials or initials,
        "residency": req.residency or "Maple Heights Society",
        "unit": unit_fmt,
        "tower": tower,
        "flat_number": flat_num,
        "email": req.email.strip().lower(),
        "phone": req.phone.strip(),
        "resident_type": req.resident_type or "Owner Resident",
        "parking_bay": req.parking_bay or f"Bay {flat_num} (Basement 1)",
        "vehicle_number": req.vehicle_number or "NA",
        "intercom_ext": req.intercom_ext or f"Ext. {flat_num}",
        "status": req.status or "Active",
        "hashed_password": get_password_hash(req.password or "123456"),
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat(),
    }
    
    await db.users.insert_one(doc)

    # Sync flat occupancy
    await db.flats.update_one(
        {"flat_number": flat_num},
        {"$set": {"occupancy_status": "Occupied", "resident_id": new_id, "tower": tower}},
        upsert=True
    )

    return UserProfileResponse(**doc)

@router.put("/residents/{id}", response_model=UserProfileResponse)
@router.put("/admin/residents/{id}", response_model=UserProfileResponse)
async def update_resident(id: str, req: UserUpdate, current_user: dict = Depends(require_admin)):
    """Admin: Edit resident profile and flat assignments."""
    db = get_database()
    update_data = {k: v for k, v in req.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")

    # If updating email, ensure no collision with another resident
    if "email" in update_data and update_data["email"]:
        existing = await db.users.find_one({"email": update_data["email"].strip().lower(), "id": {"$ne": id}})
        if existing:
            raise HTTPException(status_code=409, detail=f"Email '{update_data['email']}' is already in use by another resident.")

    # Reconstruct unit string if tower/flat changed
    if "tower" in update_data or "flat_number" in update_data:
        current_u = await db.users.find_one({"id": id})
        if current_u:
            tower = update_data.get("tower", current_u.get("tower", "Tower B"))
            flat_num = update_data.get("flat_number", current_u.get("flat_number", "704"))
            update_data["unit"] = f"{tower} · Flat {flat_num}"

    update_data["updated_at"] = datetime.now().isoformat()
    
    res = await db.users.find_one_and_update(
        {"id": id},
        {"$set": update_data},
        return_document=True
    )
    if not res:
        raise HTTPException(status_code=404, detail="Resident not found")

    return UserProfileResponse(
        id=res["id"],
        role=res["role"],
        name=res["name"],
        initials=res.get("initials", "SK"),
        residency=res.get("residency", "Maple Heights Society"),
        unit=res.get("unit", ""),
        tower=res.get("tower"),
        flat_number=res.get("flat_number"),
        email=res["email"],
        phone=res["phone"],
        resident_type=res.get("resident_type", "Owner Resident"),
        parking_bay=res.get("parking_bay", ""),
        vehicle_number=res.get("vehicle_number", ""),
        intercom_ext=res.get("intercom_ext", ""),
        status=res.get("status", "Active"),
    )

@router.patch("/residents/{id}/status", response_model=UserProfileResponse)
@router.patch("/admin/residents/{id}/status", response_model=UserProfileResponse)
async def update_resident_status(
    id: str,
    req: ResidentStatusUpdate,
    current_user: dict = Depends(require_admin)
):
    """
    Admin: Soft-deactivate or reactivate a resident account.
    Historical payments, complaints, bookings, and gate passes remain intact.
    """
    db = get_database()
    res = await db.users.find_one_and_update(
        {"id": id},
        {"$set": {"status": req.status, "updated_at": datetime.now().isoformat()}},
        return_document=True
    )
    if not res:
        raise HTTPException(status_code=404, detail="Resident not found")

    return UserProfileResponse(
        id=res["id"],
        role=res["role"],
        name=res["name"],
        initials=res.get("initials", "SK"),
        residency=res.get("residency", "Maple Heights Society"),
        unit=res.get("unit", ""),
        tower=res.get("tower"),
        flat_number=res.get("flat_number"),
        email=res["email"],
        phone=res["phone"],
        resident_type=res.get("resident_type", "Owner Resident"),
        parking_bay=res.get("parking_bay", ""),
        vehicle_number=res.get("vehicle_number", ""),
        intercom_ext=res.get("intercom_ext", ""),
        status=res.get("status", "Active"),
    )

@router.delete("/residents/{id}")
@router.delete("/admin/residents/{id}")
async def delete_resident(id: str, current_user: dict = Depends(require_admin)):
    """Admin: Soft deactivate resident by default to protect historical ledger/tickets."""
    db = get_database()
    # Mark status as Inactive
    res = await db.users.find_one_and_update(
        {"id": id},
        {"$set": {"status": "Inactive", "updated_at": datetime.now().isoformat()}},
        return_document=True
    )
    if not res:
        raise HTTPException(status_code=404, detail="Resident not found")
    return {"message": f"Resident '{res['name']}' account deactivated successfully", "status": "Inactive"}
