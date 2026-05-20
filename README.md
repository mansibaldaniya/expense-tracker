# AI Expense Tracker

AI Expense Tracker is a production-ready expense management platform built with Next.js, TypeScript, Tailwind CSS, MongoDB, Mongoose, JWT authentication, and Gemini AI.

Live site: https://expense-tracker-mansibaldaniya.vercel.app/

## What This App Does

- Lets users register, sign in, and manage their personal expenses.
- Lets users create monthly budgets and track budget usage.
- Uses AI to extract expense details from pasted text or uploaded files.
- Provides charts, trends, alerts, and export support for reporting.
- Includes an admin panel for managing users, analytics, and budget categories.

## Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui-style components
- MongoDB + Mongoose
- JWT authentication with httpOnly cookies
- bcryptjs password hashing
- Gemini AI expense extraction
- Recharts analytics
- React Hook Form + Zod validation

## Main Features

### Frontend / User Site

- Public landing page with live platform stats from MongoDB.
- User registration and login.
- Personalized dashboard with:
  - total spend
  - total expense count
  - total budgets
  - budget alerts
  - category breakdown charts
  - monthly trend charts
- Expense management:
  - add expense
  - edit expense
  - delete expense
  - filter by category and month
  - sort by created date
  - export expenses as CSV
- Budget management:
  - add budget
  - edit budget
  - delete budget
  - filter by category and month
  - export budgets as CSV
- AI import page:
  - paste text like receipts, SMS, or transaction notes
  - upload PDF, image, DOCX, TXT, or document files
  - review extracted details before saving
- Settings page:
  - change password securely by confirming the current password

### Admin Panel

- Admin dashboard with:
  - total users
  - total expenses
  - total budgets
  - budget alerts
  - user growth chart
  - expense trend chart
  - monthly budget overview
  - recent users
  - recent expenses
- Admin analytics page with:
  - users vs expenses comparison
  - budget health mix
  - top categories
  - monthly signal notes
- Admin user management:
  - search users
  - sort users
  - view user details
  - delete users
  - export users as CSV
- Admin budget category management:
  - create category
  - edit category
  - delete category when unused
  - search categories
  - sort categories
  - export categories as CSV

## Setup

```bash
pnpm install
pnpm dev
```

Open the app at the local Next.js URL shown in the terminal.

## Environment Variables

Create a `.env` file from `.env.example` and set:

- `MONGODB_URI`
- `JWT_SECRET`
- `GEMINI_API_KEY`
- `GEMINI_MODEL` optional, defaults to `gemini-2.5-flash`
- `NEXT_PUBLIC_APP_URL`
- `ADMIN_EMAIL`
- `ADMIN_NAME`
- `ADMIN_PASSWORD`

## Local Development Procedure

1. Clone or open the project in your editor.
2. Install dependencies with `pnpm install`.
3. Copy `.env.example` to `.env`.
4. Fill in the MongoDB, JWT, Gemini, app URL, and admin values.
5. Start the app with `pnpm dev`.
6. Open the frontend at `/frontend`.
7. Sign up or log in as a user.
8. Use the dashboard, expenses, budgets, import, and settings pages.
9. Log in as the admin user to access `/admin`.

## Important Routes

### Frontend

- `/frontend`
- `/frontend/about-us`
- `/frontend/login`
- `/frontend/register`
- `/frontend/dashboard`
- `/frontend/expenses`
- `/frontend/expenses/new`
- `/frontend/expenses/[id]/edit`
- `/frontend/budgets`
- `/frontend/budgets/new`
- `/frontend/budgets/[id]/edit`
- `/frontend/import`
- `/frontend/settings`

### Admin

- `/admin`
- `/admin/analytics`
- `/admin/users`
- `/admin/users/[id]`
- `/admin/budget-categories`
- `/admin/budget-categories/new`
- `/admin/budget-categories/[id]/edit`

### API

- `GET /api/public/overview`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `POST /api/auth/password`
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
- `POST /api/ai/extract-expense/upload`
- `GET /api/export/csv`
- `GET /api/admin/summary`
- `GET /api/admin/users`
- `DELETE /api/admin/users/:id`
- `GET /api/admin/analytics`
- `GET /api/admin/budget-categories`
- `POST /api/admin/budget-categories`
- `PUT /api/admin/budget-categories/:id`
- `DELETE /api/admin/budget-categories/:id`

## How the User Site Works

1. Visit `/frontend`.
2. Register a new account or log in.
3. Go to the dashboard to see spend analytics and budget alerts.
4. Add expenses manually or import them through AI extraction.
5. Create budgets for each category and month.
6. Filter, edit, delete, and export records as needed.
7. Update your password in the settings page.

## How the Admin Panel Works

1. Log in with the admin credentials listed below.
2. Open `/admin`.
3. Review platform totals and trend charts.
4. Open `/admin/analytics` for deeper reporting.
5. Manage users from `/admin/users`.
6. Manage budget categories from `/admin/budget-categories`.
7. Export admin data as CSV when needed.

## Admin Login Details

Use these credentials to access the admin panel:

- Email: `mansihb1802@gmail.com`
- Password: `Admin@123`

## Sample User Login Details

Use these credentials to sign in as a normal user:

- Email: `michael.dsouza@yopmail.com`
- Password: `Test@123`

## Notes

- Protected pages are enforced by `src/proxy.ts` and the app authentication layer.
- MongoDB connection reuse is handled in `src/lib/db.ts`.
- Admin bootstrap uses `ADMIN_EMAIL`, `ADMIN_NAME`, and `ADMIN_PASSWORD` to ensure an admin user exists in MongoDB.
- AI requests are rate limited in memory for safety.
- The app is Vercel-ready once the environment variables are configured.

## Vercel Deployment

1. Create a MongoDB Atlas database and copy the connection string into `MONGODB_URI`.
2. In Vercel, add these environment variables for Production, Preview, and Development:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `GEMINI_API_KEY`
   - `GEMINI_MODEL` if you want something other than `gemini-2.5-flash`
   - `NEXT_PUBLIC_APP_URL`
   - `ADMIN_EMAIL`
   - `ADMIN_NAME`
   - `ADMIN_PASSWORD`
3. Set `NEXT_PUBLIC_APP_URL` to your deployed domain, for example `https://your-app.vercel.app`.
4. Deploy the repository to Vercel.

### Recommended Atlas URI Format

Use the standard Atlas format with a database name, for example:

```bash
mongodb+srv://<user>:<password>@<cluster>.mongodb.net/expense-tracker?retryWrites=true&w=majority
```

### Notes for Vercel

- Keep the MongoDB user restricted to the app database.
- Do not commit your production `.env` file.
- If you rotate `JWT_SECRET`, existing sessions will expire and users will need to sign in again.
