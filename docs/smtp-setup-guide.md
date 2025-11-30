# SMTP Configuration Guide for MyNest

This guide will help you configure SMTP email settings to send caregiver invitation emails.

## Quick Setup

Add these environment variables to your `backend/.env` file:

```env
# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM="MyNest" <noreply@mynest.app>

# Frontend URL (for invitation links)
FRONTEND_URL=http://localhost:5173
```

## Option 1: Gmail (Recommended for Development)

### Step 1: Enable 2-Factor Authentication
1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Click on **Security** in the left sidebar
3. Under "Signing in to Google", enable **2-Step Verification** if not already enabled

### Step 2: Generate App Password
1. Go back to **Security** settings
2. Under "Signing in to Google", click **2-Step Verification**
3. Scroll down and click **App passwords**
4. Select **Mail** as the app and **Other (Custom name)** as the device
5. Enter "MyNest" as the custom name
6. Click **Generate**
7. Copy the 16-character password (it will look like: `abcd efgh ijkl mnop`)

### Step 3: Update .env File
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=abcdefghijklmnop  # Use the app password (remove spaces)
SMTP_FROM="MyNest" <your-email@gmail.com>
FRONTEND_URL=http://localhost:5173
```

**Important:** Use the App Password, NOT your regular Gmail password.

## Option 2: SendGrid (Recommended for Production)

### Step 1: Create SendGrid Account
1. Sign up at [SendGrid](https://sendgrid.com/)
2. Verify your account

### Step 2: Create API Key
1. Go to **Settings** → **API Keys**
2. Click **Create API Key**
3. Name it "MyNest API Key"
4. Select **Full Access** or **Restricted Access** (with Mail Send permissions)
5. Copy the API key

### Step 3: Update .env File
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASSWORD=your-sendgrid-api-key-here
SMTP_FROM="MyNest" <noreply@yourdomain.com>
FRONTEND_URL=http://localhost:5173
```

## Option 3: AWS SES (For Production)

### Step 1: Set up AWS SES
1. Go to AWS Console → Simple Email Service
2. Verify your email address or domain
3. Move out of sandbox mode (request production access)

### Step 2: Create SMTP Credentials
1. Go to **SMTP Settings** in SES
2. Click **Create SMTP Credentials**
3. Download the credentials file

### Step 3: Update .env File
```env
SMTP_HOST=email-smtp.us-east-1.amazonaws.com  # Use your region's endpoint
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-aws-smtp-username
SMTP_PASSWORD=your-aws-smtp-password
SMTP_FROM="MyNest" <noreply@yourdomain.com>
FRONTEND_URL=http://localhost:5173
```

## Option 4: Development/Testing (No Real SMTP)

If you don't configure SMTP credentials, the app will use Ethereal Email (a test email service) in development mode. You'll see preview URLs in the console logs.

**No configuration needed** - just leave SMTP variables empty or unset.

## Testing Your Configuration

1. **Restart your backend server** after updating `.env`:
   ```bash
   cd backend
   npm run dev
   ```

2. **Create a caregiver with an email** through the app

3. **Check the console logs**:
   - If using Gmail/SendGrid/SES: Look for "Invitation email sent to..."
   - If using Ethereal: Look for "Preview URL: https://ethereal.email/..."

4. **Check the recipient's inbox** (or spam folder)

## Troubleshooting

### Gmail Issues

**Error: "Invalid login"**
- Make sure you're using an App Password, not your regular password
- Ensure 2-Factor Authentication is enabled
- Check that the email address is correct

**Error: "Less secure app access"**
- Gmail no longer supports "less secure apps"
- You MUST use App Passwords with 2FA enabled

### SendGrid Issues

**Error: "Authentication failed"**
- Make sure `SMTP_USER=apikey` (literally the word "apikey")
- Verify your API key has Mail Send permissions
- Check that the API key is correct

### General Issues

**Emails not sending:**
- Check backend console for error messages
- Verify all SMTP variables are set correctly
- Ensure your firewall isn't blocking port 587
- For production, check that your domain/IP isn't blacklisted

**Port 587 blocked:**
- Try port 465 with `SMTP_SECURE=true`
- Or use port 25 (may be blocked by some ISPs)

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `SMTP_HOST` | SMTP server hostname | `smtp.gmail.com` |
| `SMTP_PORT` | SMTP server port | `587` (TLS) or `465` (SSL) |
| `SMTP_SECURE` | Use SSL/TLS | `false` for port 587, `true` for port 465 |
| `SMTP_USER` | SMTP username | Your email or `apikey` for SendGrid |
| `SMTP_PASSWORD` | SMTP password | App password or API key |
| `SMTP_FROM` | From email address | `"MyNest" <noreply@mynest.app>` |
| `FRONTEND_URL` | Your frontend URL | `http://localhost:5173` or production URL |

## Security Notes

- **Never commit `.env` files to git** - they're already in `.gitignore`
- Use App Passwords for Gmail, never your main password
- For production, use a dedicated email service (SendGrid, AWS SES, etc.)
- Rotate API keys/passwords regularly



