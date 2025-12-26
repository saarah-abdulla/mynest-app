# Vercel Domain Configuration Guide

This guide helps you configure your custom domains (`mynest.ae` and `www.mynest.ae`) on Vercel.

## Current Status

Both domains are showing "Invalid Configuration" because the DNS records haven't been set up at your domain registrar yet.

## Required DNS Records

### 1. Root Domain: `mynest.ae`

**DNS Record Type:** `A` Record

- **Name/Host:** `@` (or leave blank, depending on your registrar)
- **Value/Target:** `216.198.79.1`
- **TTL:** 3600 (or default)

### 2. WWW Subdomain: `www.mynest.ae`

**DNS Record Type:** `CNAME` Record

- **Name/Host:** `www`
- **Value/Target:** `3412ccd4a0bb8826.vercel-dns-017.com.`
- **TTL:** 3600 (or default)

## Step-by-Step Instructions

### Step 1: Access Your Domain Registrar

1. Log in to your domain registrar (where you purchased `mynest.ae`)
2. Navigate to DNS Management or DNS Settings
3. Look for "DNS Records", "DNS Zone", or "Name Servers" section

### Step 2: Add the A Record for Root Domain

1. Click "Add Record" or "Create Record"
2. Select record type: **A**
3. Enter:
   - **Name/Host:** `@` (or leave blank if your registrar doesn't support `@`)
   - **Value/IP:** `216.198.79.1`
   - **TTL:** 3600 (or default)
4. Save the record

### Step 3: Add the CNAME Record for WWW

1. Click "Add Record" or "Create Record"
2. Select record type: **CNAME**
3. Enter:
   - **Name/Host:** `www`
   - **Value/Target:** `3412ccd4a0bb8826.vercel-dns-017.com.` (include the trailing dot)
   - **TTL:** 3600 (or default)
4. Save the record

### Step 4: Wait for DNS Propagation

DNS changes can take:
- **Minimum:** 5-10 minutes
- **Typical:** 1-2 hours
- **Maximum:** Up to 48 hours (rare)

### Step 5: Verify in Vercel

1. Go back to Vercel Dashboard → Domains
2. Click "Refresh" next to each domain
3. The status should change from "Invalid Configuration" to "Valid Configuration" (green checkmark)

## Common Domain Registrars

### GoDaddy
1. Go to "My Products" → "DNS"
2. Click "Add" under "Records"
3. Select type, enter name and value

### Namecheap
1. Go to "Domain List" → Click "Manage" next to your domain
2. Go to "Advanced DNS" tab
3. Click "Add New Record"

### Cloudflare
1. Go to your domain → "DNS" → "Records"
2. Click "Add record"
3. Select type, enter name and content

### Google Domains
1. Go to "DNS" section
2. Click "Manage custom records"
3. Add new record

### UAE-based Registrars (e.g., .ae domains)
- **aeDA (UAE Domain Registry)**: Contact your registrar for DNS management
- **UAE-based registrars**: Usually have a DNS management panel similar to international registrars

## Troubleshooting

### Still Showing "Invalid Configuration" After 24 Hours

1. **Verify DNS Records:**
   ```bash
   # Check A record for root domain
   dig mynest.ae A
   
   # Check CNAME for www
   dig www.mynest.ae CNAME
   ```

2. **Check for Conflicting Records:**
   - Remove any old A or CNAME records pointing to other IPs
   - Ensure no conflicting records exist

3. **Verify Record Values:**
   - A record must point to exactly: `216.198.79.1`
   - CNAME must point to exactly: `3412ccd4a0bb8826.vercel-dns-017.com.` (with trailing dot)

### Domain Not Resolving

1. **Clear DNS Cache:**
   ```bash
   # macOS
   sudo dscacheutil -flushcache
   
   # Windows
   ipconfig /flushdns
   
   # Linux
   sudo systemd-resolve --flush-caches
   ```

2. **Check Propagation:**
   - Use [whatsmydns.net](https://www.whatsmydns.net) to check global DNS propagation
   - Enter your domain and check if records are visible worldwide

### "Invalid Configuration" Persists

1. **Double-check the exact values:**
   - Copy-paste the values from Vercel (don't type manually)
   - Ensure no extra spaces or characters

2. **Check TTL:**
   - Lower TTL (300-600) can help with faster updates
   - Higher TTL (3600) is fine once configured

3. **Contact Support:**
   - If issues persist after 48 hours, contact Vercel support
   - They can verify DNS records on their end

## Redirect Configuration

Vercel shows that `mynest.ae` redirects to `www.mynest.ae` (307 redirect). This is configured automatically by Vercel once both domains are properly set up.

## After Configuration

Once DNS is configured and verified:

1. ✅ Both domains will show "Valid Configuration"
2. ✅ Your app will be accessible at:
   - `https://mynest.ae`
   - `https://www.mynest.ae`
3. ✅ SSL certificates will be automatically provisioned by Vercel
4. ✅ Both domains will redirect to HTTPS automatically

## Important Notes

- **Don't delete existing records** until new ones are verified
- **Keep both A and CNAME records** - they serve different purposes
- **DNS propagation is global** - it may work in some regions before others
- **Vercel automatically provisions SSL** - no additional configuration needed

## Next Steps

After DNS is configured:

1. Update `ALLOW_ORIGINS` in Railway to include your custom domain:
   ```
   https://mynest.ae,https://www.mynest.ae,https://mynest-app.vercel.app
   ```

2. Test your app at both domains

3. Consider setting up a redirect preference (www to non-www or vice versa) in Vercel settings


