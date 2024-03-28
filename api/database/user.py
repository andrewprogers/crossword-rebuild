from datetime import datetime
from typing import List
from dataclasses import dataclass

from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, TIMESTAMP, func
from .base import Base

@dataclass
class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(50), nullable=False, primary_key=True)
    email: Mapped[str] = mapped_column(String, nullable=False)
    given_name: Mapped[str] = mapped_column()
    family_name: Mapped[str] = mapped_column()
    picture_url: Mapped[str] = mapped_column()
    created_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.current_timestamp())

    puzzles: Mapped[List["Puzzle"]] = relationship(back_populates="user")

    def __repr__(self) -> str:
        return f"User(id={self.id!r}, name='{self.given_name} {self.family_name}')"
    
    @classmethod
    def from_user_session(cls, user_session):
        info = user_session["userinfo"]
        return cls(
            id=info["sub"],
            email=info["email"],
            given_name=info["given_name"],
            family_name=info["family_name"],
            picture_url=info["picture"]
        )