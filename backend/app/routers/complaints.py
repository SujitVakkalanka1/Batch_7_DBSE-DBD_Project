import random
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from app.db.database import get_database
from app.schemas.complaint import ComplaintCreate, ComplaintStatusUpdate, ComplaintResponse
from app.services.auth_service import get_current_user, require_resident, require_admin

router = APIRouter(tags=["Complaints & Tickets"])

@router.post("/complaints", response_model=ComplaintResponse, status_code=status.HTTP_201_CREATED)
async def create_complaint(
    req: ComplaintCreate,
    current_user: dict = Depends(require_resident)
):
    """Resident: Raise a new maintenance ticket/complaint."""
    db = get_database()
    ticket_id = f"TKT-{random.randint(1000, 9999)}"
    
    # Ensure unique ticket id
    while await db.complaints.find_one({"id": ticket_id}):
        ticket_id = f"TKT-{random.randint(1000, 9999)}"

    today_str = datetime.now().strftime("%d %b %Y")
    
    doc = {
        "id": ticket_id,
        "title": req.title,
        "category": req.category,
        "status": "Pending",
        "unit": current_user.get("unit", "Tower B · Flat 704"),
        "resident_id": current_user["id"],
        "submittedBy": current_user["name"],
        "date": today_str,
        "urgency": req.urgency,
        "description": req.description,
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat(),
        "resolution_notes": None
    }
    
    await db.complaints.insert_one(doc)
    return ComplaintResponse(**doc)

@router.get("/complaints/my", response_model=List[ComplaintResponse])
async def get_my_complaints(current_user: dict = Depends(require_resident)):
    """Resident: View their logged complaints."""
    db = get_database()
    cursor = db.complaints.find({
        "$or": [
            {"resident_id": current_user["id"]},
            {"unit": current_user.get("unit", "")}
        ]
    }).sort("created_at", -1)
    
    results = []
    async for c in cursor:
        results.append(ComplaintResponse(
            id=c["id"],
            title=c["title"],
            category=c["category"],
            status=c["status"],
            unit=c["unit"],
            submittedBy=c["submittedBy"],
            date=c["date"],
            urgency=c["urgency"],
            description=c["description"],
            resolution_notes=c.get("resolution_notes")
        ))
    return results

@router.get("/complaints/{ticket_id}", response_model=ComplaintResponse)
async def get_complaint_by_id(ticket_id: str, current_user: dict = Depends(get_current_user)):
    """Get single complaint details by Ticket ID."""
    db = get_database()
    c = await db.complaints.find_one({"id": ticket_id})
    if not c:
        raise HTTPException(status_code=404, detail="Complaint ticket not found")
    
    return ComplaintResponse(
        id=c["id"],
        title=c["title"],
        category=c["category"],
        status=c["status"],
        unit=c["unit"],
        submittedBy=c["submittedBy"],
        date=c["date"],
        urgency=c["urgency"],
        description=c["description"],
        resolution_notes=c.get("resolution_notes")
    )

@router.get("/admin/complaints", response_model=List[ComplaintResponse])
async def list_admin_complaints(
    category: Optional[str] = None,
    status_filter: Optional[str] = None,
    urgency: Optional[str] = None,
    current_user: dict = Depends(require_admin)
):
    """Admin: List all society complaints with filtering options."""
    db = get_database()
    query = {}
    if category and category != "All":
        query["category"] = category
    if status_filter and status_filter != "All":
        query["status"] = status_filter
    if urgency and urgency != "All":
        query["urgency"] = urgency

    cursor = db.complaints.find(query).sort("created_at", -1)
    results = []
    async for c in cursor:
        results.append(ComplaintResponse(
            id=c["id"],
            title=c["title"],
            category=c["category"],
            status=c["status"],
            unit=c["unit"],
            submittedBy=c["submittedBy"],
            date=c["date"],
            urgency=c["urgency"],
            description=c["description"],
            resolution_notes=c.get("resolution_notes")
        ))
    return results

@router.patch("/admin/complaints/{ticket_id}/status", response_model=ComplaintResponse)
async def update_complaint_status(
    ticket_id: str,
    req: ComplaintStatusUpdate,
    current_user: dict = Depends(require_admin)
):
    """Admin: Update status of a ticket ('Pending', 'In Progress', 'Resolved')."""
    db = get_database()
    update_data = {
        "status": req.status,
        "updated_at": datetime.now().isoformat()
    }
    if req.resolution_notes:
        update_data["resolution_notes"] = req.resolution_notes

    c = await db.complaints.find_one_and_update(
        {"id": ticket_id},
        {"$set": update_data},
        return_document=True
    )
    if not c:
        raise HTTPException(status_code=404, detail="Complaint ticket not found")

    return ComplaintResponse(
        id=c["id"],
        title=c["title"],
        category=c["category"],
        status=c["status"],
        unit=c["unit"],
        submittedBy=c["submittedBy"],
        date=c["date"],
        urgency=c["urgency"],
        description=c["description"],
        resolution_notes=c.get("resolution_notes")
    )
