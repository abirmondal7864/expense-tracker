import React from "react";

const ConfirmModal = ({ isOpen, onClose, onConfirm, text }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.5)",
        zIndex: 50,
        padding: 16,
      }}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white p-6 rounded-lg shadow-lg w-80 text-center"
        style={{
          background: "white",
          padding: 24,
          borderRadius: 12,
          boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
          width: 320,
          textAlign: "center",
        }}
      >
        <h2 className="text-lg font-semibold mb-4" style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>
          {text}
        </h2>

        <div className="flex justify-center gap-4" style={{ display: "flex", justifyContent: "center", gap: 12 }}>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            style={{
              padding: "10px 14px",
              background: "#e5e7eb",
              border: 0,
              borderRadius: 8,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            style={{
              padding: "10px 14px",
              background: "#ef4444",
              color: "white",
              border: 0,
              borderRadius: 8,
              cursor: "pointer",
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;

