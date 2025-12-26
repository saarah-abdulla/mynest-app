# Firebase Email Templates Configuration

## Email Verification Template

### Settings in Firebase Console

Go to: **Firebase Console → Authentication → Templates → Email address verification**

#### **Sender name:**
```
MyNest
```

#### **From (email address):**
```
noreply@mynest-ae.firebaseapp.com
```
*Note: This is Firebase's default. You can't change this unless you set up a custom domain.*

#### **Reply to:**
```
support@mynest.ae
```
*Or leave empty if you don't want replies*

#### **Subject:**
```
Verify your MyNest account
```
*Or:*
```
Please verify your email address
```

#### **Message (HTML):**
You can customize this, but here's a suggested template:

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      line-height: 1.6;
      color: #795548;
      background-color: #F3F1E7;
      margin: 0;
      padding: 20px;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #FDFDFD;
      border-radius: 16px;
      padding: 40px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
    }
    .logo {
      font-size: 24px;
      font-weight: bold;
      color: #795548;
      margin-bottom: 10px;
    }
    h1 {
      color: #795548;
      font-size: 24px;
      margin-bottom: 20px;
    }
    .content {
      color: #795548;
      font-size: 16px;
      margin-bottom: 30px;
    }
    .button {
      display: inline-block;
      padding: 14px 28px;
      background-color: #B4BFAB;
      color: white;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      margin: 20px 0;
    }
    .footer {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e0e0e0;
      font-size: 14px;
      color: #795548;
      opacity: 0.7;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">MyNest</div>
    </div>
    <h1>Verify your email address</h1>
    <div class="content">
      <p>Hi there,</p>
      <p>Thanks for signing up for MyNest! Please verify your email address by clicking the button below:</p>
      <div style="text-align: center;">
        <a href="%LINK%" class="button">Verify Email</a>
      </div>
      <p style="font-size: 14px; color: #795548; opacity: 0.7;">
        Or copy and paste this link into your browser:<br>
        %LINK%
      </p>
      <p style="font-size: 14px; color: #795548; opacity: 0.7; margin-top: 20px;">
        This link will expire in 3 days.
      </p>
    </div>
    <div class="footer">
      <p>If you didn't create a MyNest account, you can safely ignore this email.</p>
      <p>&copy; 2024 MyNest. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
```

#### **Action URL:**
```
https://your-vercel-app.vercel.app/verify-email?mode=verifyEmail&oobCode=%LINK%
```
*Or if you want to handle it in your app:*
```
https://your-vercel-app.vercel.app/verify-email?oobCode=%LINK%
```

**Important:** Use `%LINK%` as a placeholder - Firebase will replace it with the actual verification link.

---

## Password Reset Template

### Settings in Firebase Console

Go to: **Firebase Console → Authentication → Templates → Password reset**

#### **Sender name:**
```
MyNest
```

#### **From (email address):**
```
noreply@mynest-ae.firebaseapp.com
```
*Firebase default - can't change without custom domain*

#### **Reply to:**
```
support@mynest.ae
```
*Or leave empty*

#### **Subject:**
```
Reset your MyNest password
```
*Or:*
```
Password reset request
```

#### **Message (HTML):**
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      line-height: 1.6;
      color: #795548;
      background-color: #F3F1E7;
      margin: 0;
      padding: 20px;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #FDFDFD;
      border-radius: 16px;
      padding: 40px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
    }
    .logo {
      font-size: 24px;
      font-weight: bold;
      color: #795548;
      margin-bottom: 10px;
    }
    h1 {
      color: #795548;
      font-size: 24px;
      margin-bottom: 20px;
    }
    .content {
      color: #795548;
      font-size: 16px;
      margin-bottom: 30px;
    }
    .button {
      display: inline-block;
      padding: 14px 28px;
      background-color: #B4BFAB;
      color: white;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      margin: 20px 0;
    }
    .footer {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e0e0e0;
      font-size: 14px;
      color: #795548;
      opacity: 0.7;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">MyNest</div>
    </div>
    <h1>Reset your password</h1>
    <div class="content">
      <p>Hi there,</p>
      <p>We received a request to reset your password for your MyNest account. Click the button below to reset it:</p>
      <div style="text-align: center;">
        <a href="%LINK%" class="button">Reset Password</a>
      </div>
      <p style="font-size: 14px; color: #795548; opacity: 0.7;">
        Or copy and paste this link into your browser:<br>
        %LINK%
      </p>
      <p style="font-size: 14px; color: #795548; opacity: 0.7; margin-top: 20px;">
        This link will expire in 1 hour.
      </p>
      <p style="font-size: 14px; color: #795548; opacity: 0.7; margin-top: 20px;">
        If you didn't request a password reset, you can safely ignore this email.
      </p>
    </div>
    <div class="footer">
      <p>&copy; 2024 MyNest. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
```

#### **Action URL:**
```
https://your-vercel-app.vercel.app/reset-password?mode=resetPassword&oobCode=%LINK%
```
*Or:*
```
https://your-vercel-app.vercel.app/reset-password?oobCode=%LINK%
```

---

## Quick Reference

### Email Verification Template

| Field | Value |
|-------|-------|
| **Sender name** | `MyNest` |
| **From** | `noreply@mynest-ae.firebaseapp.com` (Firebase default) |
| **Reply to** | `support@mynest.ae` (optional) |
| **Subject** | `Verify your MyNest account` |
| **Action URL** | `https://your-vercel-app.vercel.app/verify-email?oobCode=%LINK%` |

### Password Reset Template

| Field | Value |
|-------|-------|
| **Sender name** | `MyNest` |
| **From** | `noreply@mynest-ae.firebaseapp.com` (Firebase default) |
| **Reply to** | `support@mynest.ae` (optional) |
| **Subject** | `Reset your MyNest password` |
| **Action URL** | `https://your-vercel-app.vercel.app/reset-password?oobCode=%LINK%` |

## Important Notes

1. **%LINK% Placeholder**: Firebase automatically replaces `%LINK%` with the actual verification/reset link. Don't change this.

2. **From Email**: You can't change the "From" email address unless you set up a custom domain in Firebase. The default `noreply@mynest-ae.firebaseapp.com` is fine.

3. **Action URL**: Replace `your-vercel-app.vercel.app` with your actual Vercel URL.

4. **Custom Domain**: If you want to use `noreply@mynest.ae`, you need to:
   - Set up a custom domain in Firebase
   - Verify domain ownership
   - Configure DNS records

5. **Testing**: After setting up, test by:
   - Requesting password reset
   - Or enabling email verification in your code

## Current Status

**Note:** Email verification is not currently enabled in the app code. Even if you configure the template, emails won't be sent until you add the code to trigger them (see `docs/email-verification-setup.md`).

