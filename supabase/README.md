# Supabase Setup Guide

## Prerequisites

1. Install the [Supabase CLI](https://supabase.com/docs/guides/cli).
2. Copy `.env.example` to `.env.local` and fill in your project credentials.

## Running Locally (Supabase CLI)

```bash
# Start the local Supabase stack (first time, pulls Docker images)
supabase start

# Apply all migrations to the local database
supabase db reset       # drops + recreates + runs all migrations + seed.sql

# Or apply only new migrations without resetting data:
supabase migration up

# Generate TypeScript types from the live schema (run after schema changes)
supabase gen types typescript --local > types/database.ts
```

## Environment Variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL (safe for client) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon/public key (safe for client) |
| `SUPABASE_SERVICE_ROLE_KEY` | **Server-only** service role key — never expose to browser |

## Migration Files

| File | Description |
|---|---|
| `20261013000000_initial_schema.sql` | Tables, basic RLS policies, auth trigger |
| `20261013000100_fixes.sql` | notes column, start_at/end_at, wallet_balance, indexes, triggers, hardened RLS |

## Seed Data

`supabase/seed.sql` is automatically run by `supabase db reset`. It inserts 5 sample jobs with **relative** `NOW() + interval` dates so data is never stale.

## Useful Commands

```bash
# Check current migration status
supabase migration list

# Open local Supabase Studio
supabase studio

# Link to a hosted project
supabase link --project-ref <your-project-ref>

# Push migrations to hosted project
supabase db push
```
