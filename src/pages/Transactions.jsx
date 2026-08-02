import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import { useAccounts, useCategories, useTransactions } from '../lib/hooks'

export default function Transactions() {
  const { user } = useAuth()
  const { accounts } = useAccounts()
  const { categories } = useCategories()
  const { transactions, refresh } = useTransactions()

  const [form, setForm] = useState({
    account_id: '', category_id: '', amount: '', type: 'expense',
    note: '', occurred_on: new Date().toISOString().slice(0, 10),
  })

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function addTransaction(e) {
    e.preventDefault()
    if (!form.account_id || !form.amount) return
    await supabase.from('transactions').insert({
      user_id: user.id,
      account_id: form.account_id,
      category_id: form.category_id || null,
      amount: Number(form.amount),
      type: form.type,
      note: form.note,
      occurred_on: form.occurred_on,
    })
    setForm((f) => ({ ...f, amount: '', note: '' }))
    refresh()
  }

  async function removeTransaction(id) {
    await supabase.from('transactions').delete().eq('id', id)
    refresh()
  }

  const filteredCategories = categories.filter((c) => c.kind === form.type)

  return (
    <div>
      <h1>Transactions</h1>

      <form className="inline-form wrap" onSubmit={addTransaction}>
        <select value={form.type} onChange={(e) => update('type', e.target.value)}>
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>
        <select value={form.account_id} onChange={(e) => update('account_id', e.target.value)} required>
          <option value="">Account</option>
          {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
        <select value={form.category_id} onChange={(e) => update('category_id', e.target.value)}>
          <option value="">Category</option>
          {filteredCategories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <input type="number" step="0.01" placeholder="Amount" value={form.amount} onChange={(e) => update('amount', e.target.value)} required />
        <input type="date" value={form.occurred_on} onChange={(e) => update('occurred_on', e.target.value)} />
        <input placeholder="Note (optional)" value={form.note} onChange={(e) => update('note', e.target.value)} />
        <button className="btn-primary" type="submit">Add</button>
      </form>

      <table className="table">
        <thead>
          <tr><th>Date</th><th>Account</th><th>Category</th><th>Note</th><th>Amount</th><th></th></tr>
        </thead>
        <tbody>
          {transactions.map((t) => (
            <tr key={t.id}>
              <td>{t.occurred_on}</td>
              <td>{t.accounts?.name}</td>
              <td>{t.categories?.name ?? '—'}</td>
              <td className="muted">{t.note}</td>
              <td className={t.type === 'income' ? 'amount income' : 'amount expense'}>
                {t.type === 'income' ? '+' : '-'}₱{Number(t.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </td>
              <td><button className="btn-link danger" onClick={() => removeTransaction(t.id)}>×</button></td>
            </tr>
          ))}
          {transactions.length === 0 && (
            <tr><td colSpan={6} className="muted">No transactions yet.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
