# Fix SendGrid Email Connection Timeout

## The Problem

You're seeing:
```
From: "MyNest" <apikey>
Error: Connection timeout (ETIMEDOUT)
```

This means:
1. **SMTP_FROM is not set correctly** - it's using `apikey` instead of a verified email
2. **SendGrid connection is timing out** - could be account verification or network issue

## Solution: Complete SendGrid Setup

### Step 1: Verify Your SendGrid Account

1. Go to [SendGrid Dashboard](https://app.sendgrid.com/)
2. Complete account verification if prompted
3. Check your account status - it should be "Active"

### Step 2: Verify a Sender Email

**Important:** SendGrid requires you to verify at least one sender email before you can send emails.

1. Go to **Settings** → **Sender Authentication**
2. Click **Verify a Single Sender**
3. Fill in the form:
   - **From Email Address**: Use your email (e.g., `yourname@gmail.com`)
   - **From Name**: `MyNest`
   - **Reply To**: Same as from email
   - **Company Address**: Your address
4. Click **Create**
5. **Check your email** for the verification link
6. Click the verification link in the email
7. Wait for status to show "Verified" (green checkmark)

### Step 3: Create API Key

1. Go to **Settings** → **API Keys**
2. Click **Create API Key**
3. Name it "MyNest API Key"
4. Select **Full Access** (or **Restricted Access** with Mail Send permissions)
5. **Copy the API key immediately** (you won't see it again!)

### Step 4: Update Railway Variables

Go to **Railway Dashboard** → Your Backend Service → **Variables** and set:

```
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASSWORD=SG.your-actual-api-key-here
SMTP_FROM="MyNest" <your-verified-email@gmail.com>
FRONTEND_URL=https://mynest-app.vercel.app
```

**Important:**
- `SMTP_USER` must be exactly `apikey` (the literal word)
- `SMTP_PASSWORD` is your SendGrid API key (starts with `SG.`)
- `SMTP_FROM` must use the **verified email** from Step 2
- Replace `your-verified-email@gmail.com` with the email you verified

### Step 5: Test the Connection

1. **Redeploy Railway** (automatic after saving variables)
2. **Check Railway Logs** - you should see:
   ```
   ✅ Invitation email sent successfully to...
   ```
3. **Try creating a caregiver** with an email address
4. **Check the email inbox** (and spam folder)

## Alternative: Use Mailgun (If SendGrid Still Fails)

If SendGrid continues to timeout, try Mailgun:

### Mailgun Setup:

1. **Sign up** at [Mailgun](https://www.mailgun.com/)
2. **Verify your account**
3. Go to **Sending** → **Domain Settings**
4. Use the **sandbox domain** (for testing) or verify your own domain
5. Go to **SMTP credentials** section
6. Copy your SMTP username and password

### Railway Variables for Mailgun:

```
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-mailgun-smtp-username
SMTP_PASSWORD=your-mailgun-smtp-password
SMTP_FROM="MyNest" <postmaster@your-sandbox-domain.mailgun.org>
FRONTEND_URL=https://mynest-app.vercel.app
```

**Note:** For Mailgun sandbox, you can only send to verified recipient emails initially.

## Troubleshooting

### Still Getting Timeout?

1. **Check SendGrid Status**: Go to [status.sendgrid.com](https://status.sendgrid.com/)
2. **Verify API Key**: Make sure it's correct and has Mail Send permissions
3. **Check Sender Verification**: The email in `SMTP_FROM` must be verified
4. **Try Port 2525**: Some networks block 587, try:
   ```
   SMTP_PORT=2525
   ```
5. **Check Railway Network**: Railway might have network restrictions

### "From" Address Still Wrong?

Make sure `SMTP_FROM` is set in Railway with the format:
```
"MyNest" <your-verified-email@gmail.com>
```

Not:
```
"MyNest" <apikey>
```

### Connection Works But Email Not Received?

1. **Check spam folder**
2. **Verify sender email** in SendGrid dashboard
3. **Check SendGrid Activity**: Go to **Activity** in SendGrid to see email status
4. **Check for bounces**: SendGrid will show if emails bounced

## Quick Checklist

- [ ] SendGrid account is verified
- [ ] At least one sender email is verified in SendGrid
- [ ] API key created with Mail Send permissions
- [ ] `SMTP_USER=apikey` (exact word)
- [ ] `SMTP_PASSWORD` is your SendGrid API key
- [ ] `SMTP_FROM` uses verified email address
- [ ] Railway variables saved and service redeployed
- [ ] Checked Railway logs for success/error messages

## Still Not Working?

If SendGrid continues to timeout, the issue might be:
- Railway's network blocking SendGrid
- SendGrid blocking Railway's IP range
- Account verification incomplete

**Try Mailgun instead** - it's often more reliable with cloud platforms.

