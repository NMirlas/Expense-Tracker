
Expense Tracker (FastAPI + React)

This is a small project I built to track shared expenses.
It includes a FastAPI backend with SQLite and a React (Vite) frontend.
The idea was to make something clean and simple that shows full CRUD + basic analytics.

---

Main features:
- Add, edit and delete expenses
- View all expenses in a table
- Analytics dashboard that includes:
  - Total spent
  - Spending by category
  - Spending by user
  - Spending by month

---

Tech stack:
Backend: FastAPI, SQLAlchemy, Pydantic, SQLite
Frontend: React (Vite), Recharts, Font Awesome

---

API endpoints (http://localhost:8000):
GET /expenses - get all expenses
POST /expenses - create new expense
PUT /expenses/{id} - update existing expense
DELETE /expenses/{id} - delete expense
GET /stats/overall - get overall statistics
GET /stats/monthly_breakdown - monthly breakdown

---

How to run locally:

Backend:
1. cd Backend
2. python -m venv .venv
3. source .venv/bin/activate  (on Windows: .venv\Scripts\activate)
4. pip install fastapi uvicorn sqlalchemy pydantic
5. uvicorn main:app --reload

Frontend:
1. cd Frontend
2. npm install
3. npm run dev

---

Data model (Expenses table):
- id (int): auto increment
- amount (float): expense amount
- paid_by (string): who paid
- type (string): category
- date (date): when it happened
- notes (string, optional): extra info

---

Notes:
- CORS is enabled for localhost:5173
- Data is ordered by date (newest first)
- SQLite used for simplicity
- Focus was on end-to-end logic and clear code

