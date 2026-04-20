import React, { useState } from "react";
import ConfirmModal from "./ConfirmModal";

const ExpenseItem = ({ expense, onDelete, onEdit }) => {
  const [showModal, setShowModal] = useState(false);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        padding: "10px 12px",
        border: "1px solid #e5e7eb",
        borderRadius: 10,
        marginTop: 10,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <strong>{expense?.title}</strong>
        <span style={{ opacity: 0.8 }}>
          ₹{expense?.amount} {expense?.category ? `• ${expense.category}` : ""}
        </span>
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={onEdit} style={{ cursor: "pointer" }}>
          Edit
        </button>
        <button
          onClick={() => setShowModal(true)}
          className="text-red-500"
          style={{ color: "#ef4444", cursor: "pointer" }}
        >
          Delete
        </button>
      </div>

      <ConfirmModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        text="Are you sure you want to delete this expense?"
        onConfirm={() => {
          onDelete(expense._id);
          setShowModal(false);
        }}
      />
    </div>
  );
};

export default ExpenseItem;
