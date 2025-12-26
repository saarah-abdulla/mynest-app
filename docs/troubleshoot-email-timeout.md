# Troubleshooting Email Connection Timeout

If you're seeing `ETIMEDOUT` or `ECONNECTION` errors when sending invitation emails, this guide will help you fix it.

## The Problem

```
Error: Connection timeout
code: 'ETIMEDOUT'
command: 'CONN'
```

This means Railway cannot connect to your SMTP server. This is common with Gmail and some other providers that block connections from cloud platforms.

## Solution 1: Use SendGrid (Recommended for Production)

SendGrid works reliably with Railway and has a free tier.

### Step 1: Create SendGrid Account
1. Sign up at [SendGrid](https://sendgrid.com/) (free tier: 100 emails/day)
2. Verify your account

### Step 2: Create API Key
1. Go to **Settings** → **API Keys**
2. Click **Create API Key**
3. Name it "MyNest API Key"
4. Select **Full Access** or **Restricted Access** (with Mail Send permissions)
5. Copy the API key (you'll only see it once!)

### Step 3: Update Railway Variables
Go to **Railway Dashboard** → Your Backend Service → **Variables** and set:

```
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASSWORD=your-sendgrid-api-key-here
SMTP_FROM="MyNest" <noreply@mynest.app>
```

Replace `your-sendgrid-api-key-here` with the API key you copied.

### Step 4: Redeploy
Railway will automatically redeploy. Check logs to verify emails are sending.

## Solution 2: Use Mailgun (Alternative)

Mailgun also works well with Railway.

### Setup:
1. Sign up at [Mailgun](https://www.mailgun.com/) (free tier: 5,000 emails/month)
2. Verify your domain or use their sandbox domain
3. Get SMTP credentials from **Sending** → **Domain Settings** → **SMTP credentials**

### Railway Variables:
```
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-mailgun-smtp-username
SMTP_PASSWORD=your-mailgun-smtp-password
SMTP_FROM="MyNest" <noreply@yourdomain.com>
```

## Solution 3: Use AWS SES (For Production)

AWS SES is reliable and cost-effective for production.

### Setup:
1. Sign up for AWS account
2. Go to **AWS SES** → **SMTP Settings**
3. Create SMTP credentials
4. Verify your email address or domain

### Railway Variables:
```
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-aws-ses-smtp-username
SMTP_PASSWORD=your-aws-ses-smtp-password
SMTP_FROM="MyNest" <noreply@yourdomain.com>
```

**Note:** Replace `us-east-1` with your AWS region.

## Solution 4: Fix Gmail (If You Must Use It)

Gmail often blocks connections from cloud platforms. If you must use Gmail:

### Option A: Use Gmail with OAuth2 (Complex)
Requires setting up OAuth2 credentials. Not recommended for production.

### Option B: Use Gmail App Password (May Still Timeout)
1. Enable 2-Step Verification
2. Generate App Password
3. Use these settings:

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-16-char-app-password
SMTP_FROM="MyNest" <your-email@gmail.com>
```

**Warning:** Gmail may still timeout from Railway. If it does, use SendGrid or Mailgun instead.

## Quick Checklist

- [ ] SMTP_HOST is correct (no typos)
- [ ] SMTP_PORT is correct (587 for TLS, 465 for SSL)
- [ ] SMTP_USER and SMTP_PASSWORD are set
- [ ] Using a cloud-friendly provider (SendGrid, Mailgun, AWS SES)
- [ ] Railway has redeployed after setting variables
- [ ] Check Railway logs for detailed error messages

## Testing

After updating SMTP settings:

1. **Redeploy Railway** (automatic after saving variables)
2. **Check Railway Logs** for:
   - `✅ Invitation email sent successfully` (success)
   - `❌ Error sending invitation email` (failure)
3. **Try inviting a caregiver** from the Family page
4. **Check the email** (and spam folder)

## Still Having Issues?

1. **Check Railway Logs** - Look for detailed error messages
2. **Verify SMTP Credentials** - Test them with a different email client
3. **Try a Different Provider** - SendGrid is the most reliable for Railway
4. **Check Network** - Some corporate networks block SMTP ports

## Recommended Setup for Production

**Best Option:** SendGrid
- Free tier: 100 emails/day
- Reliable with Railway
- Easy setup
- Good deliverability

**Alternative:** Mailgun
- Free tier: 5,000 emails/month
- Also reliable
- Good for higher volume

**For Scale:** AWS SES
- Very cheap ($0.10 per 1,000 emails)
- Highly reliable
- Requires AWS account setup

