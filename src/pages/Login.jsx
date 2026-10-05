import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { signIn, signUp, sendPasswordReset } = useAuth();
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [cooldownUntil, setCooldownUntil] = useState(0);

  function getFriendlyAuthError(message) {
    if (!message) return "Something went wrong. Please try again.";

    const normalizedMessage = message.toLowerCase();

    if (normalizedMessage.includes("rate limit")) {
      return "Too many sign-up attempts for this email. Please wait a few minutes and try again, or use a different email.";
    }

    return message;
  }

  function getEmailRedirectTo() {
    return `${window.location.origin.replace(/\/$/, "")}/login`;
  }

  function isOnCooldown() {
    return Date.now() < cooldownUntil;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setInfo("");

    if (isOnCooldown()) {
      setError(
        "Too many sign-up attempts. Please wait a few minutes and try again.",
      );
      return;
    }

    setSubmitting(true);

    try {
      const action = mode === "signin" ? signIn : signUp;
      const options =
        mode === "signup"
          ? { emailRedirectTo: getEmailRedirectTo() }
          : undefined;
      const { error } = await action(email, password, options);

      if (error) {
        setError(getFriendlyAuthError(error.message));
        if (error.message?.toLowerCase().includes("rate limit")) {
          setCooldownUntil(Date.now() + 5 * 60 * 1000);
        }
      } else if (mode === "signup") {
        setInfo("Check your email to confirm your account.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleForgotPassword() {
    setError("");
    setInfo("");

    if (!email) {
      setError("Enter your email address above, then click Forgot password.");
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await sendPasswordReset(email);
      if (error) {
        setError(getFriendlyAuthError(error.message));
      } else {
        setInfo("Password reset email sent. Check your inbox.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>Budget Tracker</h1>
        <p className="muted">
          {mode === "signin" ? "Welcome back" : "Create your account"}
        </p>

        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
        />

        {error && <p className="error">{error}</p>}
        {info && <p className="info">{info}</p>}

        <button
          type="submit"
          className="btn-primary"
          disabled={submitting || isOnCooldown()}
        >
          {submitting
            ? "Please wait..."
            : isOnCooldown()
              ? "Try again later"
              : mode === "signin"
                ? "Sign In"
                : "Sign Up"}
        </button>

        {mode === "signin" && (
          <button
            type="button"
            className="btn-link"
            onClick={handleForgotPassword}
            disabled={submitting}
          >
            Forgot password?
          </button>
        )}

        <button
          type="button"
          className="btn-link"
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
        >
          {mode === "signin"
            ? "Don't have an account? Sign up"
            : "Already have an account? Sign in"}
        </button>
      </form>
    </div>
  );
}
