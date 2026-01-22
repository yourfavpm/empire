# Digital Asset Marketplace

A secure, admin-controlled digital asset marketplace built with Next.js 14, featuring Paystack payments (Nigeria), manual crypto payments (international), wallet-based access control, and full admin oversight.

## Features

- 🔐 **Role-Based Access**: Buyer and Admin roles with protected routes
- 💳 **Paystack Integration**: Instant payments for Nigerian users
- ₿ **Crypto Payments**: Manual BTC, ETH, USDT support with admin approval
- 👛 **Wallet System**: Fund wallet, unlock assets, track transactions
- 📦 **Asset Management**: Create, edit, and manage digital asset listings
- 💬 **Messaging**: Buyer-admin communication system
- 📊 **Admin Dashboard**: Stats, user management, payment approvals

## Tech Stack

- **Framework**: Next.js 14 (App Router) + TypeScript
- **Database**: PostgreSQL + Prisma ORM v7
- **Auth**: NextAuth.js v5 (Beta)
- **Styling**: Tailwind CSS
- **Payments**: Paystack API

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (local or cloud like Supabase, Railway)

### Installation

1. **Clone and install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment variables**
   
   Copy `.env` and update with your values:
   ```env
   # Database
   DATABASE_URL="postgresql://user:password@localhost:5432/digital_asset"
   
   # NextAuth
   AUTH_SECRET="generate-with-openssl-rand-base64-32"
   AUTH_URL="http://localhost:3000"
   
   # Paystack
   PAYSTACK_SECRET_KEY="sk_test_xxx"
   PAYSTACK_PUBLIC_KEY="pk_test_xxx"
   
   # Crypto Wallets (for display)
   CRYPTO_BTC_ADDRESS="your-btc-address"
   CRYPTO_ETH_ADDRESS="your-eth-address"
   CRYPTO_USDT_TRC20_ADDRESS="your-trc20-address"
   
   # Admin Account
   ADMIN_EMAIL="admin@example.com"
   ADMIN_PASSWORD="SecurePassword123!"
   ADMIN_NAME="Admin User"
   ```

3. **Set up the database**
   ```bash
   # Push schema to database
   npm run db:push
   
   # Seed admin user and sample assets
   npm run db:seed
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open the app**
   - Homepage: http://localhost:3000
   - Admin Login: http://localhost:3000/login (use ADMIN_EMAIL/ADMIN_PASSWORD)

## Project Structure

```
src/
├── app/
│   ├── (auth)/           # Login, Signup pages
│   ├── (public)/         # Home, Assets listing
│   ├── admin/            # Admin dashboard
│   ├── buyer/            # Buyer dashboard
│   └── api/              # API routes
├── components/
│   ├── ui/               # Button, Input, Card, etc.
│   └── layout/           # Navbar, Footer
└── lib/                  # Utils, auth, prisma, paystack
```

## API Routes

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/register` | POST | User registration |
| `/api/assets` | GET/POST | List/create assets |
| `/api/assets/[id]` | GET/PATCH/DELETE | Asset CRUD |
| `/api/assets/[id]/unlock` | POST | Unlock asset with wallet |
| `/api/wallet` | GET | Get wallet balance |
| `/api/payments/paystack/init` | POST | Initialize Paystack payment |
| `/api/payments/paystack/webhook` | POST | Paystack webhook |
| `/api/payments/crypto` | POST | Submit crypto payment |
| `/api/payments/crypto/[id]/approve` | POST | Admin approve crypto |
| `/api/admin/stats` | GET | Dashboard statistics |
| `/api/messages` | GET/POST | Messaging |

## Payment Flows

### Paystack (Nigeria)
1. Buyer clicks "Fund Wallet"
2. Redirected to Paystack checkout
3. Payment verified via webhook
4. Wallet credited automatically

### Crypto (International)
1. Buyer selects crypto network
2. Copies wallet address and sends payment
3. Submits transaction ID (TXID)
4. Admin verifies and approves
5. Wallet credited after approval

## Deployment

1. Set all environment variables on your hosting platform
2. Run `npm run build`
3. Configure Paystack webhook URL to `https://yourdomain.com/api/payments/paystack/webhook`

## License

MIT
