import React from "react";

const Button = ({
  children,
  onClick,
  type = "button",
  variant = "primary",
  disabled,
  loading,
}) => {
  // Hook into existing CSS classes: "primary-button", "danger-button", etc.
  const baseClass = variant.includes("button") ? variant : `${variant}-button`;
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={`btn ${baseClass} ${isDisabled ? "disabled" : ""}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
      }}
    >
      {loading && (
        <span
          className="spinner"
          style={{ width: "16px", height: "16px", borderWidth: "2px" }}
        ></span>
      )}
      {children}
    </button>
  );
};

export default Button;
