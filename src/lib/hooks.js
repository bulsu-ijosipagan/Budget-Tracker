import { useEffect, useState, useCallback } from "react";
import { supabase } from "./supabaseClient";
import { useAuth } from "../context/AuthContext";

export function useAccounts() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("accounts")
      .select("*")
      .order("created_at");
    setAccounts(data ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { accounts, loading, refresh };
}

export function useCategories() {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("categories")
      .select("*")
      .order("created_at");
    setCategories(data ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { categories, loading, refresh };
}

// Shared transactions cache so multiple components stay in sync.
let _transactionsCache = [];
let _transactionsLoading = false;
const _transactionsSubscribers = new Set();

async function _fetchTransactions(user) {
  if (!user) return;
  _transactionsLoading = true;
  _notifyTransactions();
  const { data, error } = await supabase
    .from("transactions")
    .select("*, accounts(name), categories(name, color)")
    .order("occurred_on", { ascending: false });
  console.log("useTransactions._fetch:", { data, error });
  _transactionsCache = data ?? [];
  _transactionsLoading = false;
  _notifyTransactions();
}

function _notifyTransactions() {
  for (const cb of _transactionsSubscribers)
    cb(_transactionsCache, _transactionsLoading);
}

export function useTransactions() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState(_transactionsCache);
  const [loading, setLoading] = useState(_transactionsLoading);

  useEffect(() => {
    function handle(v, l) {
      setTransactions(v);
      setLoading(l);
    }
    _transactionsSubscribers.add(handle);
    // ensure we have data for the current user
    if (user && _transactionsCache.length === 0 && !_transactionsLoading) {
      _fetchTransactions(user);
    }
    return () => _transactionsSubscribers.delete(handle);
  }, [user]);

  const refresh = useCallback(() => {
    _fetchTransactions(user);
  }, [user]);

  return { transactions, loading, refresh };
}

export function accountBalance(account, transactions) {
  const txns = transactions.filter((t) => t.account_id === account.id);
  const delta = txns.reduce(
    (sum, t) => sum + (t.type === "income" ? t.amount : -t.amount),
    0,
  );
  return Number(account.starting_balance) + delta;
}
