from typing import Optional, List, Dict, Any
from pydantic import BaseModel

class AdminDashboardStats(BaseModel):
    total_residents: int
    total_flats: int
    occupied_flats: int
    occupancy_rate: str
    total_dues_collected: str
    total_dues_pending: str
    collection_efficiency: str
    pending_violations: int
    active_complaints: int
    pending_complaints: int
    in_progress_complaints: int
    resolved_complaints: int
    active_gate_passes: int
    upcoming_bookings: int
