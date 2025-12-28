# Email Verification Setup

## Current Email Behavior

**What emails ARE sent:**
- ✅ **Caregiver Invitation Emails** - When a parent invites a caregiver

**What emails are NOT sent:**
- ❌ Welcome emails on signup
- ❌ Email verification (unless enabled in Firebase)
- ❌ Password reset emails (unless enabled in Firebase)

## Firebase Email Verification

Firebase sends email verification emails automatically when `sendEmailVerification()` is called (which happens during signup).

**Note:** Verification emails come from Firebase's sender address (e.g., `noreply@firebaseapp.com`) - this cannot be changed, but you can customize the email content and branding.

### Customize Email Templates in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/project/mynest-ae/authentication/emails)
2. Click on **Templates** tab
3. Select **Email address verification** template
4. Customize:
   - **Email subject**: e.g., "Verify your MyNest account"
   - **Email content**: HTML template with your branding
   - **Action URL**: Should point to your frontend (e.g., `https://mynest.ae/verify-email?mode=action&oobCode=%LINK%`)

**Important:** The sender address will still be Firebase's - you can customize the content and branding, but not the sender address.

See `docs/firebase-verification-email-customization.md` for more details.

### Add Email Verification to Signup (Optional)

If you want to add email verification, you would need to:

1. **Send verification email after signup:**
```typescript
// In AuthContext.tsx or SignupPage.tsx
import { sendEmailVerification } from 'firebase/auth'

// After signup
await signup(email, password)
if (auth.currentUser) {
  await sendEmailVerification(auth.currentUser)
  // Show message: "Please check your email to verify your account"
}
```

2. **Check verification status:**
```typescript
// Check if email is verified
if (auth.currentUser && !auth.currentUser.emailVerified) {
  // Show message or redirect to verification page
}
```

## Current Signup Flow

1. User signs up with email/password
2. Firebase creates account
3. Backend creates user record in database
4. User is redirected to dashboard (or family setup)
5. **No email is sent**

## Why No Email?

- Simpler user experience (no waiting for email)
- Faster onboarding
- Email verification can be added later if needed

## If You Want Email Verification

You can add it, but it requires:
1. Enabling in Firebase Console
2. Adding code to send verification email
3. Handling unverified users (blocking access or showing warning)

## Recommendation

For early testing, **no email verification is fine**. You can add it later if needed.

If you want to test email functionality, try:
- Inviting a caregiver (this will send an email if SMTP is configured)


