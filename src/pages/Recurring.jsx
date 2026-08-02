import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import { useAccounts, useCategories, useTransactions } from '../lib/hooks'

function addInterval(dateStr, frequency) {
  const d = new Date(dateStr)
  if (frequency === 'daily') d.setDate(d.getDate() + 1)
  if (frequency === 'weekly') d.setDate(d.getDate() + 7)
  if (frequency === 'monthly') d.setMonth(d.getMonth() + 1)
  if (frequency === 'yearly') d.setFullYear(d.getFullYear() + 1)
  return d.toISOString().slice(0, 10)
}

export default function Recurring() {
  const { user } = useAuth()
  const { accounts } = useAccounts()
  const { categories } = useCategories()
  const { refresh: refreshTransactions } = useTransactions()
  const [items, setItems] = useState([])
  const [form, setForm] = useState({
    account_id: '', category_id: '', amount: '', type: 'expense',
    note: '', frequency: 'monthly', next_run: new Date().toISOString().slice(0, 10),
  })

  async function load() {
    const { data } = await supabase.from('recurring_transactions').select('*, accounts(name), categories(name)').order('next_run')
    setItems(data ?? [])
  }
  useEffect(() => { load() }, [])

  function update(field, value) { setForm((f) => ({ ...f, [field]: value })) }

  async function addRecurring(e) {
    e.preventDefault()
    if (!form.account_id || !form.amount) return
    await supabase.from('recurring_transactions').insert({
      user_id: user.id, ...form, category_id: form.category_id || null, amount: Number(form.amount),
    })
    setForm((f) => ({ ...f, amount: '', note: '' }))
    load()
  }

  async function remove(id) {
    await supabase.from('recurring_transactions').delete().eq('id', id)
    load()
  }

  // Runs a due recurring item: creates the transaction and advances next_run
  async function runNow(item) {
    await supabase.from('transactions').insert({
      user_id: user.id, account_id: item.account_id, category_id: item.category_id,
      amount: item.amount, type: item.type, note: item.note, occurred_on: item.next_run,
    })
    await supabase.from('recurring_transactions').update({ next_run: addInterval(item.next_run, item.frequency) }).eq('id', item.id)
    load()
    refreshTransactions()
  }

  return (
    <div>
      <h1>Recurring Transactions</h1>
      <p className="muted">Set up templates for bills, salary, or subscriptions. Click "Run" when one is due to post it as a transaction.</p>

      <form className="inline-form wrap" onSubmit={addRecurring}>
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
          {categories.filter((c) => c.kind === form.type).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <input type="number" step="0.01" placeholder="Amount" value={form.amount} onChange={(e) => update('amount', e.target.value)} required />
        <select value={form.frequency} onChange={(e) => update('frequency', e.target.value)}>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>
        <input type="date" value={form.next_run} onChange={(e) => update('next_run', e.target.value)} />
        <input placeholder="Note" value={form.note} onChange={(e) => update('note', e.target.value)} />
        <button className="btn-primary" type="submit">Add</button>
      </form>

      <table className="table">
        <thead><tr><th>Next Run</th><th>Freq</th><th>Account</th><th>Category</th><th>Amount</th><th></th></tr></thead>
        <tbody>
          {items.map((it) => (
            <tr key={it.id}>
              <td>{it.next_run}</td>
              <td>{it.frequency}</td>
              <td>{it.accounts?.name}</td>
              <td>{it.categories?.name ?? '—'}</td>
              <td className={it.type === 'income' ? 'amount income' : 'amount expense'}>
                {it.type === 'income' ? '+' : '-'}₱{Number(it.amount).toFixed(2)}
              </td>
              <td>
                <button className="btn-link" onClick={() => runNow(it)}>Run</button>
                <button className="btn-link danger" onClick={() => remove(it.id)}>Delete</button>
              </td>
            </tr>
          ))}
          {items.length === 0 && <tr><td colSpan={6} className="muted">No recurring items yet.</td></tr>}
        </tbody>
      </table>
    </div>
  )
}
