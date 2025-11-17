# 🚀 START HERE - No Backend Setup

## The Situation

You want to write to Google Sheets directly from Angular **WITHOUT a Node.js backend server**.

**Problem:** Browsers cannot use service account credentials securely (they can't sign JWT tokens with RSA private keys).

**Solution:** Deploy a Google Apps Script Web App (it's like a mini API that runs on Google's servers).

---

## ✅ Quick Setup (5 Minutes)

### Step 1: Deploy Google Apps Script

Follow the instructions in: **`DEPLOY_GOOGLE_APPS_SCRIPT.md`**

Summary:
1. Open your Evaluation Sheet
2. Go to Extensions → Apps Script
3. Paste the provided code
4. Deploy as Web App
5. Copy the Web App URL

### Step 2: Update Angular App

Open `src/app/core/api.service.ts` (line ~48):

```typescript
private readonly APPS_SCRIPT_URL = 'PASTE_YOUR_WEB_APP_URL_HERE';
```

Replace with your actual Web App URL from Step 1.

### Step 3: Run the App

```bash
npm start
```

Open http://localhost:4200

---

## 🎯 How It Works

```
Angular App (Browser)
    ↓ READ (CSV Export)
Google Sheets
    ↑ WRITE (via Apps Script)
Angular App → Google Apps Script Web App → Google Sheets
```

**Read operations:** Direct from Google Sheets (CSV export, no auth)
**Write operations:** Through Google Apps Script Web App (runs on Google's servers)

---

## ✅ Benefits

- ✅ No Node.js backend server needed
- ✅ No `npm run server` required
- ✅ No `service-account-key.json` needed in frontend
- ✅ Secure (credentials stay on Google's servers)
- ✅ Direct integration with Google Sheets
- ✅ Free and scalable

---

## 📝 Current Status

Right now, the app:
- ✅ Reads from Google Sheets (works)
- ⚠️ Writes to localStorage (fallback until you deploy Apps Script)

After deploying Apps Script:
- ✅ Reads from Google Sheets
- ✅ Writes to Google Sheets (real-time sync)

---

## 🧪 Test It

1. **Before Apps Script:** Data saves to browser localStorage only
2. **After Apps Script:** Data writes directly to Google Sheets

---

## 📁 Important Files

- `DEPLOY_GOOGLE_APPS_SCRIPT.md` - Step-by-step deployment guide
- `src/app/core/api.service.ts` - Update line 48 with your Web App URL
- `service-account-key.json` - NOT USED in frontend (security risk)

---

## ⚠️ Why Not Use Service Account in Frontend?

**Security reasons:**
1. Private keys would be exposed in browser code
2. Anyone can view source code and steal credentials
3. Browsers can't sign JWT tokens with RSA keys
4. CORS policy blocks direct API calls

**Google Apps Script solves this:**
- Runs on Google's servers (not in browser)
- Credentials never exposed to users
- No CORS issues
- Simple to deploy and maintain

---

## 🆘 Need Help?

See `DEPLOY_GOOGLE_APPS_SCRIPT.md` for detailed instructions with screenshots and troubleshooting.

---

**TL;DR:** Deploy Google Apps Script Web App (5 min), paste URL in api.service.ts, done! 🎉
