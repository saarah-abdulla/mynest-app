# Email Setup Guide

## Types of Emails in MyNest

There are two types of emails:

1. **Email Verification** (Firebase) - Sent during signup
2. **Caregiver Invitations** (Backend SMTP) - Sent when inviting caregivers

## 1. Email Verification (Firebase)

This is handled automatically by Firebase. If you're not receiving verification emails:

### Check Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/project/mynest-ae/authentication/emails)
2. Check **Email Templates** section
3. Verify **Email address verification** template is enabled
4. Check **Action URL** is set correctly (should be your frontend URL)

### Common Issues

- **Email in spam folder** - Check spam/junk folder
- **Email not verified in Firebase** - Check Firebase Console → Authentication → Users
- **Action URL incorrect** - Should be `https://mynest-app.vercel.app/verify-email` or your custom domain

### Firebase Email Settings

The verification email is sent by Firebase, not your backend. Make sure:
- Firebase project is configured correctly
- Email templates are set up
- Action URL points to your frontend

## 2. Caregiver Invitation Emails (Backend SMTP)

These are sent by your backend using Nodemailer. You need to configure SMTP settings.

### Required Environment Variables in Railway

Go to **Railway Dashboard** → Your Backend Service → **Variables** and add:

#### Option A: Gmail (Easiest for Testing)

1. **SMTP_HOST**: `smtp.gmail.com`
2. **SMTP_PORT**: `587`
3. **SMTP_SECURE**: `false`
4. **SMTP_USER**: Your Gmail address (e.g., `yourname@gmail.com`)
5. **SMTP_PASSWORD**: Gmail App Password (see below)
6. **SMTP_FROM**: `"MyNest" <yourname@gmail.com>` (optional)

**Getting Gmail App Password:**
1. Go to [Google Account](https://myaccount.google.com/)
2. Security → 2-Step Verification (must be enabled)
3. App passwords → Generate new app password
4. Copy the 16-character password
5. Use this as `SMTP_PASSWORD`

#### Option B: Other Email Providers

**SendGrid:**
- `SMTP_HOST`: `smtp.sendgrid.net`
- `SMTP_PORT`: `587`
- `SMTP_SECURE`: `false`
- `SMTP_USER`: `apikey`
- `SMTP_PASSWORD`: Your SendGrid API key

**Mailgun:**
- `SMTP_HOST`: `smtp.mailgun.org`
- `SMTP_PORT`: `587`
- `SMTP_SECURE`: `false`
- `SMTP_USER`: Your Mailgun SMTP username
- `SMTP_PASSWORD`: Your Mailgun SMTP password

**AWS SES:**
- `SMTP_HOST`: `email-smtp.us-east-1.amazonaws.com` (or your region)
- `SMTP_PORT`: `587`
- `SMTP_SECURE`: `false`
- `SMTP_USER`: Your AWS SES SMTP username
- `SMTP_PASSWORD`: Your AWS SES SMTP password

### Testing Email Configuration

After setting up SMTP variables:

1. **Redeploy Railway** (automatic after saving variables)
2. **Check Railway Logs** for email errors:
   - Go to Railway Dashboard → Your Backend Service → Logs
   - Look for: `Invitation email sent:` or `Error sending invitation email:`
3. **Try inviting a caregiver** from the Family page
4. **Check the email** (and spam folder)

### Troubleshooting

#### "Failed to send invitation email" in logs

**Check:**
1. SMTP credentials are correct
2. SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD are all set
3. For Gmail: Using App Password (not regular password)
4. For Gmail: 2-Step Verification is enabled

#### Emails going to spam

**Solutions:**
1. Use a professional email service (SendGrid, Mailgun, AWS SES)
2. Set up SPF/DKIM records for your domain
3. Use a custom domain email (not Gmail)

#### No email errors but emails not arriving

**Check:**
1. Railway logs for `Invitation email sent:` message
2. Email address is correct
3. Check spam folder
4. Verify SMTP service is working (test with a different email client)

### Development Mode (No SMTP)

If SMTP variables are not set, the backend uses Ethereal Email (test service):
- Emails are not actually sent
- Preview URL is logged in console
- Use this only for development/testing

### Quick Setup Checklist

- [ ] Set `SMTP_HOST` in Railway
- [ ] Set `SMTP_PORT` in Railway
- [ ] Set `SMTP_SECURE` in Railway
- [ ] Set `SMTP_USER` in Railway
- [ ] Set `SMTP_PASSWORD` in Railway (App Password for Gmail)
- [ ] Set `SMTP_FROM` in Railway (optional)
- [ ] Redeploy Railway
- [ ] Test by inviting a caregiver
- [ ] Check Railway logs for email status
- [ ] Check email inbox (and spam)

## Which Email Are You Missing?

### If it's the verification email (signup):
- Check Firebase Console email templates
- Check spam folder
- Verify action URL is correct

### If it's the invitation email (caregiver invite):
- Set up SMTP variables in Railway (see above)
- Check Railway logs for errors
- Verify email address is correct

## Need Help?

1. **Check Railway Logs** - Look for email-related errors
2. **Test SMTP** - Try sending a test email
3. **Verify Variables** - Make sure all SMTP variables are set correctly
4. **Check Email Service** - Verify your email provider is working

