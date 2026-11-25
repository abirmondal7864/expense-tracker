import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "danger" | "ghost" | string;
  loading?: boolean;
}

const Button = ({
  children,
  onClick,
  type = "button",
  variant = "primary",
  disabled,
  loading,
  style,
  className = "",
  ...rest
}: ButtonProps) => {
  // Hook into existing CSS classes: "primary-button", "danger-button", etc.
  const baseClass = variant.includes("button") ? variant : `${variant}-button`;
  const isDisabled = Boolean(disabled || loading);

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={`btn ${baseClass} ${isDisabled ? "disabled" : ""} ${className}`.trim()}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        ...style,
      }}
      {...rest}
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
