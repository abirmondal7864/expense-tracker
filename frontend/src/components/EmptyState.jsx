import React from "react";

const EmptyState = ({ message, actionText, onAction }) => {
  return (
    <div
      className="flex flex-col items-center justify-center py-16 text-center"
      style={{ padding: "64px 16px", textAlign: "center" }}
    >
      <h2 className="text-xl font-semibold mb-2" style={{ fontSize: 20, fontWeight: 600 }}>
        {message}
      </h2>

      {actionText ? (
        <button
          onClick={onAction}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          style={{
            marginTop: 16,
            padding: "10px 14px",
            background: "#3b82f6",
            color: "white",
            border: 0,
            borderRadius: 8,
            cursor: "pointer",
          }}
        >
          {actionText}
        </button>
      ) : null}
    </div>
  );
};

export default EmptyState;

