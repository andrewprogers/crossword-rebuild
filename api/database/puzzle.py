from datetime import datetime
from typing import List
from dataclasses import dataclass

from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, TIMESTAMP, func, ForeignKey
from .base import Base
from .user import User

@dataclass
class Puzzle(Base):
    __tablename__ = "puzzles"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[String] = mapped_column(ForeignKey("users.id"))
    title: Mapped[String] = mapped_column(String(50), nullable=False)
    size: Mapped[int] = mapped_column(nullable=False)
    grid: Mapped[String] = mapped_column(nullable=False)
    date: Mapped[datetime] = mapped_column(datetime, nullable=False)
    notes: Mapped[String] = mapped_column(String)
    draft: Mapped[bool] = mapped_column(bool, nullable=False, default=False)
    draft_clues_json: Mapped[String] = mapped_column(String)

    created_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.utc_timestamp())

    # relationships
    user: Mapped["User"] = relationship(back_populates="puzzles")

    def __repr__(self) -> str:
        return f"Puzzle(id={self.id!r}, title='{self.title!r}', size={self.size!r} draft={self.draft!r}, created={self.created_at.isoformat()})"