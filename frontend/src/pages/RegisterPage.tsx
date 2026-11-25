import { useState, type FormEvent } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { successToast, errorToast } from "../utils/toast";
import { getErrorMessage } from "../utils/error";
import type { RegisterFormData } from "../types";

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState<RegisterFormData>({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState<string>("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError("");

    if (!form.name || !form.email || !form.password) {
      const msg = "Name, email, and password are required.";
      setError(msg);
      errorToast(msg);
      return;
    }

    if (form.password.length < 6) {
      const msg = "Password must be at least 6 characters.";
      setError(msg);
      errorToast(msg);
      return;
    }

    try {
      await register(form.name, form.email, form.password);
      successToast("Registration successful!");
      navigate("/");
    } catch (err: unknown) {
      const errorMsg = getErrorMessage(err, "Registration failed.");
      setError(errorMsg);
      errorToast(errorMsg);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-panel">
        <div className="brand-mark">ET</div>
        <p className="eyebrow">Expense Tracker</p>
        <h1>Create account</h1>
        <p className="muted">
          Track expenses, totals, and categories in one place.
        </p>

        <form className="stack" onSubmit={handleSubmit}>
          {error ? <p className="form-error">{error}</p> : null}
          <label>
            Name
            <input
              type="text"
              placeholder="Your name"
              value={form.name}
              required
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </label>
          <label>
            Email
            <input
              type="email"
              placeholder="you@example.com"
              value={form.email}
              required
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </label>
          <label>
            Password
            <input
              type="password"
              placeholder="At least 6 characters"
              value={form.password}
              required
              minLength={6}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </label>
          <button className="primary-button" type="submit">
            Register
          </button>
        </form>

        <p className="auth-switch">
          Already registered? <Link to="/login">Log in</Link>
        </p>
      </section>
    </main>
  );
};

export default RegisterPage;
