import time
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from app.db.database import get_database
from app.schemas.notice import NoticeCreate, NoticeUpdate, NoticeResponse
from app.services.auth_service import get_current_user, require_admin

router = APIRouter(prefix="/notices", tags=["Notices & Broadcasts"])

@router.get("", response_model=List[NoticeResponse])
async def list_notices(
    priority: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """List official notices and announcements."""
    db = get_database()
    query = {}
    if priority:
        query["priority"] = priority

    cursor = db.notices.find(query).sort("created_at", -1)
    results = []
    async for n in cursor:
        results.append(NoticeResponse(
            id=n["id"],
            eyebrow=n.get("eyebrow", "NOTICE · RESIDENTS"),
            title=n["title"],
            body=n["body"],
            timestamp=n.get("timestamp", "RECENT"),
            cta=n.get("cta", "Read full advisory"),
            priority=n.get("priority", "normal"),
            date=n.get("date", "Today"),
            author=n.get("author", "Estate Management Office"),
            created_at=n.get("created_at")
        ))
    return results

@router.get("/{id}", response_model=NoticeResponse)
async def get_notice_by_id(id: str, current_user: dict = Depends(get_current_user)):
    """Get single notice details."""
    db = get_database()
    n = await db.notices.find_one({"id": id})
    if not n:
        raise HTTPException(status_code=404, detail="Notice not found")

    return NoticeResponse(
        id=n["id"],
        eyebrow=n.get("eyebrow", "NOTICE · RESIDENTS"),
        title=n["title"],
        body=n["body"],
        timestamp=n.get("timestamp", "RECENT"),
        cta=n.get("cta", "Read full advisory"),
        priority=n.get("priority", "normal"),
        date=n.get("date", "Today"),
        author=n.get("author", "Estate Management Office"),
        created_at=n.get("created_at")
    )

@router.post("", response_model=NoticeResponse, status_code=status.HTTP_201_CREATED)
async def create_notice(
    req: NoticeCreate,
    current_user: dict = Depends(require_admin)
):
    """Admin: Publish a new society broadcast notice to resident dashboards."""
    db = get_database()
    notice_id = f"ann-{int(time.time() * 1000)}"
    
    eyebrow = req.eyebrow
    if req.priority == "urgent" and not eyebrow.startswith("URGENT"):
        eyebrow = f"URGENT {eyebrow}"

    today_str = datetime.now().strftime("%A, %d %b")

    doc = {
        "id": notice_id,
        "eyebrow": eyebrow,
        "title": req.title,
        "body": req.body,
        "timestamp": "JUST NOW",
        "cta": "Read full advisory",
        "priority": req.priority or "normal",
        "date": today_str,
        "author": req.author or current_user["name"],
        "target_audience": req.target_audience or "All Residents",
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat(),
    }

    await db.notices.insert_one(doc)
    return NoticeResponse(**doc)

@router.put("/{id}", response_model=NoticeResponse)
async def update_notice(
    id: str,
    req: NoticeUpdate,
    current_user: dict = Depends(require_admin)
):
    """Admin: Update an existing notice."""
    db = get_database()
    update_data = {k: v for k, v in req.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields provided for update")
    
    update_data["updated_at"] = datetime.now().isoformat()
    n = await db.notices.find_one_and_update(
        {"id": id},
        {"$set": update_data},
        return_document=True
    )
    if not n:
        raise HTTPException(status_code=404, detail="Notice not found")

    return NoticeResponse(
        id=n["id"],
        eyebrow=n.get("eyebrow", "NOTICE · RESIDENTS"),
        title=n["title"],
        body=n["body"],
        timestamp=n.get("timestamp", "UPDATED"),
        cta=n.get("cta", "Read full advisory"),
        priority=n.get("priority", "normal"),
        date=n.get("date", "Today"),
        author=n.get("author", "Estate Management Office"),
        created_at=n.get("created_at")
    )

@router.delete("/{id}")
async def delete_notice(id: str, current_user: dict = Depends(require_admin)):
    """Admin: Delete a notice."""
    db = get_database()
    res = await db.notices.delete_one({"id": id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Notice not found")
    return {"message": f"Notice {id} deleted successfully"}
