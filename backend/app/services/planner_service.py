from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.assignment import Assignment
import uuid


async def create_task(
    user_id: str,
    title: str,
    subject: str,
    due_date,
    priority: str,
    db: AsyncSession
) -> Assignment:
    task = Assignment(
        id=str(uuid.uuid4()),
        user_id=user_id,
        title=title,
        subject=subject,
        due_date=due_date,
        priority=priority,
        status="pending"
    )
    db.add(task)
    await db.commit()
    await db.refresh(task)
    return task


async def get_user_tasks(user_id: str, db: AsyncSession) -> list:
    result = await db.execute(
        select(Assignment)
        .where(Assignment.user_id == user_id)
        .order_by(Assignment.due_date.asc())
    )
    return result.scalars().all()


async def update_task_status(
    task_id: str,
    user_id: str,
    status: str,
    db: AsyncSession
) -> Assignment:
    result = await db.execute(
        select(Assignment)
        .where(Assignment.id == task_id)
        .where(Assignment.user_id == user_id)
    )
    task = result.scalar_one_or_none()
    if task:
        task.status = status
        await db.commit()
        await db.refresh(task)
    return task


async def delete_task(task_id: str, user_id: str, db: AsyncSession) -> bool:
    result = await db.execute(
        select(Assignment)
        .where(Assignment.id == task_id)
        .where(Assignment.user_id == user_id)
    )
    task = result.scalar_one_or_none()
    if not task:
        return False
    await db.delete(task)
    await db.commit()
    return True