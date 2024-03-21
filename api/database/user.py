from datetime import datetime
from typing import List
from dataclasses import dataclass

from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, TIMESTAMP, func
from .base import Base
from .puzzle import Puzzle

@dataclass
class User(Base):
    __tablename__ = "users"

    id: Mapped[String] = mapped_column(String(50), nullable=False, primary_key=True)
    email: Mapped[String] = mapped_column(String, nullable=False)
    given_name: Mapped[String] = mapped_column(String)
    family_name: Mapped[String] = mapped_column(String)
    picture_url: Mapped[String] = mapped_column(String)
    created_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.utc_timestamp())

    puzzles: Mapped[List["Puzzle"]] = relationship(back_populates="user")

    def __repr__(self) -> str:
        return f"User(id={self.id!r}, name='{self.family_name} {self.given_name}', created={self.created_at.isoformat()})"
    
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