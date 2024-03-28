import datetime as dt
from dataclasses import dataclass

from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, TIMESTAMP, func, ForeignKey
from .base import Base

@dataclass
class Answer(Base):
    __tablename__ = "answers"

    # PK
    puzzle_id: Mapped[int] = mapped_column(ForeignKey("puzzles.id"), primary_key=True, nullable=False)
    is_across: Mapped[bool] = mapped_column(primary_key=True, nullable=False)
    gridnum: Mapped[int] = mapped_column(primary_key=True, nullable=False)

    # Others
    clue: Mapped[str] = mapped_column(String, nullable=False)
    answer: Mapped[str] = mapped_column(String, nullable=False)
    created_at: Mapped[dt.datetime] = mapped_column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at: Mapped[dt.datetime] = mapped_column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.current_timestamp())

    # relationships
    puzzle: Mapped["Puzzle"] = relationship(back_populates="answers")

    def __repr__(self) -> str:
        return f"Answer(puzzle_id={self.puzzle_id!r}, {self.gridnum}{'A' if self.is_across else 'D'}, {self.clue!r}, {self.answer!r})"
    