# Olyntis.ai

AI-native clinical intelligence for behavioral health.

A Supabase-first EHR with FHIR-aligned PostgreSQL tables and RLS-based multi-tenancy.

## Getting Started

Install dependencies:

```bash
npm install
```

Run the dev server:

```bash
npm run dev
```

The app runs at `http://localhost:3000/`

## Seeding Patient Data

To seed 150 behavioral health patients from Synthea FHIR bundles:

```bash
# Ensure SUPABASE_SERVICE_ROLE_KEY is set in .env.local
npm run seed
```

## Architecture

- **Frontend**: React + Mantine + Vite
- **Backend**: Supabase (PostgreSQL + Auth + RLS)
- **Data Model**: FHIR R4-aligned tables with organization-scoped RLS
- **Patient Data**: Synthea-generated synthetic behavioral health population
