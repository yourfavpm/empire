# DY Empire Digital Marketplace - Deployment Guide

This guide provides instructions for deploying the **Supabase-Native** version of the DY Empire Digital Marketplace to Vercel.

---

## 🚀 Quick Start (Vercel)

### 1. Set Up Supabase
1. Create a project at [supabase.com](https://supabase.com).
2. Go to **Settings** -> **API** and copy:
   - `Project URL`
   - `anon` public key
   - `service_role` secret key
3. Go to **Settings** -> **Database** and copy the **Direct Connection String** (Port 5432).

### 2. Prepare Database
Run the initialization script locally to set up necessary database defaults and seed the admin account:
```bash
# Update your .env with production Supabase credentials
npm run db:init # (If you have a script for this, otherwise follow Step 4)
```

### 3. Deploy to Vercel
1. Import your repository to Vercel.
2. Add these **Environment Variables**:

| Variable | Source / Value |
|----------|----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase `anon` key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase `service_role` key |
| `DIRECT_URL` | Supabase Connection URI (Port 5432) |
| `NEXTAUTH_SECRET` | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | `https://your-app.vercel.app` |
| `ADMIN_EMAIL` | Initial Admin Email |
| `ADMIN_PASSWORD` | Initial Admin Password |
| `PAYSTACK_SECRET_KEY` | Paystack Secret Key |
| `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` | Paystack Public Key |
| `CRYPTO_BTC_ADDRESS` | Your BTC Address |
| `CRYPTO_ETH_ADDRESS` | Your ETH Address |
| `CRYPTO_USDT_TRC20_ADDRESS` | Your USDT Address |

### 4. Database Setup (SQL Editor)
If starting with a fresh Supabase project, you must initialize the database structure:
1. Open the **SQL Editor** in your Supabase Dashboard.
2. Click **"New Query"**.
3. Copy the entire contents of the `supabase_init.sql` file in this repository.
4. Paste it into the editor and click **Run**.

This will correctly set up all required UUID defaults, timestamps, and column defaults for the application.

---

## 🛠 Webhook Configuration

### Paystack
1. Log in to [Paystack Dashboard](https://dashboard.paystack.com).
2. Go to **Settings** -> **API Keys & Webhooks**.
3. Set Webhook URL: `https://your-domain.vercel.app/api/payments/paystack/webhook`.

---

## 📦 Key Environment Variables Summary

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://xxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="xxx"
SUPABASE_SERVICE_ROLE_KEY="xxx"
DIRECT_URL="postgres://postgres:password@host:5432/postgres"

# Auth
NEXTAUTH_URL="https://your-domain.vercel.app"
NEXTAUTH_SECRET="xxx"

# Admin Seed
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="password"

# Payments
PAYSTACK_SECRET_KEY="sk_xxx"
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY="pk_xxx"
```

---

## ❓ Support
- Email: dyempiremarketplace@gmail.com
- Repository: https://github.com/yourfavpm/DY-Empire
