import datetime as dt
from typing import List
from dataclasses import dataclass

from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, TIMESTAMP, func, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB
from .base import Base
from .user import User
from .puzzle import Puzzle

@dataclass
class Solution(Base):
    __tablename__ = "solutions"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), nullable=False)
    puzzle_id: Mapped[int] = mapped_column(ForeignKey("puzzles.id"), nullable=False)
    user_answers: Mapped[dict] = mapped_column(JSONB, nullable=False)
    correct: Mapped[bool] = mapped_column(nullable=False, default=False)

    created_at: Mapped[dt.datetime] = mapped_column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at: Mapped[dt.datetime] = mapped_column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.utc_timestamp())

    # relationships
    user: Mapped["User"] = relationship()
    puzzle: Mapped["Puzzle"] = relationship()

    def __repr__(self) -> str:
        return f"Solution(id={self.id!r}, user='{self.user_id!r}', puzzle={self.puzzle_id!r}, correct={self.correct!r})"
    