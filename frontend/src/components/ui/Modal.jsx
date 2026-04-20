import React, { useEffect } from "react";

const Modal = ({ isOpen, onClose, children }) => {
  // ESC key close
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay modal-backdrop"
      onClick={onClose} // click outside to close
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        className="modal modal-panel"
        onClick={(e) => e.stopPropagation()} // Prevent close when clicking inside
        style={{ position: "relative" }}
      >
        {children}
      </div>
    </div>
  );
};

export default Modal;
