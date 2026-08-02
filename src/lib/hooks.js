import { useEffect, useState, useCallback } from 'react'
import { supabase } from './supabaseClient'
import { useAuth } from '../context/AuthContext'

export function useAccounts() {
  const { user } = useAuth()
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const { data } = await supabase.from('accounts').select('*').order('created_at')
    setAccounts(data ?? [])
    setLoading(false)
  }, [user])

  useEffect(() => { refresh() }, [refresh])

  return { accounts, loading, refresh }
}

export function useCategories() {
  const { user } = useAuth()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const { data } = await supabase.from('categories').select('*').order('created_at')
    setCategories(data ?? [])
    setLoading(false)
  }, [user])

  useEffect(() => { refresh() }, [refresh])

  return { categories, loading, refresh }
}

export function useTransactions() {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const { data } = await supabase
      .from('transactions')
      .select('*, accounts(name), categories(name, color)')
      .order('occurred_on', { ascending: false })
    setTransactions(data ?? [])
    setLoading(false)
  }, [user])

  useEffect(() => { refresh() }, [refresh])

  return { transactions, loading, refresh }
}

export function accountBalance(account, transactions) {
  const txns = transactions.filter((t) => t.account_id === account.id)
  const delta = txns.reduce((sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount), 0)
  return Number(account.starting_balance) + delta
}
