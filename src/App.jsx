import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Accounts from "./pages/Accounts";
import Transactions from "./pages/Transactions";
import Budgets from "./pages/Budgets";
import Recurring from "./pages/Recurring";
import Reports from "./pages/Reports";
import { supabaseConfigError } from "./lib/supabaseClient";
import "./App.css";

function Protected({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to="/" replace /> : <Login />}
      />
      <Route
        path="/"
        element={
          <Protected>
            <Layout />
          </Protected>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="accounts" element={<Accounts />} />
        <Route path="transactions" element={<Transactions />} />
        <Route path="budgets" element={<Budgets />} />
        <Route path="recurring" element={<Recurring />} />
        <Route path="reports" element={<Reports />} />
      </Route>
    </Routes>
  );
}

function ConfigErrorScreen() {
  return (
    <div className="auth-page">
      <div className="auth-card auth-card-wide">
        <h1>Budget Tracker</h1>
        <p className="muted">Deployment configuration required</p>
        <p className="error-block">{supabaseConfigError}</p>
        <p className="muted small">
          Add the correct Supabase URL and anon key in Vercel Environment
          Variables, then redeploy.
        </p>
      </div>
    </div>
  );
}

export default function App() {
  if (supabaseConfigError) return <ConfigErrorScreen />;

  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
