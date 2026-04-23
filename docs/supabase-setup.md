# Supabase Setup Guide

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in:
   - **Project Name**: `tasks-app`
   - **Database Password**: Save this! (you'll need it)
   - **Region**: Choose closest to your users (e.g., `us-east-1`)
5. Wait for project to initialize (~2 minutes)
6. Once ready, go to **Settings → API** and save:
   - `Project URL` (e.g., `https://xxxxx.supabase.co`)
   - `Anon Key` (public, safe to share)
   - `Service Role Key` (secret, keep private)

## Step 2: Create Database Schema

1. In Supabase, go to **SQL Editor**
2. Click **New Query**
3. Copy the entire SQL from `sql/migrations.sql` (see section below)
4. Paste into the editor
5. Click **Run**
6. Verify all tables created successfully

## Step 3: Enable Row-Level Security (RLS)

1. Go to **Authentication → Policies**
2. For each table, enable RLS:
   - Click table name
   - Toggle **Enable RLS**
3. Policies are created by the migration script, but verify they exist

## Step 4: Set Up Google OAuth

Follow the detailed guide in **GOOGLE_OAUTH_SETUP.md**

## Step 5: Create Environment File

1. In `frontend/`, copy `env.example` to `.env.local`
2. Set the local React port to `3001` by creating `frontend/.env.development` with:
   ```
   PORT=3001
   ```
3. Fill in:
   ```
   REACT_APP_SUPABASE_URL=https://xxxxx.supabase.co
   REACT_APP_SUPABASE_ANON_KEY=eyJhbGc...
   ```
4. Save (do NOT commit `.env.local` to git)

## Verification Checklist

- [ ] Supabase project created
- [ ] SQL migrations executed (5 tables visible in SQL Editor)
- [ ] RLS enabled on all tables
- [ ] Google OAuth credentials added to Supabase
- [ ] `.env.local` populated with Supabase URL and Key
- [ ] Can connect from React app (test in Phase 2)

---

## SQL Migrations

See `sql/migrations.sql` for complete schema with RLS policies.
