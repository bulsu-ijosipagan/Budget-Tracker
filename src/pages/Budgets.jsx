import { useState, useMemo } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";
import { useCategories, useTransactions } from "../lib/hooks";

function monthSpend(categoryId, transactions) {
  const now = new Date();
  const ym = now.toISOString().slice(0, 7);
  return transactions
    .filter(
      (t) =>
        t.category_id === categoryId &&
        t.type === "expense" &&
        t.occurred_on.slice(0, 7) === ym,
    )
    .reduce((sum, t) => sum + Number(t.amount), 0);
}

export default function Budgets() {
  const { user } = useAuth();
  const { categories, refresh: refreshCategories } = useCategories();
  const { transactions } = useTransactions();
  const [budgets, setBudgets] = useState([]);
  const [catName, setCatName] = useState("");
  const [catKind, setCatKind] = useState("expense");
  const [limits, setLimits] = useState({});

  async function loadBudgets() {
    const { data } = await supabase.from("budgets").select("*");
    setBudgets(data ?? []);
  }
  useMemo(() => {
    loadBudgets();
  }, []);

  async function addCategory(e) {
    e.preventDefault();
    await supabase
      .from("categories")
      .insert({ user_id: user.id, name: catName, kind: catKind });
    setCatName("");
    refreshCategories();
  }

  async function deleteCategory(categoryId) {
    const confirmed = window.confirm("Delete this category?");
    if (!confirmed) return;

    await supabase.from("categories").delete().eq("id", categoryId);
    await Promise.all([refreshCategories(), loadBudgets()]);
  }

  async function saveLimit(categoryId) {
    const value = Number(limits[categoryId]);
    if (!value) return;
    await supabase
      .from("budgets")
      .upsert(
        { user_id: user.id, category_id: categoryId, monthly_limit: value },
        { onConflict: "user_id,category_id" },
      );
    loadBudgets();
  }

  const expenseCategories = categories.filter((c) => c.kind === "expense");

  return (
    <div>
      <h1>Budgets</h1>
      <p className="muted">Set a monthly spending limit per category.</p>

      <form className="inline-form" onSubmit={addCategory}>
        <input
          placeholder="New category"
          value={catName}
          onChange={(e) => setCatName(e.target.value)}
          required
        />
        <select value={catKind} onChange={(e) => setCatKind(e.target.value)}>
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>
        <button className="btn-primary" type="submit">
          Add Category
        </button>
      </form>

      <div className="card-grid">
        {expenseCategories.map((c) => {
          const existing = budgets.find((b) => b.category_id === c.id);
          const spent = monthSpend(c.id, transactions);
          const limit = existing?.monthly_limit;
          const pct = limit ? Math.min(100, (spent / limit) * 100) : 0;
          return (
            <div className="card" key={c.id}>
              <strong>{c.name}</strong>
              {limit ? (
                <>
                  <div className="progress-track">
                    <div
                      className={
                        pct >= 100 ? "progress-fill over" : "progress-fill"
                      }
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="muted small">
                    ₱{spent.toFixed(2)} of ₱{Number(limit).toFixed(2)}
                  </span>
                </>
              ) : (
                <span className="muted small">No limit set</span>
              )}
              <div className="inline-form tight">
                <input
                  type="number"
                  placeholder="Monthly limit"
                  defaultValue={limit ?? ""}
                  onChange={(e) =>
                    setLimits((l) => ({ ...l, [c.id]: e.target.value }))
                  }
                />
                <button
                  className="btn-secondary"
                  onClick={() => saveLimit(c.id)}
                  type="button"
                >
                  Save
                </button>
                <button
                  className="btn-link danger"
                  onClick={() => deleteCategory(c.id)}
                  type="button"
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}
        {expenseCategories.length === 0 && (
          <p className="muted">Add an expense category to start budgeting.</p>
        )}
      </div>
    </div>
  );
}
