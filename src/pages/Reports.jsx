import { useMemo } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts'
import { useTransactions } from '../lib/hooks'

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#06b6d4', '#a855f7', '#eab308', '#ec4899']

export default function Reports() {
  const { transactions } = useTransactions()

  const byCategory = useMemo(() => {
    const map = {}
    transactions.filter((t) => t.type === 'expense').forEach((t) => {
      const name = t.categories?.name ?? 'Uncategorized'
      map[name] = (map[name] || 0) + Number(t.amount)
    })
    return Object.entries(map).map(([name, value]) => ({ name, value }))
  }, [transactions])

  const byMonth = useMemo(() => {
    const map = {}
    transactions.forEach((t) => {
      const ym = t.occurred_on.slice(0, 7)
      map[ym] = map[ym] || { month: ym, income: 0, expense: 0 }
      map[ym][t.type] += Number(t.amount)
    })
    return Object.values(map).sort((a, b) => a.month.localeCompare(b.month)).slice(-6)
  }, [transactions])

  return (
    <div>
      <h1>Reports</h1>

      <h2>Spending by Category</h2>
      {byCategory.length ? (
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie data={byCategory} dataKey="value" nameKey="name" outerRadius={100} label>
                {byCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v) => `₱${Number(v).toFixed(2)}`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      ) : <p className="muted">No expense data yet.</p>}

      <h2>Income vs Expense (last 6 months)</h2>
      {byMonth.length ? (
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <BarChart data={byMonth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(v) => `₱${Number(v).toFixed(2)}`} />
              <Legend />
              <Bar dataKey="income" fill="#22c55e" />
              <Bar dataKey="expense" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : <p className="muted">No data yet.</p>}
    </div>
  )
}
