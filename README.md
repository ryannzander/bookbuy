# BuyBook – School Book Exchange

A T3-style book exchange for schools: list textbooks, buy/sell, leave reviews, and run auctions. Built with Next.js, Supabase (Postgres + Auth), Prisma, tRPC, shadcn/ui, and Tailwind.

## Setup

1. **Copy environment variables**
   ```bash
   cp .env.example .env.local
   ```
2. **Supabase** – Create a project at [supabase.com](https://supabase.com). In **Settings → API**: copy the project URL and anon key into `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`. In **Settings → Database**: copy the connection string (URI) into `DATABASE_URL`.
3. **Auth redirect** – In Supabase **Authentication → URL Configuration**, set Site URL to `http://localhost:3000` (dev) and add `http://localhost:3000/auth/callback` to Redirect URLs. For production, add your Vercel URL and `https://<your-app>.vercel.app/auth/callback`.
4. **Database**
   ```bash
   npm run db:push
   ```
5. **Run the app**
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000).

## Deploy on Vercel

- In the Vercel project, set **Environment Variables**: `DATABASE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- Use the same Supabase connection string for `DATABASE_URL` (e.g. from **Settings → Database**; pooler connection is fine).
- After first deploy, run migrations from your machine with `npm run db:push` (or use Supabase migrations). Optional: add a [Vercel Cron Job](https://vercel.com/docs/cron-jobs) that calls an API route to resolve ended auctions.

## Getting Started (dev)

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
