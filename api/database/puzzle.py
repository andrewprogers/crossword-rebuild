import datetime as dt
from typing import List, Iterable
from dataclasses import dataclass

from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, TIMESTAMP, func, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB
from .base import Base
from .user import User
from .answer import Answer


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
    updated_at: Mapped[dt.datetime] = mapped_column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.current_timestamp())

    # relationships
    user: Mapped["User"] = relationship(back_populates="puzzles")
    answers: Mapped[List["Answer"]] = relationship(back_populates="puzzle")

    def __repr__(self) -> str:
        return f"Puzzle(id={self.id!r}, title='{self.title!r}', size={self.num_rows}x{self.num_cols}, draft={self.draft!r})"
    
    def get_clues(self):
        if self.draft:
            return self.draft_clues

        clues = {
            "across": [],
            "down": []
        }
        for answer in sorted(self.answers, key=(lambda a: a.gridnum)):
            if answer.is_across:
                clues["across"].append(answer.clue)
            else:
                clues["down"].append(answer.clue)
        return clues
    
    def validate_draft(self, clue_numbers, clue_answers):
        return not all((
            len(self.grid["grid"]) == (self.num_rows * self.num_cols),
            len(self.title.strip()) > 0,
            len(self.draft_clues["across"]) >= len(clue_numbers["across"]),
            len(self.draft_clues["down"]) >= len(clue_numbers["down"]),
            len(clue_answers["across"]) == len(clue_numbers["across"]),
            len(clue_answers["down"]) == len(clue_numbers["down"])
        ))
    
    def to_dict(self):
        return {
            "id": self.id,
            "clues": self.get_clues(),
            "grid": self.grid["grid"],
            "size": {
                "rows": self.num_rows,
                "cols": self.num_cols
            },
            "draft": self.draft,
            "title": self.title
        }
    
    @staticmethod
    def grid_from_iterable(iterable: Iterable, rows:int, cols:int) -> List[List]:
        it = iter(iterable)
        try:
            grid = [[next(it) for _ in range (cols)] for _ in range(rows)]
            if next(it, None) is None:
                return grid
            raise ValueError("Iterable length greater than rows*cols")
        except StopIteration:
            raise ValueError("Iterable length less than rows*cols")

    @staticmethod
    def generate_blank_grid(rows: int, cols: int) -> List[List[str]]:
        return Puzzle.grid_from_iterable(('' for _ in range(rows*cols)), rows, cols)
    
    def generate_blank_solution(self):
        return Puzzle.generate_blank_grid(self.num_rows, self.num_cols)
    
    def valid_grid_size(self, grid) -> bool:
        return (
            len(grid) == self.num_rows
            and all(map(lambda r: len(r) == self.num_cols, grid))
        )
    
    @classmethod
    def new_draft(cls, user_id: str, title: str, size: int):
        return cls(
            user_id=user_id,
            title=title,
            num_rows=size,
            num_cols=size,
            grid={ "grid": Puzzle.generate_blank_grid(size, size) },
            date=dt.datetime.now().date(),
            draft=True,
            draft_clues = {
                "across": [""],
                "down": [""]
            }
        )
