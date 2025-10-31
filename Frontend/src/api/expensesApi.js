// create a new expense in the DB
export async function createExpense(data) {
  const res = await fetch("http://localhost:8000/expenses", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    throw new Error("Failed to create expense");
  }
  return res.json();
}

// fetch all expenses (used for the table view)
export async function getExpenses() {
  const res = await fetch("http://localhost:8000/expenses");
  if (!res.ok) {
    throw new Error("Failed to fetch expenses");
  }
  return res.json();
}

// delete a specific expense by ID
export async function deleteExpense(id) {
  const res = await fetch(`http://localhost:8000/expenses/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error("Failed to delete expense");
  }
}

// update an existing expense
export async function updateExpense(id, data) {
  const res = await fetch(`http://localhost:8000/expenses/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error("Failed to update expense");
  }

  return res.json();
}

// get overall stats for the dashboard (total, per user, per type)
export async function getOverall() {
  const res = await fetch("http://localhost:8000/stats/overall", {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    throw new Error("Failed to get stats");
  }

  return res.json();
}

// get detailed monthly breakdown (used for multi-user/month chart)
export async function getMonthly() {
  const res = await fetch("http://localhost:8000/stats/monthly_breakdown", {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    throw new Error("Failed to get monthly stats");
  }

  return res.json();
}
