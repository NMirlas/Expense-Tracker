# FastAPI entrypoint — wires CRUD + stats into HTTP endpoints

from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from database import SessionLocal, engine
from models import Base
from schemas import ExpenseRead, ExpenseCreate, ExpenseUpdate
from crud import (
    crud_get_expenses,
    crud_create_expense,
    crud_update_expense,
    crud_delete_expense,
)
from stats import get_stats, get_monthly_breakdown

app = FastAPI()

# allow local dev frontends
origins = [
    "http://localhost:5173",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "expense tracker"}

# create tables if not exist
Base.metadata.create_all(bind=engine)

# DB session per-request
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# POST /expenses — create new expense from user input (payload)
@app.post("/expenses", response_model=ExpenseRead, status_code=201)
def create_expense(payload: ExpenseCreate, db: Session = Depends(get_db)):
    return crud_create_expense(db, payload)

# GET /expenses — list all (used by the main table in the UI)
@app.get("/expenses", response_model=list[ExpenseRead])
def list_expenses(db: Session = Depends(get_db)):
    return crud_get_expenses(db)

# PUT /expenses/{id} — full update (expects all fields)
@app.put("/expenses/{id}", response_model=ExpenseRead)
def update_expense(id: int, payload: ExpenseUpdate, db: Session = Depends(get_db)):
    return crud_update_expense(db, id, payload)

# DELETE /expenses/{id} — remove by id
@app.delete("/expenses/{id}", status_code=204)
def delete_expense(id: int, db: Session = Depends(get_db)):
    crud_delete_expense(db, id)
    return

# stats for the analytics view
@app.get("/stats/overall")
def stats_overall(db: Session = Depends(get_db)):
    return get_stats(db)

@app.get("/stats/monthly_breakdown")
def stats_monthly_breakdown_endpoint(db: Session = Depends(get_db)):
    return get_monthly_breakdown(db)
