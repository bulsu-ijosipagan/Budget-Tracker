import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import { useAccounts, useTransactions, accountBalance } from '../lib/hooks'

export default function Accounts() {
  const { user } = useAuth()
  const { accounts, refresh } = useAccounts()
  const { transactions } = useTransactions()
  const [name, setName] = useState('')
  const [type, setType] = useState('cash')
  const [starting, setStarting] = useState('0')

  async function addAccount(e) {
    e.preventDefault()
    await supabase.from('accounts').insert({
      user_id: user.id,
      name,
      type,
      starting_balance: Number(starting) || 0,
    })
    setName(''); setStarting('0')
    refresh()
  }

  async function removeAccount(id) {
    if (!confirm('Delete this account and all its transactions?')) return
    await supabase.from('accounts').delete().eq('id', id)
    refresh()
  }

  return (
    <div>
      <h1>Accounts</h1>
      <p className="muted">Track balances across cash, bank, e-wallet, or credit accounts.</p>

      <form className="inline-form" onSubmit={addAccount}>
        <input placeholder="Account name" value={name} onChange={(e) => setName(e.target.value)} required />
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="cash">Cash</option>
          <option value="bank">Bank</option>
          <option value="ewallet">E-wallet</option>
          <option value="credit_card">Credit Card</option>
        </select>
        <input type="number" step="0.01" placeholder="Starting balance" value={starting} onChange={(e) => setStarting(e.target.value)} />
        <button className="btn-primary" type="submit">Add Account</button>
      </form>

      <div className="card-grid">
        {accounts.map((a) => (
          <div className="card" key={a.id}>
            <div className="card-row">
              <strong>{a.name}</strong>
              <button className="btn-link danger" onClick={() => removeAccount(a.id)}>Delete</button>
            </div>
            <span className="muted small">{a.type.replace('_', ' ')}</span>
            <p className="balance">₱{accountBalance(a, transactions).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
          </div>
        ))}
        {accounts.length === 0 && <p className="muted">No accounts yet — add one above.</p>}
      </div>
    </div>
  )
}
