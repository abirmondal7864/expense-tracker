import React from "react";

const EmptyState = ({ message, subMessage, actionText, onAction }) => {
  return (
    <div className="empty-state">
      <h2>{message || "No expenses yet 😐"}</h2>
      <p className="muted">{subMessage || "Start by adding your first expense"}</p>

      {actionText ? (
        <button
          onClick={onAction}
          className="primary-button"
        >
          {actionText}
        </button>
      ) : null}
    </div>
  );
};

export default EmptyState;
