# Authentication

## Provider

Google OAuth via Supabase

## Flow

1. User clicks "Sign in with Google"
2. Redirect to Google
3. Supabase handles callback
4. User session is created

## User Object

* id (UUID)
* email
* user_metadata:

  * full_name
  * avatar_url

## Profiles Table

A profile row is created for each user.

Used for:

* display name
* avatar
* app-specific data

## Rules

* Always use user.id as primary identifier
* Never rely on email for logic
