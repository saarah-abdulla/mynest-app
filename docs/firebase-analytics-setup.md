# Firebase Analytics Setup

## Overview

Firebase Analytics has been enabled in the frontend application. This document describes where analytics is initialized and how events are tracked.

## Environment Variable

To enable Firebase Analytics, add the following environment variable:

```env
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

You can find your Measurement ID in the Firebase Console:
1. Go to Firebase Console → Project Settings
2. Under "Your apps", select your web app
3. Find the "Measurement ID" (starts with `G-`)

**Note:** Analytics will gracefully degrade if this variable is not set - the app will continue to work normally, but analytics events won't be tracked.

## Initialization

### Location: `frontend/src/lib/firebase.ts`

Firebase Analytics is initialized in the same file as Firebase Auth:

- **Browser-only**: Analytics is only initialized when `typeof window !== 'undefined'` to avoid SSR issues
- **Support check**: Uses `isSupported()` to check if Analytics is available in the environment
- **Graceful degradation**: If initialization fails or Measurement ID is missing, the app continues to work normally

```typescript
// Analytics is exported for use in analytics helper
export { analytics }
```

## Analytics Helper

### Location: `frontend/src/lib/analytics.ts`

A safe `trackEvent()` helper function is provided that:
- Only runs in browser environment
- Gracefully handles cases where Analytics is unavailable
- Never breaks the app if Analytics fails

```typescript
trackEvent(eventName: string, params?: Record<string, any>): void
```

**Important:** Never log personal data (email, name, phone, child data) in analytics events.

## Page View Tracking

### Location: `frontend/src/components/PageViewTracker.tsx`

Page views are automatically tracked when routes change using React Router's `useLocation` hook.

- Integrated in `App.tsx` - tracks all route changes
- Logs `page_view` event with `page_path` and `page_location`
- Query parameters are removed from `page_location` for privacy

## Event Tracking

The following events are tracked throughout the application:

### Authentication Events

1. **`sign_up`**
   - Location: `frontend/src/contexts/AuthContext.tsx` → `signup()` function
   - Parameters: `{ method: 'email' }`
   - Triggered when a user signs up with email

2. **`login`**
   - Location: `frontend/src/contexts/AuthContext.tsx` → `login()` and `loginWithGoogle()` functions
   - Parameters: `{ method: 'email' }` or `{ method: 'google' }`
   - Triggered when a user logs in

### Family & Children Events

3. **`create_family`**
   - Location: `frontend/src/pages/SetupReviewPage.tsx` → `handleComplete()` function
   - Triggered when a user creates a family during setup

4. **`add_child`**
   - Location: `frontend/src/components/ChildFormModal.tsx` → `handleSubmit()` function
   - Triggered when a new child is added (not on updates)
   - Only tracks creation, not edits

### Invitation Events

5. **`invite_sent`**
   - Location: `frontend/src/pages/FamilyPage.tsx` → `handleResendInvitation()` function
   - Triggered when an invitation email is sent to a caregiver

6. **`invite_accepted`**
   - Locations:
     - `frontend/src/pages/InvitationPage.tsx` → `handleAccept()` function
     - `frontend/src/pages/SignupPage.tsx` → after `acceptInvitation()` success
     - `frontend/src/pages/LoginPage.tsx` → after `acceptInvitation()` success
   - Triggered when a caregiver accepts an invitation

### Dashboard Events

7. **`view_dashboard`**
   - Location: `frontend/src/pages/DashboardPage.tsx` → `useEffect` on mount
   - Triggered when the dashboard page is viewed
   - Runs once per page mount

8. **`page_view`**
   - Location: `frontend/src/components/PageViewTracker.tsx`
   - Parameters: `{ page_path: string, page_location: string }`
   - Automatically tracked for all route changes

## Privacy Considerations

All analytics tracking respects user privacy:

- **No Personal Data**: Email addresses, names, phone numbers, child data, or any PII are never logged
- **No Sensitive Data**: Query parameters are removed from page locations
- **Optional**: Analytics gracefully degrades if unavailable
- **Client-Side Only**: Analytics code never runs on the server

## Files Changed

1. `frontend/src/lib/firebase.ts` - Added Analytics initialization
2. `frontend/src/lib/analytics.ts` - Created analytics helper (NEW FILE)
3. `frontend/src/components/PageViewTracker.tsx` - Created page view tracker (NEW FILE)
4. `frontend/src/App.tsx` - Added PageViewTracker component
5. `frontend/src/contexts/AuthContext.tsx` - Added signup/login event tracking
6. `frontend/src/pages/SetupReviewPage.tsx` - Added create_family event tracking
7. `frontend/src/components/ChildFormModal.tsx` - Added add_child event tracking
8. `frontend/src/pages/FamilyPage.tsx` - Added invite_sent event tracking
9. `frontend/src/pages/InvitationPage.tsx` - Added invite_accepted event tracking
10. `frontend/src/pages/SignupPage.tsx` - Added invite_accepted event tracking
11. `frontend/src/pages/LoginPage.tsx` - Added invite_accepted event tracking
12. `frontend/src/pages/DashboardPage.tsx` - Added view_dashboard event tracking

## Testing

To verify Analytics is working:

1. Set `VITE_FIREBASE_MEASUREMENT_ID` in your `.env` file
2. Run the app in development or production
3. Check browser console for "✅ Firebase Analytics initialized successfully"
4. Perform actions (signup, login, create family, etc.)
5. Check Firebase Console → Analytics → Events to see tracked events

If Measurement ID is not set, you'll see: "ℹ️ VITE_FIREBASE_MEASUREMENT_ID is not set - Analytics will not be initialized"

