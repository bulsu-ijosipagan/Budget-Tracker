-- Budget Tracker schema
-- Run this in the Supabase SQL Editor (Project > SQL Editor > New query)

-- Accounts (e.g. Cash, GCash, BDO Savings, Credit Card)
create table accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  name text not null,
  type text not null default 'cash', -- cash, bank, ewallet, credit_card
  starting_balance numeric not null default 0,
  created_at timestamptz default now()
);

-- Categories
create table categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  name text not null,
  kind text not null default 'expense', -- expense or income
  color text default '#6366f1',
  created_at timestamptz default now()
);

-- Transactions
create table transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  account_id uuid references accounts on delete cascade not null,
  category_id uuid references categories on delete set null,
  amount numeric not null, -- positive number
  type text not null default 'expense', -- expense or income
  note text,
  occurred_on date not null default current_date,
  created_at timestamptz default now()
);

-- Budgets (per category monthly limit)
create table budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  category_id uuid references categories on delete cascade not null,
  monthly_limit numeric not null,
  created_at timestamptz default now(),
  unique (user_id, category_id)
);

-- Recurring transactions (templates that generate transactions)
create table recurring_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  account_id uuid references accounts on delete cascade not null,
  category_id uuid references categories on delete set null,
  amount numeric not null,
  type text not null default 'expense',
  note text,
  frequency text not null default 'monthly', -- daily, weekly, monthly, yearly
  next_run date not null,
  created_at timestamptz default now()
);

-- Row Level Security: users only see their own data
alter table accounts enable row level security;
alter table categories enable row level security;
alter table transactions enable row level security;
alter table budgets enable row level security;
alter table recurring_transactions enable row level security;

create policy "own accounts" on accounts for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own categories" on categories for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own transactions" on transactions for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own budgets" on budgets for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own recurring" on recurring_transactions for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
