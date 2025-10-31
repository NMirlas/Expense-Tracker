# defines what the API sends/receives — schemas for requests & responses

from datetime import date
from pydantic import BaseModel, ConfigDict

# shared fields (used in create, update, read)
class ExpenseBase(BaseModel):
    amount: float                      # how much was paid
    paid_by: str                       # who paid
    type: str                          # category (groceries, car, studies, etc.)
    date: date                         # when it happened (used in stats)
    notes: str | None = None           # optional notes

    model_config = ConfigDict(extra="forbid")  # block unexpected fields

# POST /expenses
class ExpenseCreate(ExpenseBase):
    pass

# PUT /expenses/{id}
# (for PATCH - would make fields optional)
class ExpenseUpdate(ExpenseBase):
    pass

# what’s returned from the API (includes id)
class ExpenseRead(ExpenseBase):
    id: int
    model_config = ConfigDict(from_attributes=True)  # allows returning ORM objects directly
