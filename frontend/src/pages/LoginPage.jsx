import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { successToast, errorToast } from "../utils/toast";

const LoginPage = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(form.email, form.password);
      successToast("Login successful!");
      navigate("/");
    } catch (err) {
      errorToast(err.message || "Login failed");
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-panel">
        <div className="brand-mark">ET</div>
        <p className="eyebrow">Expense Tracker</p>
        <h1>Welcome back</h1>
        <p className="muted">Log in to keep your spending organized.</p>

        <form className="stack" onSubmit={handleSubmit}>
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
              placeholder="Your password"
              value={form.password}
              required
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </label>
          
          <div style={{ textAlign: "right", marginTop: "-10px", marginBottom: "15px" }}>
            <Link to="/forgot-password" style={{ fontSize: "0.875rem", color: "var(--brand-dark)" }}>
              Forgot password?
            </Link>
          </div>

          <button className="primary-button" type="submit">
            Login
          </button>
        </form>

        <p className="auth-switch">
          New here? <Link to="/register">Create an account</Link>
        </p>
      </section>
    </main>
  );
};

export default LoginPage;
