import { NavLink, Outlet } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import CalculatorPanel from "./CalculatorPanel";
import CalendarPanel from "./CalendarPanel";

const links = [
  { to: "/", label: "Dashboard", end: true },
  { to: "/transactions", label: "Transactions" },
  { to: "/accounts", label: "Accounts" },
  { to: "/budgets", label: "Budgets" },
  { to: "/recurring", label: "Recurring" },
  { to: "/reports", label: "Reports" },
];

export default function Layout() {
  const { signOut, user } = useAuth();
  const [calculatorOpen, setCalculatorOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">💰 Budget</div>
        <nav>
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <span className="muted small">{user?.email}</span>
          <button className="btn-link" onClick={signOut}>
            Sign out
          </button>
        </div>
      </aside>
      <main className="content">
        <Outlet />
      </main>
      <button
        className="calculator-fab"
        onClick={() => setCalculatorOpen(true)}
        type="button"
        aria-label="Open calculator"
        title="Calculator"
      >
        <span aria-hidden="true">🧮</span>
        <span className="sr-only">Calculator</span>
      </button>
      <button
        className="calendar-fab"
        onClick={() => setCalendarOpen(true)}
        type="button"
        aria-label="Open calendar"
        title="Calendar"
      >
        <span aria-hidden="true">📅</span>
        <span className="sr-only">Calendar</span>
      </button>
      <CalculatorPanel
        open={calculatorOpen}
        onClose={() => setCalculatorOpen(false)}
      />
      <CalendarPanel
        open={calendarOpen}
        onClose={() => setCalendarOpen(false)}
      />
    </div>
  );
}
