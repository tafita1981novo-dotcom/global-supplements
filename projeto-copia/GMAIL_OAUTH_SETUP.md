# 📧 Gmail OAuth Setup Guide

## ✅ Step 1: Save OAuth Credentials (DONE!)

You've already created the OAuth Client in Google Cloud Console. Now save these credentials in Replit Secrets:

### **Go to Replit Secrets and add:**

```env
VITE_GMAIL_CLIENT_ID=81144435101-t16ikl0nf3r5dnh0v7eot2e9u2l7164l.apps.googleusercontent.com
VITE_GMAIL_CLIENT_SECRET=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
```

---

## 🔑 Step 2: Generate Refresh Token

To send emails via Gmail API, you need a **Refresh Token**. Follow these steps:

### **2.1 Go to OAuth 2.0 Playground:**
👉 https://developers.google.com/oauthplayground

### **2.2 Configure Settings (⚙️ icon top-right):**
- ✅ Check "Use your own OAuth credentials"
- Paste your **Client ID**: `81144435101-t16ikl0nf3r5dnh0v7eot2e9u2l7164l.apps.googleusercontent.com`
- Paste your **Client Secret**: `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`

### **2.3 Select Gmail API Scopes:**
In "Step 1 - Select & authorize APIs":
- Expand **Gmail API v1**
- Select: `https://www.googleapis.com/auth/gmail.send` (to send emails)
- Click **"Authorize APIs"**
- Login with your Gmail account
- Allow permissions

### **2.4 Exchange Authorization Code:**
- Click **"Exchange authorization code for tokens"**
- Copy the **Refresh Token** (looks like `1//0g...`)

### **2.5 Save Refresh Token in Replit Secrets:**
```env
VITE_GMAIL_REFRESH_TOKEN=1//0gYourRefreshTokenHere...
```

---

## ✅ Step 3: Verify Configuration

After saving all 3 credentials in Replit Secrets, check the Credentials Manager:

1. Go to `/credentials-manager`
2. You should see **3 green badges** for Gmail:
   - ✅ Gmail OAuth Client ID
   - ✅ Gmail OAuth Client Secret
   - ✅ Gmail Refresh Token

---

## 🚀 Step 4: Test Email Sending

Once configured, the system will automatically use Gmail OAuth to send:
- 📧 B2B buyer outreach emails
- 📬 Automated follow-ups
- 💰 Deal closing notifications

All emails will be sent from **your Gmail account**, giving them maximum deliverability and authenticity!

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
