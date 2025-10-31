import { useState, useEffect } from "react";
import AddExpenseForm from "./components/AddExpenseForm";
import { getExpenses, deleteExpense } from "./api/expensesApi";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faEdit, faChartLine, faList, faMoneyBillTrendUp } from "@fortawesome/free-solid-svg-icons";
import Dashboard from "./components/Dashboard";
import "./App.css";

/*
* Base component styles for consistency across the app
* - tableStyle → main expenses table
* - thTdStyle → table headers and cells
* - buttonStyle → shared for all clickable icons/buttons
*/
const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  marginTop: "20px",
};

const thTdStyle = {
  border: "1px solid #ddd",
  padding: "8px",
  textAlign: "center",
};

const buttonStyle = {
  background: "transparent",
  border: "none",
  cursor: "pointer",
  marginRight: "10px",
};

function App() {
  // list of all expenses (main state)
  const [expenses, setExpenses] = useState([]);
  // track expense currently being edited
  const [editingExpense, setEditingExpense] = useState(null);
  // toggle between "Expenses" view and "Analytics" dashboard
  const [view, setView] = useState("expenses");

  // load data from backend once on mount
  useEffect(() => {
    async function fetchExpenses() {
      try {
        const data = await getExpenses();
        setExpenses(data);
      } catch (err) {
        console.error(err);
      }
    }
    fetchExpenses();
  }, []);

  // add a new expense (called after POST)
  const handleAddExpense = (newExpense) => {
    setExpenses([...expenses, newExpense]);
  };

  // update an existing expense (called after PUT)
  const handleUpdateExpense = (updatedExpense) => {
    setExpenses(
      expenses.map((exp) =>
        exp.id === updatedExpense.id ? updatedExpense : exp
      )
    );
    setEditingExpense(null);
  };

  // cancel edit mode
  const handleCancelEdit = () => {
    setEditingExpense(null);
  };

  return (
    <div className="app-container">
      <header>
        <h1>
          <FontAwesomeIcon icon={faMoneyBillTrendUp} />
          Expense Tracker
        </h1>
      </header>

      <div style={{ padding: "20px" }}>
        {/* toolbar buttons: switch between Expenses and Analytics views */}
        <div
          style={{
            display: "flex",
            gap: "10px",
            marginBottom: "20px",
            alignItems: "center",
          }}
        >
          <button
            onClick={() => setView("expenses")}
            style={{
              background: "transparent",
              border: view === "expenses" ? "2px solid #007bff" : "1px solid #ccc",
              borderRadius: "6px",
              padding: "6px 10px",
              cursor: "pointer",
              color: view === "expenses" ? "#007bff" : "#333",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <FontAwesomeIcon icon={faList} />
            <span>Expenses</span>
          </button>

          <button
            onClick={() => setView("analytics")}
            style={{
              background: "transparent",
              border: view === "analytics" ? "2px solid #007bff" : "1px solid #ccc",
              borderRadius: "6px",
              padding: "6px 10px",
              cursor: "pointer",
              color: view === "analytics" ? "#ff0000" : "#050505",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <FontAwesomeIcon icon={faChartLine} />
            <span>Analytics</span>
          </button>
        </div>

        {/* Expenses view (default): add, edit, delete, and list all expenses */}
        {view === "expenses" && (
          <>
            <AddExpenseForm
              onAdd={handleAddExpense}
              onUpdate={handleUpdateExpense}
              onCancelEdit={handleCancelEdit}
              editingExpense={editingExpense}
            />

            <h3>Expenses List</h3>

            {/* main table showing all expenses */}
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thTdStyle}>Amount</th>
                  <th style={thTdStyle}>Paid By</th>
                  <th style={thTdStyle}>Category</th>
                  <th style={thTdStyle}>Date</th>
                  <th style={thTdStyle}>Note</th>
                  <th style={thTdStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((exp) => (
                  <tr key={exp.id}>
                    <td style={thTdStyle}>₪{Number(exp.amount).toFixed(2)}</td>
                    <td style={thTdStyle}>{exp.paid_by}</td>
                    <td style={thTdStyle}>{exp.type}</td>
                    <td style={thTdStyle}>
                      {new Date(exp.date).toLocaleDateString("en-GB")}
                    </td>
                    <td style={thTdStyle}>{exp.notes}</td>
                    <td style={thTdStyle}>
                      {/* delete button */}
                      <button
                        onClick={async () => {
                          try {
                            await deleteExpense(exp.id);
                            setExpenses(expenses.filter((e) => e.id !== exp.id));
                          } catch (err) {
                            console.error(err);
                            alert("Failed to delete");
                          }
                        }}
                        style={{ ...buttonStyle, color: "#f55" }}
                        title="Delete"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>

                      {/* edit button */}
                      <button
                        onClick={() => setEditingExpense(exp)}
                        style={{ ...buttonStyle, color: "#007bff" }}
                        title="Edit"
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {/* Analytics view (dashboard with charts) */}
        {view === "analytics" && (
          <div>
            <Dashboard />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
