# AI Expense Tracker

Production-ready expense tracking platform built with Next.js App Router, TypeScript, Tailwind CSS, MongoDB, Mongoose, JWT auth, and Gemini AI.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui-style primitives
- MongoDB + Mongoose
- JWT authentication with httpOnly cookies
- bcryptjs password hashing
- Gemini 2.5 Flash expense extraction
- Recharts analytics
- React Hook Form + Zod validation

## Setup

```bash
pnpm install
pnpm dev
```

## Environment

Create a `.env` file from `.env.example` and set:

- `MONGODB_URI`
- `JWT_SECRET`
- `GEMINI_API_KEY`
- `GEMINI_MODEL` optional, defaults to `gemini-2.5-flash`
- `NEXT_PUBLIC_APP_URL`
- `ADMIN_EMAIL`
- `ADMIN_NAME`
- `ADMIN_PASSWORD`

## Key Routes

### Frontend

- `/frontend`
- `/frontend/about-us`
- `/frontend/login`
- `/frontend/register`
- `/frontend/dashboard`
- `/frontend/expenses`
- `/frontend/budgets`
- `/frontend/import`
- `/frontend/settings`

### Admin

- `/admin`
- `/admin/users`
- `/admin/analytics`

### API

- `GET /api/public/overview`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET /api/expenses`
- `POST /api/expenses`
- `PUT /api/expenses/:id`
- `DELETE /api/expenses/:id`
- `GET /api/budgets`
- `POST /api/budgets`
- `PUT /api/budgets/:id`
- `DELETE /api/budgets/:id`
- `GET /api/dashboard`
- `POST /api/ai/extract-expense`
- `GET /api/export/csv`
- `GET /api/admin/summary`
- `GET /api/admin/users`
- `GET /api/admin/analytics`

### Uploads

- The AI import page accepts pasted text, PDFs, images, and DOCX uploads.

## Notes

- Protected pages are enforced by `src/middleware.ts`.
- MongoDB connection reuse is handled in `src/lib/db.ts`.
- Admin bootstrap uses `ADMIN_EMAIL`, `ADMIN_NAME`, and `ADMIN_PASSWORD` to ensure an admin user exists in MongoDB.
- AI requests are rate limited in memory for safety.
- The app is Vercel-ready once the environment variables are configured.
