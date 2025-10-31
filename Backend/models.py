# defines the DB structure (SQLAlchemy ORM)

from sqlalchemy import Column, Integer, String, Float, Date
from database import Base


class Expenses(Base):
    __tablename__ = "Expenses"

    id = Column(Integer, primary_key=True)             # simple auto-increment id
    amount = Column(Float, nullable=False)             # amount paid (float supports decimals)
    paid_by = Column(String, nullable=False)           # who paid
    type = Column(String, nullable=False)              # expense category
    date = Column(Date, nullable=False)                # date of expense (used in stats)
    notes = Column(String, nullable=True)              # optional note (shown in table)
