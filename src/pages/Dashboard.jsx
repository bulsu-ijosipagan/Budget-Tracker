import { useAccounts, useTransactions, accountBalance } from "../lib/hooks";

export default function Dashboard() {
  const { accounts } = useAccounts();
  const { transactions } = useTransactions();

  const totalBalance = accounts.reduce(
    (sum, a) => sum + accountBalance(a, transactions),
    0,
  );

  const now = new Date();
  const ym = now.toISOString().slice(0, 7);
  const monthTxns = transactions.filter(
    (t) => t.occurred_on.slice(0, 7) === ym,
  );
  const monthIncome = monthTxns
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + Number(t.amount), 0);
  const monthExpense = monthTxns
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + Number(t.amount), 0);

  const recent = transactions.slice(0, 6);

  return (
    <div>
      <div className="dashboard-hero">
        <div>
          <h1>Dashboard</h1>
          <p>
            A quick view of your current balance, this month’s activity, and the
            latest transactions.
          </p>
        </div>
      </div>
      <div className="stat-row">
        <div className="stat">
          <span className="muted small">Total Balance</span>
          <strong>
            ₱
            {totalBalance.toLocaleString(undefined, {
              minimumFractionDigits: 2,
            })}
          </strong>
        </div>
        <div className="stat">
          <span className="muted small">This Month Income</span>
          <strong className="income">+₱{monthIncome.toFixed(2)}</strong>
        </div>
        <div className="stat">
          <span className="muted small">This Month Expense</span>
          <strong className="expense">-₱{monthExpense.toFixed(2)}</strong>
        </div>
      </div>

      <h2>Recent Transactions</h2>
      <section className="dashboard-section table-card">
        <table className="table">
          <tbody>
            {recent.map((t) => (
              <tr key={t.id}>
                <td>{t.occurred_on}</td>
                <td>{t.categories?.name ?? "—"}</td>
                <td className="muted">{t.note}</td>
                <td
                  className={
                    t.type === "income" ? "amount income" : "amount expense"
                  }
                >
                  {t.type === "income" ? "+" : "-"}₱
                  {Number(t.amount).toFixed(2)}
                </td>
              </tr>
            ))}
            {recent.length === 0 && (
              <tr>
                <td className="table-empty">
                  No transactions yet — add one from the Transactions page.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
