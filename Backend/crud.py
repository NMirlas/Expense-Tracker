# CRUD functions to interact with the DB
# C - create a new expense
# R - read one or all expenses
# U - update specific expense
# D - delete specific expense

from sqlalchemy.orm import Session
from schemas import ExpenseCreate
from models import Expenses


# get a single expense by id
def crud_get_expense(db: Session, expense_id: int):
    return db.query(Expenses).filter(Expenses.id == expense_id).first()


# get all expenses, newest first
def crud_get_expenses(db: Session):
    return db.query(Expenses).order_by(Expenses.date.desc()).all()


# create a new expense
def crud_create_expense(db: Session, payload: ExpenseCreate):
    db_item = Expenses(**payload.model_dump())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item


# update existing expense by id
def crud_update_expense(db: Session, expense_id: int, payload: ExpenseCreate):
    db_item = db.query(Expenses).filter(Expenses.id == expense_id)

    if not db_item.first():
        return None

    db_item.update(payload.model_dump())
    db.commit()
    return db_item.first()


# delete an expense by id
def crud_delete_expense(db: Session, expense_id: int):
    db_item_query = db.query(Expenses).filter(Expenses.id == expense_id)
    db_item = db_item_query.first()

    if not db_item:
        return None

    db_item_query.delete(synchronize_session=False)
    db.commit()
    return db_item
