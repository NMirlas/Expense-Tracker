# stats helpers for a lightweight dashboard:
# - get_stats: overall totals + simple aggregations
# - get_monthly_breakdown: per-month split by user/type

from sqlalchemy.orm import Session
from sqlalchemy import func
from models import Expenses


# overall view (totals, by month, by user, by type)
def get_stats(db: Session):
    total_expenses_raw = db.query(func.sum(Expenses.amount)).scalar()
    total_expenses = total_expenses_raw or 0.0  # empty DB -> 0

    # sum per month (YYYY-MM); ordered for easy plotting on FE
    monthly_rows = (
        db.query(
            func.strftime('%Y-%m', Expenses.date).label('month'),
            func.sum(Expenses.amount).label('total')
        )
        .group_by(func.strftime('%Y-%m', Expenses.date))
        .order_by(func.strftime('%Y-%m', Expenses.date))
        .all()
    )
    # rows -> plain dicts for JSON response
    monthly_expenses = [row._asdict() for row in monthly_rows]

    # sum per user (descending)
    user_rows = (
        db.query(
            Expenses.paid_by.label('user'),
            func.sum(Expenses.amount).label('total')
        )
        .group_by(Expenses.paid_by)
        .order_by(func.sum(Expenses.amount).desc())
        .all()
    )
    expenses_per_user = [row._asdict() for row in user_rows]

    # sum per type/category (descending)
    type_rows = (
        db.query(
            Expenses.type.label('type'),
            func.sum(Expenses.amount).label('total')
        )
        .group_by(Expenses.type)
        .order_by(func.sum(Expenses.amount).desc())
        .all()
    )
    expenses_per_type = [row._asdict() for row in type_rows]

    return {
        "total_expenses": total_expenses,
        "monthly_expenses": monthly_expenses,
        "expenses_per_user": expenses_per_user,
        "expenses_per_type": expenses_per_type,
    }


# detailed monthly view (who spent how much per month + types per month)
def get_monthly_breakdown(db: Session):
    # month + user
    user_month_rows = db.query(
        func.strftime('%Y-%m', Expenses.date).label('month'),
        Expenses.paid_by.label('user'),
        func.sum(Expenses.amount).label('total')
    ).group_by('month', 'user').all()

    # month + type
    type_month_rows = db.query(
        func.strftime('%Y-%m', Expenses.date).label('month'),
        Expenses.type.label('type'),
        func.sum(Expenses.amount).label('total')
    ).group_by('month', 'type').all()

    # build per-month user breakdown
    user_breakdown = {}
    for row in user_month_rows:
        month = row.month
        if month not in user_breakdown:
            user_breakdown[month] = []
        user_breakdown[month].append({"user": row.user, "total": row.total})

    # build per-month type breakdown
    type_breakdown = {}
    for row in type_month_rows:
        month = row.month
        if month not in type_breakdown:
            type_breakdown[month] = []
        type_breakdown[month].append({"type": row.type, "total": row.total})

    # union of all months we saw
    all_months_set = set(user_breakdown.keys()) | set(type_breakdown.keys())

    # newest first
    sorted_months = sorted(list(all_months_set), reverse=True)

    # final shape used by the FE
    final_breakdown = []
    for month in sorted_months:
        final_breakdown.append({
            "month": month,
            "by_user": user_breakdown.get(month, []),
            "by_type": type_breakdown.get(month, [])
        })

    return final_breakdown
