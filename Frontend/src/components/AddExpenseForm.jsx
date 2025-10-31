import { useState, useEffect } from "react";
import { createExpense, updateExpense } from "../api/expensesApi";

/*
 * default form values - before user input
 * used when user resets the form or creates a new expense
 */
const getDefaultFormState = () => ({
  amount: "",
  paid_by: "",
  type: "",
  date: new Date().toISOString().split("T")[0],
  notes: "",
});

/*
 * component for adding or editing an expense
 * receives props from App.jsx (onAdd, onUpdate, onCancelEdit)
 */
function AddExpenseForm({ onAdd, editingExpense, onUpdate, onCancelEdit }) {
  // local form state (the payload we send to the backend)
  const [form, setForm] = useState(getDefaultFormState());

  // if editing → prefill form with existing data, else → reset to default
  useEffect(() => {
    if (editingExpense) {
      const formattedDate = new Date(editingExpense.date)
        .toISOString()
        .split("T")[0];

      setForm({
        amount: editingExpense.amount,
        paid_by: editingExpense.paid_by,
        type: editingExpense.type,
        date: formattedDate,
        notes: editingExpense.notes || "",
      });
    } else {
      setForm(getDefaultFormState());
    }
  }, [editingExpense]);

  // update form state when user types
  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  /*
   * handle submit event
   * normalize payload → call the right API (create/update)
   * then reset the form
   */
  async function handleSubmit(e) {
    e.preventDefault();

    const dataToSubmit = {
      amount: parseFloat(form.amount) || 0,
      paid_by: form.paid_by,
      type: form.type,
      date: form.date,
      notes: form.notes,
    };

    try {
      if (editingExpense) {
        const updated = await updateExpense(editingExpense.id, dataToSubmit);
        onUpdate(updated);
      } else {
        const newExpense = await createExpense(dataToSubmit);
        onAdd(newExpense);
      }
      setForm(getDefaultFormState());
    } catch (err) {
      console.error(err);
      alert("Error saving expense");
    }
  }

  // flag to know if we're editing an existing expense
  const isEditing = !!editingExpense;

  // render the form (prefilled in edit mode)
  return (
    <form onSubmit={handleSubmit} className="form-card">
      <h2>{isEditing ? "Edit Expense" : "Add New Expense"}</h2>

      <input
        type="number"
        name="amount"
        placeholder="Amount"
        value={form.amount}
        onChange={handleChange}
        step="0.01"
        required
      />

      <input
        type="text"
        name="paid_by"
        placeholder="Paid by"
        value={form.paid_by}
        onChange={handleChange}
      />

      <input
        type="text"
        name="type"
        placeholder="Type (e.g. Groceries)"
        value={form.type}
        onChange={handleChange}
      />

      <input
        type="date"
        name="date"
        value={form.date}
        onChange={handleChange}
        required
      />

      <input
        type="text"
        name="notes"
        placeholder="Notes"
        value={form.notes}
        onChange={handleChange}
      />

      <button type="submit">{isEditing ? "Update Expense" : "Add Expense"}</button>

      {isEditing && (
        <button type="button" onClick={onCancelEdit} style={{ marginLeft: "10px" }}>
          Cancel
        </button>
      )}
    </form>
  );
}

export default AddExpenseForm;
