# Full Test Development Environment

This guide walks you through setting up a complete local dev environment so you can test all features (auth, listings, purchases, Stripe, etc.).

---

## 1. Prerequisites

- Node.js 18+
- npm (or pnpm/yarn)
- A [Supabase](https://supabase.com) account
- A [Stripe](https://stripe.com) account (for payments)

---

## 2. Environment Variables

### Copy the template

```bash
cp .env.example .env.local
```

### Required variables

| Variable | Where to get it |
|----------|-----------------|
| `DATABASE_URL` | Supabase → **Settings → Database** → Connection string (URI). Use the **pooler** connection for serverless. |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → **Settings → API** → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → **Settings → API** → `anon` public key |

### Stripe (for purchases & subscriptions)

| Variable | Where to get it |
|----------|-----------------|
| `STRIPE_SECRET_KEY` | Stripe Dashboard → **Developers → API keys** → Secret key (use **test** key: `sk_test_...`) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Same page → Publishable key (`pk_test_...`) |
| `STRIPE_PRO_PRICE_ID` | Stripe → **Products** → create a Pro product → copy the Price ID (`price_...`). Optional if you skip Pro. |
| `STRIPE_WEBHOOK_SECRET` | See [Stripe webhooks](#4-stripe-webhooks-local) below. Optional for basic testing. |

---

## 3. Supabase Setup

1. Create a project at [supabase.com](https://supabase.com).
2. In **Settings → API**, copy the Project URL and anon key into `.env.local`.
3. In **Settings → Database**, copy the connection string into `DATABASE_URL`.
4. In **Authentication → URL Configuration**:
   - **Site URL**: `http://localhost:3000`
   - **Redirect URLs**: add `http://localhost:3000/auth/callback`

5. (Optional) Enable **Email** auth and configure:
   - **Confirm email**: turn off for faster local testing, or use a real email.
   - **Email templates**: customize if needed.

---

## 4. Database

```bash
npm install
npm run db:push
```

This syncs your Prisma schema to the Supabase Postgres database.

---

## 5. Stripe Webhooks (Local)

To test purchase completion, subscription events, etc., Stripe needs to send webhooks to your local server.

1. Install the [Stripe CLI](https://stripe.com/docs/stripe-cli).
2. Log in: `stripe login`
3. Forward webhooks to your dev server:

   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```

4. The CLI prints a webhook signing secret (`whsec_...`). Add it to `.env.local` as `STRIPE_WEBHOOK_SECRET`.
5. Restart your Next.js dev server after adding the secret.

---

## 6. Run the App

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## 7. Test Checklist

| Feature | How to test |
|---------|-------------|
| **Auth** | Sign up, log in, sign out at `/auth/signup`, `/auth/login` |
| **Listings** | Create a listing (requires auth), browse listings |
| **Purchase** | Buy a listing (Stripe test card: `4242 4242 4242 4242`) |
| **Pro subscription** | Go to `/pricing`, subscribe (test card above) |
| **Billing portal** | Settings → Manage subscription |
| **Messages** | Start a conversation from a listing |
| **Wishlist** | Add/remove listings from wishlist |
| **Notifications** | Trigger actions that create notifications |

---

## 8. Vercel Preview Deployments

For preview deployments (e.g. PR previews):

1. In your Vercel project → **Settings → Environment Variables**, add:
   - `DATABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `STRIPE_SECRET_KEY`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - `STRIPE_PRO_PRICE_ID` (if using Pro)
   - `STRIPE_WEBHOOK_SECRET` (create a webhook endpoint in Stripe for your preview URL)

2. In Supabase **Authentication → URL Configuration**, add your preview URL:
   - `https://<your-preview>.vercel.app`
   - `https://<your-preview>.vercel.app/auth/callback`

3. In Stripe **Developers → Webhooks**, add an endpoint for each preview URL (or use a wildcard if supported) and copy the signing secret.

4. After first deploy, run `npm run db:push` if the schema changed (or use Supabase migrations).

---

## 9. Stripe Test Cards

- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **3D Secure**: `4000 0025 0000 3155`

Use any future expiry date and any 3-digit CVC.
