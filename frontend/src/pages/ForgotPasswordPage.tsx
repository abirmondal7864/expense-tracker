import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { successToast, errorToast } from "../utils/toast";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import API from "../api/axios";
import { getErrorMessage } from "../utils/error";
import type { MessageResponse } from "../types";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!email) {
      errorToast("Please enter your email");
      return;
    }

    try {
      setLoading(true);
      const res = await API.post<MessageResponse>("/auth/forgotpassword", {
        email,
      });
      successToast(res.data.message || "Email sent successfully");
      setEmail("");
    } catch (err: unknown) {
      errorToast(getErrorMessage(err, "Something went wrong"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-panel">
        <div className="brand-mark">ET</div>
        <p className="eyebrow">Expense Tracker</p>
        <h1>Reset Password</h1>
        <p className="muted">We will send a reset link to your email.</p>

        <form
          className="stack"
          onSubmit={handleSubmit}
          style={{ marginTop: "1rem" }}
        >
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            label="Email address"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Button
            type="submit"
            loading={loading}
            disabled={loading}
            style={{ width: "100%", marginTop: "10px" }}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </Button>

          <p className="auth-switch" style={{ marginTop: "20px" }}>
            <Link to="/login">Back to login</Link>
          </p>
        </form>
      </section>
    </main>
  );
};

export default ForgotPasswordPage;
