from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.analytics import AnalyticsOverviewResponse
from app.services.analytics_service import analytics_service

router = APIRouter()

@router.get("/overview", response_model=AnalyticsOverviewResponse)
def get_analytics_overview(db: Session = Depends(get_db)):
    data = analytics_service.get_overview_data(db)
    return data

