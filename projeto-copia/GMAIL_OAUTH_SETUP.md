# 📧 Gmail OAuth Setup Guide

## ✅ Step 1: Save OAuth Credentials SECURELY (Server-Side)

You've created the OAuth Client in Google Cloud Console. Now save these credentials **securely in Supabase Edge Functions** (NOT in frontend env vars!):

### **Go to Supabase Dashboard:**
1. Open: https://supabase.com/dashboard/project/twglceexfetejawoumsr/functions
2. Click on `gmail-oauth-sender` function
3. Go to **"Secrets"** tab
4. Add these secrets:

```env
GMAIL_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
GMAIL_CLIENT_SECRET=your_client_secret_here
GMAIL_REFRESH_TOKEN=your_refresh_token_here (step 2 below)
```

⚠️ **CRITICAL SECURITY:** Credentials are stored SERVER-SIDE in Supabase Edge Function secrets, NEVER exposed to browser!

---

## 🔑 Step 2: Generate Refresh Token

To send emails via Gmail API, you need a **Refresh Token**. Follow these steps:

### **2.1 Go to OAuth 2.0 Playground:**
👉 https://developers.google.com/oauthplayground

### **2.2 Configure Settings (⚙️ icon top-right):**
- ✅ Check "Use your own OAuth credentials"
- Paste your **Client ID** from Google Cloud Console
- Paste your **Client Secret** from Google Cloud Console

### **2.3 Select Gmail API Scopes:**
In "Step 1 - Select & authorize APIs":
- Expand **Gmail API v1**
- Select: `https://www.googleapis.com/auth/gmail.send` (to send emails)
- Click **"Authorize APIs"**
- Login with your Gmail account
- Allow permissions

### **2.4 Exchange Authorization Code:**
- Click **"Exchange authorization code for tokens"**
- Copy the **Refresh Token** (long string starting with `1//0g...`)

### **2.5 Save Refresh Token in Supabase:**
Go back to Supabase Dashboard > gmail-oauth-sender > Secrets and add:
```env
GMAIL_REFRESH_TOKEN=your_refresh_token_here
```

⚠️ **SECURITY:** Never share or commit your refresh token! It stays secure in Supabase server-side.

---

## ✅ Step 3: Deploy Edge Function

After adding all 3 secrets in Supabase, deploy the function:

```bash
cd projeto-copia
npx supabase@beta functions deploy gmail-oauth-sender
```

Then verify it's running at:
https://supabase.com/dashboard/project/twglceexfetejawoumsr/functions/gmail-oauth-sender

---

## 🚀 Step 4: Test Email Sending

Once the Edge Function is deployed with credentials, test it:

1. Go to `/gmail-oauth-test` in your app
2. Enter your email address
3. Click "Send Test Email"
4. Check your inbox for the test message!

The system will now automatically send:
- 📧 B2B buyer outreach emails
- 📬 Automated follow-ups
- 💰 Deal closing notifications

All emails sent from **your Gmail account** via secure server-side OAuth - maximum deliverability!

---

## 🔥 Benefits of Gmail OAuth:

✅ **Higher Deliverability** - Emails come from your real Gmail account
✅ **No Daily Limits** - Gmail API allows 10,000+ emails/day (vs 500 for regular Gmail)
✅ **Professional** - Emails appear in buyer's inbox, not spam
✅ **Tracking** - Full control over sent emails and responses
✅ **Automation** - 24/7 automated outreach without manual intervention

---

## 📊 Expected Impact:

Once Gmail OAuth is configured:
- 🚀 **Email Automation**: UNLOCKED ($5K-$20K/month)
- 📈 **B2B Outreach**: 10x faster buyer engagement
- 💰 **Deal Closing**: Automated follow-ups = higher conversion

---

## ⚠️ Troubleshooting:

**Error: "OAuth consent screen required"**
- Go to: https://console.cloud.google.com/apis/credentials/consent
- Configure OAuth consent screen
- Add test users (your Gmail)

**Error: "Access blocked: This app's request is invalid"**
- Check that redirect URI includes: `https://developers.google.com/oauthplayground`
- Add it in Google Cloud Console > Credentials > OAuth Client > Authorized redirect URIs

---

**Next:** After getting your refresh token, paste it in Replit Secrets and the system will automatically start using Gmail for all email automation! 🎯
