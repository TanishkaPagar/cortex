from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.services.planner_service import (
    create_task, get_user_tasks, update_task_status, delete_task
)
from app.services.auth_service import decode_token
from pydantic import BaseModel
from datetime import date

router = APIRouter(prefix="/planner", tags=["Planner"])


def get_current_user_id(token: str) -> str:
    user_id = decode_token(token)
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token")
    return user_id


class CreateTaskRequest(BaseModel):
    title: str
    subject: str = "General"
    due_date: date
    priority: str = "medium"


class UpdateStatusRequest(BaseModel):
    status: str


@router.post("/tasks")
async def create_task_endpoint(
    token: str,
    request: CreateTaskRequest,
    db: AsyncSession = Depends(get_db)
):
    user_id = get_current_user_id(token)
    task = await create_task(
        user_id=user_id,
        title=request.title,
        subject=request.subject,
        due_date=request.due_date,
        priority=request.priority,
        db=db
    )
    return {
        "id": task.id,
        "title": task.title,
        "subject": task.subject,
        "due_date": task.due_date,
        "priority": task.priority,
        "status": task.status
    }


@router.get("/tasks")
async def get_tasks(token: str, db: AsyncSession = Depends(get_db)):
    user_id = get_current_user_id(token)
    tasks = await get_user_tasks(user_id, db)
    return [
        {
            "id": t.id,
            "title": t.title,
            "subject": t.subject,
            "due_date": t.due_date,
            "priority": t.priority,
            "status": t.status
        }
        for t in tasks
    ]


@router.patch("/tasks/{task_id}")
async def update_status(
    task_id: str,
    token: str,
    request: UpdateStatusRequest,
    db: AsyncSession = Depends(get_db)
):
    user_id = get_current_user_id(token)
    task = await update_task_status(task_id, user_id, request.status, db)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return {"message": "Updated successfully"}


@router.delete("/tasks/{task_id}")
async def delete_task_endpoint(
    task_id: str,
    token: str,
    db: AsyncSession = Depends(get_db)
):
    user_id = get_current_user_id(token)
    success = await delete_task(task_id, user_id, db)
    if not success:
        raise HTTPException(status_code=404, detail="Task not found")
    return {"message": "Deleted successfully"}