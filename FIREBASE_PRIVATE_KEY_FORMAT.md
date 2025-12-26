# Firebase Private Key Format for Railway

## ✅ YES - Keep the Entire Key

You need to include **everything** from the JSON file:

```
-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...
(many lines of encoded characters)
...
-----END PRIVATE KEY-----
```

## How to Format for Railway

### Option 1: Single Line with \n (Recommended)

When pasting into Railway, convert the multi-line key to a single line with `\n` for newlines:

```
-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n
```

**Steps:**
1. Open the JSON file you downloaded from Firebase
2. Copy the entire `private_key` value (including BEGIN and END lines)
3. In a text editor, replace all actual line breaks with `\n`
4. Paste the single-line version into Railway

### Option 2: Multi-line (If Railway Supports It)

Some platforms allow multi-line values. If Railway's variable editor supports it:
- Paste the key exactly as it appears in the JSON file
- Keep all line breaks
- Include BEGIN and END lines

### Option 3: Use Railway's JSON Import

If Railway allows importing from the JSON file directly, that's the easiest option.

## Example Format

**From JSON file:**
```json
{
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
}
```

**For Railway (FIREBASE_PRIVATE_KEY variable):**
```
-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n
```

## Quick Test

After adding the key, check your Railway logs. You should see:
```
[auth] Firebase initialized successfully
```

If you see errors about invalid key format, try:
1. Ensure `\n` characters are present (not actual line breaks)
2. Verify BEGIN and END lines are included
3. Check there are no extra spaces or quotes

## What NOT to Do

❌ Don't remove "-----BEGIN PRIVATE KEY-----"  
❌ Don't remove "-----END PRIVATE KEY-----"  
❌ Don't add extra quotes around the key  
❌ Don't use actual line breaks (use `\n` instead)

## Troubleshooting

**"Invalid key format"**
- Make sure you included BEGIN and END lines
- Verify `\n` characters are present (not actual newlines)
- Check for extra spaces or characters

**"Key not found"**
- Verify the variable name is exactly `FIREBASE_PRIVATE_KEY`
- Check it's in the backend service, not database service
- Ensure it's saved (Railway auto-saves)


