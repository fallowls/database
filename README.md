# CRM (Neon schema aligned)

This app has been refactored to align with the **existing Neon Postgres schema** used by the lead database.

## What changed
- The previous CRM schema (users/sessions/tags/import_jobs/etc) has been **removed** from the application code.
- The app now uses ONLY these Neon tables (public):
  - `company`
  - `leads`
  - `contacts`
  - `account_aliases`
  - staging tables: `staging_apollo`, `staging_lusha`, `staging_company_apollo_accounts`
- Authentication has been **disabled** (no users/sessions tables exist in Neon). Endpoints are open by default.

## Setup

1) Install deps

```bash
npm install
```

2) Set env

Create `.env`:

```env
DATABASE_URL=postgresql://...
```

3) Run

```bash
npm run dev
```

## Available API
- `GET /api/health`
- `GET /api/companies?page=1&limit=50&search=...`
- `GET /api/companies/:id`
- `GET /api/contacts?page=1&limit=50&search=...`
- `GET /api/contacts/:id`

## Notes
This is a compatibility-first refactor to ensure the server can query the Neon schema correctly.
Many advanced CRM features were removed/disabled because their backing tables do not exist in the Neon schema.
