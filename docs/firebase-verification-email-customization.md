# Customizing Firebase Verification Email Sender

## Current Situation

Firebase Authentication sends verification emails from Firebase's default sender address (like `noreply@firebaseapp.com` or `firebase-noreply@...`). You **cannot change the sender address** for Firebase's built-in verification emails - Firebase controls this.

## What You CAN Customize

While you can't change the **sender address**, you CAN customize:

1. **Email content/branding** - Templates in Firebase Console
2. **Action URL** - Where the verification link points
3. **Email subject** - Can be customized in templates

## Option 1: Customize Email Templates (Recommended)

This changes the email content and branding, but it still comes from Firebase's sender address.

### Steps:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **mynest-ae**
3. Go to **Authentication** → **Templates**
4. Click on **Email address verification** template
5. Customize:
   - **Email subject**: e.g., "Verify your MyNest account"
   - **Email content**: HTML template with your branding
   - **Action URL**: Should point to your frontend verification handler

### Action URL Format

The action URL should be your frontend URL with the verification handler:
```
https://mynest.ae/verify-email?mode=action&oobCode=%LINK%
```

Or if using Vercel:
```
https://mynest-app.vercel.app/verify-email?mode=action&oobCode=%LINK%
```

**Note:** Firebase will replace `%LINK%` with the actual verification code.

### Example Custom Template

```html
<h1>Welcome to MyNest!</h1>
<p>Please verify your email address by clicking the link below:</p>
<a href="%LINK%">Verify Email Address</a>
<p>If you didn't request this, you can safely ignore this email.</p>
<p>&copy; MyNest</p>
```

## Option 2: Send Custom Verification Emails (Advanced)

If you **absolutely need** verification emails to come from your custom domain (e.g., `noreply@mynest.ae`), you would need to:

1. **Disable Firebase's built-in verification emails**
2. **Create a Cloud Function** that sends custom verification emails via SendGrid/your SMTP
3. **Generate your own verification tokens** and handle verification logic

**⚠️ This is much more complex and requires:**
- Firebase Cloud Functions setup
- Custom token generation/storage
- Custom verification endpoint
- More code to maintain

**Recommendation:** For most use cases, customizing the Firebase email templates (Option 1) is sufficient, even if the sender address is still Firebase's.

## Option 3: Use Email Domain Branding (Limited)

Firebase doesn't support custom sender addresses, but you can:
- Use a custom domain in the **action URL**
- Brand the email content heavily
- Add your logo and styling

The email will still come from Firebase, but the content and links will be branded to your app.

## Current Implementation

In your code, verification emails are sent via:

```typescript
// frontend/src/contexts/AuthContext.tsx
await sendEmailVerification(userCredential.user)
```

This uses Firebase's built-in email service, which you can customize via the Console but cannot change the sender address.

## Recommendation

1. **Customize the email templates** in Firebase Console to match your branding
2. **Set the action URL** to your frontend verification page
3. **Accept that the sender will be Firebase** - this is standard for Firebase Authentication

The important thing is that:
- ✅ Users can verify their email
- ✅ The email is branded with your app
- ✅ The verification link works correctly
- ⚠️ The sender address is Firebase's (this is normal and acceptable)

## Next Steps

1. Go to Firebase Console → Authentication → Templates
2. Customize the "Email address verification" template
3. Set the action URL to your frontend URL
4. Add your branding (logo, colors, text)

The email will still come from Firebase's sender, but it will look like it's from your app.

