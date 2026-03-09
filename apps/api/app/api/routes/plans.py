from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.plan import PlanRequest, PlanResponse
from app.services.planner import generate_plan

router = APIRouter()


@router.post("/plans/generate", response_model=PlanResponse)
def create_plan(body: PlanRequest, db: Session = Depends(get_db)):
    try:
        return generate_plan(db, body)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
