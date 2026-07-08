# Security

## Secret Handling
- `OPENAI_API_KEY` and `SUPABASE_SERVICE_ROLE_KEY` stored in Vercel environment variables only
- Never referenced in client-side code or exposed in API responses
- All Vision API calls made from a Next.js server-side API route (`/api/extract-steps`)

## Permission Model (v1 — demo phase)
- Supabase RLS: permissive read + write for all tables (anonymous access)
- Supabase Storage bucket `map-photos`: public read, authenticated upload (service role used server-side)
- No user accounts yet — all data is shared and visible

## Permission Model (lock-down sprint)
- Supabase Auth enabled; `user_id` populated on every insert
- RLS policies replaced: `select/update/delete` where `auth.uid() = user_id`
- Storage bucket made private; signed URLs generated server-side for photo display

## Approved Tools Rule
- Only the four named tools in AGENTIC_LAYER.md may call external APIs
- No `eval`, no dynamic code execution, no raw `fetch` to arbitrary URLs from agent context

## Audit Principle
- Every export is logged to `export_logs` with format, map reference, and timestamp
- Every AI extraction is logged (success/fail) in application logs on Vercel
- If a security concern arises around data exposure before the lock-down sprint is complete: **stop, do not ship to real clients, get a human to review**
