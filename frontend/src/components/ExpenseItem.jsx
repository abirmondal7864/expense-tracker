import React from "react";

const ExpenseItem = ({ expense, onDelete, onEdit }) => {
  const formatter = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });
  const date = expense?.date
    ? new Intl.DateTimeFormat("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(new Date(expense.date))
    : "No date";

  return (
    <article className="expense-item">
      <div>
        <strong>{expense?.title}</strong>
        <span>{expense?.category || "General"} - {date}</span>
      </div>

      <div className="expense-actions">
        <b>{formatter.format(Number(expense?.amount) || 0)}</b>
        <button className="secondary-button compact" onClick={onEdit}>
          Edit
        </button>
        <button
          onClick={() => onDelete(expense._id)}
          className="danger-button compact"
        >
          Delete
        </button>
      </div>
    </article>
  );
};

export default ExpenseItem;
