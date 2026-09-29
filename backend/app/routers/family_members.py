import uuid
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from app.db.database import get_database
from app.schemas.family_member import (
    FamilyMemberCreate,
    FamilyMemberUpdate,
    FamilyMemberResponse,
)
from app.services.auth_service import get_current_user, require_resident, require_admin

router = APIRouter(tags=["Family Members"])

@router.get("/family-members", response_model=List[FamilyMemberResponse])
async def get_my_family_members(current_user: dict = Depends(require_resident)):
    """
    Resident: List all registered family members belonging to the authenticated resident.
    Strictly scoped to current_user's resident ID.
    """
    db = get_database()
    cursor = db.family_members.find({"resident_id": current_user["id"]}).sort("created_at", -1)
    results = []
    async for fm in cursor:
        results.append(FamilyMemberResponse(
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
    return results

@router.post("/family-members", response_model=FamilyMemberResponse, status_code=status.HTTP_201_CREATED)
async def add_family_member(
    req: FamilyMemberCreate,
    current_user: dict = Depends(require_resident)
):
    """
    Resident: Add a family member to current resident's profile.
    The backend strictly forces resident_id from the authenticated JWT session.
    """
    db = get_database()
    fm_id = f"FAM-{uuid.uuid4().hex[:6].upper()}"
    
    # Check for duplicate name/relationship for same resident
    existing = await db.family_members.find_one({
        "resident_id": current_user["id"],
        "name": {"$regex": f"^{req.name.strip()}$", "$options": "i"},
        "relationship": req.relationship
    })
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"A family member '{req.name}' with relationship '{req.relationship}' is already registered."
        )

    now_iso = datetime.now().isoformat()
    doc = {
        "id": fm_id,
        "resident_id": current_user["id"],
        "name": req.name.strip(),
        "relationship": req.relationship,
        "age": req.age,
        "phone": req.phone.strip() if req.phone else None,
        "email": req.email.strip() if req.email else None,
        "gender": req.gender,
        "emergency_contact": req.emergency_contact or False,
        "created_at": now_iso,
        "updated_at": now_iso,
    }

    await db.family_members.insert_one(doc)
    return FamilyMemberResponse(**doc)

@router.get("/family-members/{id}", response_model=FamilyMemberResponse)
async def get_family_member_by_id(
    id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get family member by ID. Enforces ownership authorization."""
    db = get_database()
    fm = await db.family_members.find_one({"id": id})
    if not fm:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Family member not found")

    # Authorization: User must be admin or the owner resident
    if current_user.get("role") != "admin" and fm.get("resident_id") != current_user["id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: You cannot view another resident's family member"
        )

    return FamilyMemberResponse(
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
    )

@router.put("/family-members/{id}", response_model=FamilyMemberResponse)
async def update_family_member(
    id: str,
    req: FamilyMemberUpdate,
    current_user: dict = Depends(require_resident)
):
    """Resident: Edit own family member details."""
    db = get_database()
    fm = await db.family_members.find_one({"id": id})
    if not fm:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Family member not found")

    # Authorization: verify ownership
    if current_user.get("role") != "admin" and fm.get("resident_id") != current_user["id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: You cannot modify another resident's family member"
        )

    update_fields = {k: v for k, v in req.model_dump().items() if v is not None}
    if not update_fields:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No fields provided for update")

    update_fields["updated_at"] = datetime.now().isoformat()

    updated = await db.family_members.find_one_and_update(
        {"id": id},
        {"$set": update_fields},
        return_document=True
    )

    return FamilyMemberResponse(
        id=updated["id"],
        resident_id=updated["resident_id"],
        name=updated["name"],
        relationship=updated["relationship"],
        age=updated.get("age"),
        phone=updated.get("phone"),
        email=updated.get("email"),
        gender=updated.get("gender"),
        emergency_contact=updated.get("emergency_contact", False),
        created_at=updated.get("created_at"),
        updated_at=updated.get("updated_at"),
    )

@router.delete("/family-members/{id}")
async def delete_family_member(
    id: str,
    current_user: dict = Depends(require_resident)
):
    """Resident: Remove a family member from own profile."""
    db = get_database()
    fm = await db.family_members.find_one({"id": id})
    if not fm:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Family member not found")

    # Authorization check
    if current_user.get("role") != "admin" and fm.get("resident_id") != current_user["id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: You cannot remove another resident's family member"
        )

    await db.family_members.delete_one({"id": id})
    return {"message": f"Family member '{fm['name']}' removed successfully", "id": id}

@router.get("/admin/residents/{resident_id}/family-members", response_model=List[FamilyMemberResponse])
async def get_resident_family_members_admin(
    resident_id: str,
    current_user: dict = Depends(require_admin)
):
    """Admin: Inspect family members associated with a specific resident."""
    db = get_database()
    cursor = db.family_members.find({"resident_id": resident_id}).sort("created_at", -1)
    results = []
    async for fm in cursor:
        results.append(FamilyMemberResponse(
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
    return results
