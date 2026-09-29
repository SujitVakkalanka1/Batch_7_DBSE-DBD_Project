import random
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from app.db.database import get_database
from app.schemas.gate_pass import GatePassCreate, GatePassStatusUpdate, GatePassResponse
from app.services.auth_service import get_current_user, require_resident, require_admin

router = APIRouter(tags=["Visitor & Gate Passes"])

@router.post("/gate-passes", response_model=GatePassResponse, status_code=status.HTTP_201_CREATED)
async def create_gate_pass(
    req: GatePassCreate,
    current_user: dict = Depends(require_resident)
):
    """
    Resident: Authoritatively generate a visitor entry gate pass.
    The backend generates the unique Pass ID and numeric security passcode.
    """
    db = get_database()
    pass_id = f"GP-{random.randint(1000, 9999)}"
    while await db.gate_passes.find_one({"id": pass_id}):
        pass_id = f"GP-{random.randint(1000, 9999)}"

    # Generate 6-digit numeric passCode formatted as XXX-XXX
    pass_code = f"{random.randint(100, 999)}-{random.randint(100, 999)}"

    doc = {
        "id": pass_id,
        "visitorName": req.visitorName,
        "visitorPhone": req.visitorPhone if req.visitorPhone else "Not provided",
        "purpose": req.purpose,
        "unit": current_user.get("unit", "Tower B · Flat 704"),
        "resident_id": current_user["id"],
        "resident_name": current_user["name"],
        "validDate": req.validDate or "Today",
        "validTime": "Valid till 11:59 PM",
        "passCode": pass_code,
        "status": "Active",
        "created_at": datetime.now().isoformat(),
    }

    await db.gate_passes.insert_one(doc)
    return GatePassResponse(**doc)

@router.get("/gate-passes/my", response_model=List[GatePassResponse])
async def get_my_gate_passes(current_user: dict = Depends(require_resident)):
    """Resident: View active and past visitor gate passes."""
    db = get_database()
    cursor = db.gate_passes.find({
        "$or": [
            {"resident_id": current_user["id"]},
            {"unit": current_user.get("unit", "")}
        ]
    }).sort("created_at", -1)

    results = []
    async for gp in cursor:
        results.append(GatePassResponse(
            id=gp["id"],
            visitorName=gp["visitorName"],
            visitorPhone=gp["visitorPhone"],
            purpose=gp["purpose"],
            unit=gp["unit"],
            validDate=gp["validDate"],
            validTime=gp["validTime"],
            passCode=gp["passCode"],
            status=gp["status"],
            created_at=gp.get("created_at")
        ))
    return results

@router.get("/gate-passes/{id}", response_model=GatePassResponse)
async def get_gate_pass_details(id: str, current_user: dict = Depends(get_current_user)):
    """Get single gate pass information."""
    db = get_database()
    gp = await db.gate_passes.find_one({"id": id})
    if not gp:
        raise HTTPException(status_code=404, detail="Gate pass not found")
    
    return GatePassResponse(
        id=gp["id"],
        visitorName=gp["visitorName"],
        visitorPhone=gp["visitorPhone"],
        purpose=gp["purpose"],
        unit=gp["unit"],
        validDate=gp["validDate"],
        validTime=gp["validTime"],
        passCode=gp["passCode"],
        status=gp["status"],
        created_at=gp.get("created_at")
    )

@router.get("/admin/gate-passes", response_model=List[GatePassResponse])
async def list_admin_gate_passes(
    status_filter: Optional[str] = None,
    current_user: dict = Depends(require_admin)
):
    """Admin / Gate Command: View all visitor passes log."""
    db = get_database()
    query = {}
    if status_filter:
        query["status"] = status_filter
        
    cursor = db.gate_passes.find(query).sort("created_at", -1)
    results = []
    async for gp in cursor:
        results.append(GatePassResponse(
            id=gp["id"],
            visitorName=gp["visitorName"],
            visitorPhone=gp["visitorPhone"],
            purpose=gp["purpose"],
            unit=gp["unit"],
            validDate=gp["validDate"],
            validTime=gp["validTime"],
            passCode=gp["passCode"],
            status=gp["status"],
            created_at=gp.get("created_at")
        ))
    return results

@router.patch("/admin/gate-passes/{id}/status", response_model=GatePassResponse)
async def update_gate_pass_status(
    id: str,
    req: GatePassStatusUpdate,
    current_user: dict = Depends(require_admin)
):
    """Admin / Gate Guard: Validate and update gate pass (e.g. mark 'Used' upon check-in)."""
    db = get_database()
    gp = await db.gate_passes.find_one_and_update(
        {"id": id},
        {"$set": {"status": req.status, "updated_at": datetime.now().isoformat()}},
        return_document=True
    )
    if not gp:
        raise HTTPException(status_code=404, detail="Gate pass not found")

    return GatePassResponse(
        id=gp["id"],
        visitorName=gp["visitorName"],
        visitorPhone=gp["visitorPhone"],
        purpose=gp["purpose"],
        unit=gp["unit"],
        validDate=gp["validDate"],
        validTime=gp["validTime"],
        passCode=gp["passCode"],
        status=gp["status"],
        created_at=gp.get("created_at")
    )
