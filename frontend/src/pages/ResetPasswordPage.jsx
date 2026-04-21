import React, { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { successToast, errorToast } from "../utils/toast";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import API from "../api/axios";

const ResetPasswordPage = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  
  const { token } = useParams();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      errorToast("Passwords do not match");
      return;
    }
    
    if (password.length < 6) {
        errorToast("Password must be at least 6 characters");
        return;
    }

    try {
      setLoading(true);
      const res = await API.put(`/auth/resetpassword/${token}`, { password });
      successToast(res.data.message || "Password reset successful");
      // Save user to local storage and redirect
      localStorage.setItem("userInfo", JSON.stringify(res.data));
      navigate("/dashboard");
    } catch (err) {
      errorToast(err.response?.data?.message || "Invalid or expired token");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-panel">
        <div className="brand-mark">ET</div>
        <p className="eyebrow">Expense Tracker</p>
        <h1>Set New Password</h1>
        <p className="muted">Enter a new secure password for your account.</p>

        <form className="stack" onSubmit={handleSubmit} style={{ marginTop: "1rem" }}>
          <Input
            id="password"
            name="password"
            type="password"
            required
            label="New Password"
            placeholder="Enter new password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            label="Confirm Password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <Button type="submit" loading={loading} disabled={loading} style={{ width: "100%", marginTop: "10px" }}>
            {loading ? "Resetting..." : "Reset Password"}
          </Button>
          
          <p className="auth-switch" style={{ marginTop: "20px" }}>
             <Link to="/login">Back to login</Link>
          </p>
        </form>
      </section>
    </main>
  );
};

export default ResetPasswordPage;
