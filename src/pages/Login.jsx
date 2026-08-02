import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [submitting, setSubmitting] = useState(false);

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

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setInfo("");
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
      } else if (mode === "signup") {
        setInfo("Check your email to confirm your account.");
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

        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting
            ? "Please wait..."
            : mode === "signin"
              ? "Sign In"
              : "Sign Up"}
        </button>

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
