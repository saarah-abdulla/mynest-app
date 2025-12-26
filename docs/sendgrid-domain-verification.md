# SendGrid Domain Verification for MyNest

Using your custom domain email (`info@mynest.ae`) is the best option for professional email delivery.

## Option 1: Domain Authentication (Recommended)

This allows you to send from any email address on your domain (e.g., `info@mynest.ae`, `noreply@mynest.ae`, etc.).

### Step 1: Add Domain in SendGrid

1. Go to [SendGrid Dashboard](https://app.sendgrid.com/)
2. Navigate to **Settings** → **Sender Authentication**
3. Click **Authenticate Your Domain**
4. Select your DNS provider (or "Other" if not listed)
5. Enter your domain: `mynest.ae`
6. Click **Next**

### Step 2: Add DNS Records

SendGrid will provide DNS records to add. You'll need to add these to your domain's DNS settings:

**Example records (SendGrid will give you exact values):**

```
Type: CNAME
Name: em1234 (or similar)
Value: u1234567.wl123.sendgrid.net

Type: CNAME
Name: s1._domainkey.mynest.ae
Value: s1.domainkey.u1234567.wl123.sendgrid.net

Type: CNAME
Name: s2._domainkey.mynest.ae
Value: s2.domainkey.u1234567.wl123.sendgrid.net
```

### Step 3: Add Records to Your DNS

1. Go to your domain registrar (where you manage `mynest.ae`)
2. Find DNS management / DNS records section
3. Add the CNAME records provided by SendGrid
4. Save changes

### Step 4: Verify Domain

1. Go back to SendGrid
2. Click **Verify** next to your domain
3. Wait 5-10 minutes for DNS propagation
4. Status should show "Verified" (green checkmark)

**Note:** DNS changes can take up to 48 hours, but usually complete within minutes.

## Option 2: Single Sender Verification (Faster, But Limited)

If you want to start sending immediately without waiting for DNS changes:

### Step 1: Verify Single Sender

1. Go to **Settings** → **Sender Authentication**
2. Click **Verify a Single Sender**
3. Fill in:
   - **From Email Address**: `info@mynest.ae`
   - **From Name**: `MyNest`
   - **Reply To**: `info@mynest.ae`
   - **Company Address**: Your address
4. Click **Create**
5. **Check your email** at `info@mynest.ae` for verification link
6. Click the verification link
7. Wait for status to show "Verified"

**Important:** Make sure you can receive emails at `info@mynest.ae` before starting this process!

## Update Railway Variables

After verification (either method), update Railway:

```
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASSWORD=SG.your-sendgrid-api-key
SMTP_FROM="MyNest" <info@mynest.ae>
FRONTEND_URL=https://mynest-app.vercel.app
```

## Benefits of Using Your Domain Email

✅ **Professional appearance** - Emails come from `info@mynest.ae`  
✅ **Better deliverability** - Domain authentication improves inbox placement  
✅ **Brand consistency** - Matches your website domain  
✅ **Flexibility** - Can send from multiple addresses (with domain auth)  
✅ **Trust** - Recipients see your actual domain, not a third-party email  

## Troubleshooting

### "Email not verified" error

- Make sure you clicked the verification link in the email
- Check spam folder for verification email
- Wait a few minutes for SendGrid to process

### DNS records not working

- Wait 5-10 minutes after adding DNS records
- Use a DNS checker tool to verify records are live
- Make sure CNAME records are added correctly (no typos)
- Some DNS providers require the full domain in the name field

### Can't receive emails at info@mynest.ae

- Make sure email forwarding/mailbox is set up with your domain provider
- Check that MX records are configured correctly
- You may need to set up email hosting with your domain provider first

## Next Steps

1. **Choose verification method** (Domain auth recommended)
2. **Complete verification** in SendGrid
3. **Update Railway variables** with `info@mynest.ae`
4. **Test** by creating a caregiver invitation
5. **Check logs** for success message


