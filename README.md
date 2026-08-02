# Budget Tracker

A personal budgeting app: multiple accounts, categorized transactions, monthly
budget limits, recurring transactions, and reports — built with React
(Vite) + Supabase.

## 1. Create a Supabase project
1. Go to https://supabase.com, sign up, and click **New Project**.
2. Pick a name/password/region and wait ~2 min for it to provision.
3. In the project, go to **Project Settings -> API**. Copy the **Project URL**
   and the **anon public key**.

## 2. Set up the database
1. In the Supabase dashboard, open **SQL Editor -> New query**.
2. Paste the contents of `supabase/schema.sql` and click **Run**.
   This creates the tables (`accounts`, `categories`, `transactions`,
   `budgets`, `recurring_transactions`) with row-level security so each
   user only sees their own data.
3. Go to **Authentication -> Providers** and make sure **Email** is enabled
   (it is by default). For faster local testing you can turn off
   "Confirm email" under Authentication -> Settings.

## 3. Configure the app
1. Copy `.env.example` to `.env`.
2. Fill in the two values from step 1:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

## 4. Run it
```bash
npm install
npm run dev
```
Open the printed local URL, sign up with an email/password, and start
adding accounts.

## Project structure
```
src/
  lib/supabaseClient.js   # Supabase client init
  lib/hooks.js             # data-fetching hooks (accounts, categories, transactions)
  context/AuthContext.jsx  # auth state + sign in/up/out
  components/Layout.jsx    # sidebar nav shell
  pages/
    Login.jsx
    Dashboard.jsx
    Accounts.jsx
    Transactions.jsx
    Budgets.jsx             # also manages categories
    Recurring.jsx
    Reports.jsx             # pie + bar charts (recharts)
supabase/schema.sql        # tables + RLS policies
```

## How the pieces fit together
- **Accounts** — cash/bank/e-wallet/credit card "buckets". Balance =
  starting balance + all transactions on that account.
- **Categories** — created from the Budgets page, tagged expense or income.
- **Transactions** — the core ledger; each one belongs to an account and
  optionally a category.
- **Budgets** — a monthly limit per expense category; the Budgets page
  shows current-month spend vs. limit with a progress bar.
- **Recurring** — templates (e.g. "Rent, 15000, monthly"). Click **Run**
  when one is due; it posts a transaction and advances `next_run`. (For a
  fully automatic version later, this same logic could run in a Supabase
  Edge Function on a cron schedule instead of a manual click.)
- **Reports** — category breakdown (pie) and income vs. expense by month
  (bar), computed client-side from the transactions already loaded.

## Deploying
Any static host works (Vercel, Netlify, Cloudflare Pages): run
`npm run build` and deploy the `dist/` folder, setting the same two
`VITE_SUPABASE_*` env vars in the host's dashboard.
