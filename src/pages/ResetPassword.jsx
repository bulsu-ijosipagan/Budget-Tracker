import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ResetPassword() {
  const { updatePassword, signOut } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setInfo("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await updatePassword(password);
      if (error) {
        setError(error.message);
        return;
      }
      setInfo("Password updated! Redirecting to sign in...");
      await signOut();
      setTimeout(() => navigate("/login", { replace: true }), 2000);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>Budget Tracker</h1>
        <p className="muted">Set a new password</p>

        <label>New Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
        />

        <label>Confirm New Password</label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          minLength={6}
        />

        {error && <p className="error">{error}</p>}
        {info && <p className="info">{info}</p>}

        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? "Updating..." : "Update Password"}
        </button>
      </form>
    </div>
  );
}
