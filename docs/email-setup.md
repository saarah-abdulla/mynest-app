# Email Setup for Caregiver Invitations

MyNest uses nodemailer to send invitation emails to caregivers. You need to configure SMTP settings in your backend environment variables.

## Environment Variables

Add these variables to your `backend/.env` file:

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

## Gmail Setup

If using Gmail:

1. Enable 2-Factor Authentication on your Google account
2. Generate an App Password:
   - Go to [Google Account Settings](https://myaccount.google.com/)
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
   - Use this password in `SMTP_PASSWORD`

## Other Email Providers

### SendGrid
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=your-sendgrid-api-key
```

### AWS SES
```env
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=your-aws-access-key
SMTP_PASSWORD=your-aws-secret-key
```

### Development/Testing

For development without a real SMTP server, nodemailer will use Ethereal Email (a test email service). Check the console logs for preview URLs.

## Testing

After setting up, when you create a caregiver with an email address, an invitation email will be automatically sent.



