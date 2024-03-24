import datetime as dt
from typing import List
from dataclasses import dataclass

from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, TIMESTAMP, func, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB
from .base import Base
from .user import User

@dataclass
class Puzzle(Base):
    __tablename__ = "puzzles"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"))
    title: Mapped[str] = mapped_column(String(50), nullable=False)
    num_rows: Mapped[int] = mapped_column(nullable=False)
    num_cols: Mapped[int] = mapped_column(nullable=False)

    grid = mapped_column(JSONB, nullable=False)
    date: Mapped[dt.date] = mapped_column(nullable=False)
    notes: Mapped[str] = mapped_column()
    draft: Mapped[bool] = mapped_column(nullable=False, default=True)
    draft_clues = mapped_column(JSONB)

    created_at: Mapped[dt.datetime] = mapped_column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at: Mapped[dt.datetime] = mapped_column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.utc_timestamp())

    # relationships
    user: Mapped["User"] = relationship(back_populates="puzzles")
    answers: Mapped[List["Answer"]] = relationship(back_populates="puzzle")

    def __repr__(self) -> str:
        return f"Puzzle(id={self.id!r}, title='{self.title!r}', size={self.num_rows}x{self.num_cols}, draft={self.draft!r})"
    
