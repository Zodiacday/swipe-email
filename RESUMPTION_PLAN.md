# RESUMPTION PLAN: SWIPE-THEM Audit & Debugging Session

## 1. Project Overivew & State (2026-01-02)
Standardized the Gmail backend and stabilized bulk-action state management. The application passes all build checks.

- **Current Blocker**: The `/swipe` page hangs indefinitely on the `SkeletonCard` UI.
- **Repository**: `main` branch.

## 2. Technical Audit: What was Changed

### A. The "Bulk Undo" Architecture (`contexts/EmailContext.tsx`)
- **Implemented**: `trashMultipleSenders(senderEmails: string[])`.
- **Why**: Previously, trashing 10 senders in the Dashboard created 10 separate toast notifications and 10 undo actions. Only the last one could be undone. 
- **How**: Now, a bulk action creates a single `UndoAction` with an array of `emailIds`.
- **Optimistic UI**: The local `emails` state is updated immediately. On error, the whole batch is reverted.
- **Undo Logic**: Restores emails in batches of 20 via the `/api/gmail/emails` (untrash) endpoint to prevent browser socket exhaustion.

### B. Gmail API Pagination Fix (`app/api/gmail/action/route.ts`)
- **Fixed**: The `TRASH_SENDER` action only handled the first 500 emails (one list page).
- **Update**: Implemented a `do...while` loop with `nextPageToken`. It now aggregates **all** message IDs from a sender before trashing.
- **Batching**: Trashing now happens in chunks of 1000 using `batchModify` to stay within Gmail API limits.

### C. Smart Nuisance Scoring (`lib/engines/aggregation.ts`)
- **Logic**: Nuisance scoring ($0-100$) is no longer purely volume-based.
- **Trusted Domains**: If a domain is in `DOMAIN_SAFETY.neverNuke` (e.g., banking, gov), it gets a **0.2x multiplier**.
- **Spam Domains**: If in `safeToNuke` (e.g., marketing lists), it gets a **+20 base score bonus**.

---

## 3. DEBUGGING THE HANG: Technical Breakdown

The user is stuck on the loading skeleton in `/swipe`. 

### Logic Chain in `SwipePage` (`app/swipe/page.tsx`):
1. Page renders `if (status === "loading" || (isLoading && emails.length === 0))` loading UI.
2. `status` is from `useSession()` (NextAuth).
3. `isLoading` and `emails` are from `useEmailContext()`.

### Logic Chain in `EmailProvider` (`contexts/EmailContext.tsx`):
1. `isLoading` defaults to `false`.
2. `useEffect` triggers `fetchEmails()` if:
   - `status === "authenticated"`
   - `emails.length === 0`
   - `!isLoading`
3. `fetchEmails` sets `setIsLoading(true)`, fetches from `/api/gmail/emails`, then `setIsLoading(false)` in `finally`.

### Hypotheses for the Hang:
1. **NextAuth "Stuck"**: `status` remains `"loading"` and never transitions to `"authenticated"` or `"unauthenticated"`. This usually happens if the `SessionProvider` in `layout.tsx` is misconfigured or the middleware/auth secret is mismatching.
2. **API Silent Failure**: `fetchEmails` is called, but the fetch to `/api/gmail/emails` returns a 401/500 that isn't setting `isLoading(false)` or error is caught but not displayed.
3. **Empty Data State**: If the API returns `{ emails: [] }`, `emails.length` stays `0`. If `isLoading` is `false`, the terminal condition in `SwipePage` becomes `if (false || (false && true))` which should pass, **EXCEPT** if the `emails.length === 0` check is still true and the page has no "Empty State" for that specific check. 
   - *Refined*: `SwipePage` has an empty state check at line 375 (`if (cards.length === 0)`). If it's stuck on line 330, it means the condition `(isLoading && emails.length === 0)` is staying TRUE.

---

## 4. IMMEDIATE NEXT STEPS FOR NEXT AI
1. **Console Check**: Add `console.log` inside the `EmailProvider`'s `fetchEmails` and the mount `useEffect` to see if the fetch even starts.
2. **Network Tab**: Inspect the browser Network tab. 
   - Is `/api/gmail/emails` being called?
   - Is it stuck as (pending)?
   - Does it return a 401?
3. **Session Debug**: Log the `session` object in `EmailContext.tsx`. Ensure `session.accessToken` is present.
4. **Empty State Check**: Check what happens if `data.emails` is an empty array. Ensure `setIsLoading(false)` is definitely called.

## 5. Active Code Locations
- **Context**: `contexts/EmailContext.tsx` -> `fetchEmails` function.
- **API**: `app/api/gmail/emails/route.ts` -> `GET` handler.
- **UI**: `app/swipe/page.tsx` -> Line 330 (Loading condition).

---
**Status**: Critical UI Hang. Backend Stable.
**Next Action**: Trace the Auth-to-Fetch handoff in `EmailContext.tsx`.

