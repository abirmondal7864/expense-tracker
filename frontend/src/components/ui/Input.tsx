import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = ({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  error,
  required,
  min,
  step,
  id,
  className = "",
  style,
  ...rest
}: InputProps) => {
  return (
    <div className="input-group" style={{ display: "grid", gap: "8px" }}>
      {label && <label htmlFor={id}>{label}</label>}
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        min={min}
        step={step}
        className={`${error ? "input-error" : ""} ${className}`.trim()}
        style={
          error
            ? {
                borderColor: "#d94b4b",
                boxShadow: "0 0 0 3px rgba(217, 75, 75, 0.18)",
                ...style,
              }
            : style
        }
        {...rest}
      />
      {error && (
        <span style={{ color: "#d94b4b", fontSize: "0.85rem" }}>{error}</span>
      )}
    </div>
  );
};

export default Input;
