# DY Empire Digital Marketplace - Vercel Deployment Guide

## Prerequisites
- GitHub account (repository: https://github.com/yourfavpm/DY-Empire.git)
- Vercel account (free tier works)
- PostgreSQL database (Neon, Supabase, or Vercel Postgres)
- Paystack account for payments

---

## Step 1: Set Up PostgreSQL Database

### Option A: Neon (Recommended - Free)
1. Go to [neon.tech](https://neon.tech) and create an account
2. Create a new project
3. Copy the connection string (looks like: `postgresql://user:password@host/database?sslmode=require`)
4. Save this - you'll need it for `DATABASE_URL`

### Option B: Supabase (Free)
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings → Database → Connection string
4. Copy the URI connection string

---

## Step 2: Deploy to Vercel

### 2.1 Import Project
1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **"Add New..."** → **"Project"**
3. Find and import **DY-Empire** repository
4. Click **"Import"**

### 2.2 Configure Project Settings
Before deploying, configure these settings:

**Framework Preset:** Next.js (auto-detected)
**Root Directory:** `./` (default)

### 2.3 Add Environment Variables
Click **"Environment Variables"** and add each of these:

| Variable | Value | Notes |
|----------|-------|-------|
| `DATABASE_URL` | Your PostgreSQL connection string | From Step 1 |
| `NEXTAUTH_URL` | `https://your-domain.vercel.app` | Will be your Vercel URL |
| `NEXTAUTH_SECRET` | Random 32+ character string | Generate with: `openssl rand -base64 32` |
| `PAYSTACK_SECRET_KEY` | `sk_live_xxxxx` or `sk_test_xxxxx` | From Paystack Dashboard |
| `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` | `pk_live_xxxxx` or `pk_test_xxxxx` | From Paystack Dashboard |
| `CRYPTO_BTC_ADDRESS` | Your Bitcoin address | For crypto payments |
| `CRYPTO_ETH_ADDRESS` | Your Ethereum address | For crypto payments |
| `CRYPTO_USDT_TRC20_ADDRESS` | Your USDT TRC20 address | For crypto payments |

### 2.4 Deploy
Click **"Deploy"** and wait for the build to complete (usually 2-3 minutes).

---

## Step 3: Initialize Database

After deployment, you need to push the schema and seed data.

### 3.1 Open Vercel CLI or use local terminal
```bash
# Install Vercel CLI if needed
npm i -g vercel

# Link to your project
vercel link

# Pull environment variables
vercel env pull .env.local
```

### 3.2 Push Database Schema
```bash
# Push schema to database
npx prisma db push

# Generate Prisma client
npx prisma generate

# Seed the database
npx ts-node --transpile-only prisma/seed.ts
```

### 3.3 Alternative: Run from Vercel Dashboard
1. Go to your project in Vercel
2. Click **"Storage"** tab
3. If using Vercel Postgres, you can run migrations there

---

## Step 4: Configure Paystack Webhook

1. Log in to [Paystack Dashboard](https://dashboard.paystack.com)
2. Go to **Settings** → **API Keys & Webhooks**
3. Set Webhook URL: `https://your-domain.vercel.app/api/payments/paystack/webhook`
4. Enable events: `charge.success`

---

## Step 5: Update NEXTAUTH_URL

After your first deployment, Vercel will give you a URL like `dy-empire-xxx.vercel.app`

1. Go to Vercel Project → **Settings** → **Environment Variables**
2. Update `NEXTAUTH_URL` to your actual Vercel URL
3. **Redeploy** the project for changes to take effect

---

## Step 6: Custom Domain (Optional)

1. Go to Vercel Project → **Settings** → **Domains**
2. Add your custom domain
3. Configure DNS as instructed
4. Update `NEXTAUTH_URL` to your custom domain
5. Redeploy

---

## Login Credentials

After seeding the database, use these credentials:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@dyempire.com | Admin123!@# |
| Test User | test@user.com | Test123!@# |

---

## Troubleshooting

### Build Fails
- Check Vercel build logs for errors
- Ensure all environment variables are set
- Make sure `DATABASE_URL` is correct

### Auth Issues
- Verify `NEXTAUTH_SECRET` is set
- Verify `NEXTAUTH_URL` matches your actual URL
- Clear browser cookies and try again

### Database Connection
- Ensure database is accessible from Vercel (not localhost)
- Check if SSL is required (`?sslmode=require` in connection string)
- Verify database credentials

### Paystack Not Working
- Verify you're using the correct keys (test vs live)
- Check webhook URL is correct
- Ensure `charge.success` event is enabled

---

## Environment Variables Summary

```bash
# Database
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"

# NextAuth
NEXTAUTH_URL="https://your-domain.vercel.app"
NEXTAUTH_SECRET="your-32-character-secret-here"

# Paystack
PAYSTACK_SECRET_KEY="sk_test_xxxxx"
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY="pk_test_xxxxx"

# Crypto Addresses
CRYPTO_BTC_ADDRESS="your-btc-address"
CRYPTO_ETH_ADDRESS="your-eth-address"
CRYPTO_USDT_TRC20_ADDRESS="your-usdt-address"
```

---

## Support

- Repository: https://github.com/yourfavpm/DY-Empire
- Email: dyempiremarketplace@gmail.com
