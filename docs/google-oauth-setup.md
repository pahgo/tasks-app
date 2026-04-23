# Google OAuth Setup (Google Cloud Console + Supabase)

## Overview

We'll create OAuth 2.0 credentials in Google Cloud Console, then configure them in Supabase. This enables "Sign in with Google" for your app.

---

## Part A: Google Cloud Console Setup

### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Click the **project dropdown** (top-left, currently says "Select a project")
3. Click **NEW PROJECT**
4. Fill in:
   - **Project name**: `tasks-app-oauth` (or your preference)
   - **Organization**: Leave blank (or select if you have one)
5. Click **CREATE**
6. Wait for project to initialize (~1 minute)
7. Select the new project from the dropdown

### Step 2: Enable OAuth Consent Screen

1. In Google Cloud, go to **APIs & Services → OAuth consent screen** (left sidebar)
2. Select **User Type**: `External` (allows any Google account to sign in)
3. Click **CREATE**
4. Fill in the OAuth Consent Screen form:
   - **App name**: `Tasks App` (what users see)
   - **User support email**: Your email (e.g., `you@gmail.com`)
   - **Authorized domains**: Add your deployment domains later (for now, skip)
   - **Developer contact**: Your email
5. Scroll down, click **SAVE AND CONTINUE**

### Step 3: Add Scopes (Permissions)

1. You're now on the **Scopes** page
2. Click **ADD OR REMOVE SCOPES**
3. Search for and select these scopes:
   - `userinfo.email` (access email)
   - `userinfo.profile` (access name, picture)
4. Click **UPDATE**
5. Click **SAVE AND CONTINUE** again

### Step 4: Add Test Users (Optional, for External apps)

1. You're on the **Test users** page
2. Click **ADD USERS**
3. Add your email (or anyone you want to test with)
4. This is optional during development

### Step 5: Create OAuth 2.0 Credentials

1. Go to **APIs & Services → Credentials** (left sidebar)
2. Click **+ CREATE CREDENTIALS**
3. Select **OAuth client ID**
4. If prompted to create an OAuth consent screen first, you're done with that—continue
5. Choose **Application type**: `Web application`
6. Fill in:
   - **Name**: `tasks-app-web`
   - **Authorized JavaScript origins**: Add these:
     - `http://localhost:3001` (local development)
     - `https://<your-vercel-url>.vercel.app` (production, add later)
   - **Authorized redirect URIs**: Add these:
     - `https://xxxxx.supabase.co/auth/v1/callback` (replace xxxxx with your Supabase project ref)
     - `http://localhost:3001/` (local development)
7. Click **CREATE**

### Step 6: Save Credentials

A modal appears with your credentials. **IMPORTANT**: Copy and save:
- **Client ID** (public, safe to share)
- **Client Secret** (KEEP SECRET, do NOT commit to git)

Save these securely—you'll paste them into Supabase next.

---

## Part B: Supabase Configuration

### Step 1: Go to Supabase Authentication Settings

1. In your Supabase project, go to **Authentication → Providers** (left sidebar)
2. Click **Google**

### Step 2: Add Google Credentials

1. Paste the **Client ID** from Google Cloud
2. Paste the **Client Secret** from Google Cloud
3. Click **Save**

### Step 3: Test (Optional)

1. Go to **Authentication → URL Configuration**
2. Verify your **Site URL** is set:
   - Dev: `http://localhost:3001`
   - Prod: `https://<your-vercel-url>.vercel.app`
3. This is where Supabase redirects after Google login

---

## Part C: Environment Setup

### Step 1: Create `.env.local` in `frontend/`

1. In your project, go to `frontend/`
2. Copy the `env.example` file to `.env.local`
   ```
   cp env.example .env.local
   ```

### Step 2: Fill in Supabase Credentials

1. Go to your Supabase project → **Settings → API**
2. Copy these values:
   - **Project URL** → `REACT_APP_SUPABASE_URL`
   - **Anon Key** (public) → `REACT_APP_SUPABASE_ANON_KEY`
3. Paste into `.env.local`:
   ```
   REACT_APP_SUPABASE_URL=https://xxxxx.supabase.co
   REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

### Step 3: Save (DO NOT COMMIT)

1. **Important**: Add `.env.local` to `.gitignore` to prevent accidentally committing secrets
2. This file is already ignored in a standard React setup, but double-check:
   ```
   # In frontend/.gitignore
   .env.local
   .env.*.local
   ```

---

## Verification Checklist

- [ ] Google Cloud project created
- [ ] OAuth Consent Screen configured with scopes (email, profile)
- [ ] OAuth 2.0 Web credentials created
- [ ] Client ID and Secret saved
- [ ] Google credentials added to Supabase
- [ ] `.env.local` created with Supabase URL and Anon Key
- [ ] `.gitignore` includes `.env.local`
- [ ] Can run `npm start` without environment errors (test in Phase 2)

---

## Production Deployment

When you deploy to Vercel:

1. **Add authorized redirect URI in Google Cloud Console**:
   - Go back to Google Cloud → **Credentials → OAuth 2.0 Client IDs → tasks-app-web**
   - Add to **Authorized redirect URIs**:
     - `https://<your-vercel-url>.vercel.app/`
2. **Add environment variables in Vercel**:
   - In Vercel dashboard, go to your project → **Settings → Environment Variables**
   - Add `REACT_APP_SUPABASE_URL` and `REACT_APP_SUPABASE_ANON_KEY` (production values)
3. **Update Supabase Site URL**:
   - In Supabase → **Authentication → URL Configuration**
   - Add your Vercel production URL to **Site URL**

---

## Troubleshooting

**"Redirect URI mismatch"** error during login?
- Make sure the redirect URI in Google Cloud exactly matches what Supabase is sending
- Check Supabase Console Logs for the actual redirect URL being used

**"Invalid client"** error?
- Verify Client ID and Secret are correctly pasted into Supabase
- Check that the credentials haven't expired (Google regenerates periodically for security)

**Getting 403 errors from Supabase?**
- Make sure you're using the **Anon Key** (public), not the Service Role Key
- Verify CORS isn't blocking the request (Supabase handles this automatically)

---

## Next Steps

Once this is verified, move to **Phase 2: Frontend Auth + Offline Foundation**.
