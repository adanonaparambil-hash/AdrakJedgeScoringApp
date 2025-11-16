# 🔑 Google Sheets API Setup - Backend Server Method

## 🎯 Overview

This guide shows you how to set up Google Sheets API with a service account to enable automatic writing to Google Sheets from the backend server.

---

## 🚀 Setup Steps

### Step 1: Create Google Cloud Project

1. **Go to Google Cloud Console:**
   ```
   https://console.cloud.google.com/
   ```

2. **Create new project:**
   - Click **Select a project** → **New Project**
   - Name: "CGT Judge App"
   - Click **Create**

3. **Enable Google Sheets API:**
   - Go to **APIs & Services** → **Library**
   - Search for "Google Sheets API"
   - Click **Enable**

---

### Step 2: Create Service Account

1. **Go to Service Accounts:**
   - **APIs & Services** → **Credentials**
   - Click **Create Credentials** → **Service Account**

2. **Fill in details:**
   - Service account name: "cgt-judge-service"
   - Service account ID: (auto-generated)
   - Click **Create and Continue**

3. **Grant permissions:**
   - Role: **Editor** (or **Owner**)
   - Click **Continue** → **Done**

4. **Create key:**
   - Click on the service account you just created
   - Go to **Keys** tab
   - Click **Add Key** → **Create new key**
   - Choose **JSON**
   - Click **Create**
   - **Save the downloaded JSON file!**

---

### Step 3: Share Google Sheets with Service Account

1. **Copy service account email:**
   - From the JSON file, find the `client_email` field
   - Example: `cgt-judge-service@project-id.iam.gserviceaccount.com`

2. **Share Evaluation Sheet:**
   - Open: https://docs.google.com/spreadsheets/d/1e8_bLRJqe6m9vAnc6Jmx6pam1NoJT6nI/edit
   - Click **Share**
   - Paste service account email
   - Set permission to **Editor**
   - **Uncheck** "Notify people"
   - Click **Share**

3. **Share Users Sheet:**
   - Open: https://docs.google.com/spreadsheets/d/1iKFh699K_TapsbUG539bvUG7rYvNN0eA/edit
   - Click **Share**
   - Paste service account email
   - Set permission to **Editor**
   - **Uncheck** "Notify people"
   - Click **Share**

---

### Step 4: Configure Backend Server

1. **Place credentials file:**
   ```bash
   # Copy the downloaded JSON file to server folder
   cp ~/Downloads/cgt-judge-service-*.json server/service-account-key.json
   ```

2. **Verify file location:**
   ```
   server/
   ├── index.js
   ├── package.json
   └── service-account-key.json  ← Should be here
   ```

3. **Update server code (already done!):**
   The server is already configured to use this file.

---

### Step 5: Test the Setup

1. **Start the server:**
   ```bash
   cd server
   npm install
   node index.js
   ```

   You should see:
   ```
   ✅ Google Sheets write access enabled
   ```

2. **Start the app:**
   ```bash
   ng serve
   ```

3. **Test submission:**
   - Login as judge
   - Score teams
   - Submit evaluations
   - Check Google Sheets for new data

---

## 🔧 Server Configuration

The server is already configured in `server/index.js`:

```javascript
// Google Sheets API setup
async function initializeGoogleSheetsAPI() {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: './service-account-key.json',
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    sheets = google.sheets({ version: 'v4', auth });
    console.log('✅ Google Sheets API initialized with service account');
    return true;
  } catch (error) {
    console.log('⚠️  Service account not found, using public read-only mode');
    return false;
  }
}
```

---

## 📊 What Gets Written

### Evaluation Sheet

**API Call:**
```javascript
sheets.spreadsheets.values.update({
  spreadsheetId: '1e8_bLRJqe6m9vAnc6Jmx6pam1NoJT6nI',
  range: 'Sheet1!A2:N2',
  valueInputOption: 'RAW',
  resource: {
    values: [[
      'Blue',           // Team Name
      'Judge One',      // Judge Name
      8,                // Criteria 1
      9,                // Criteria 2
      // ... 10 more criteria
    ]]
  }
});
```

### Users Sheet

**API Call:**
```javascript
sheets.spreadsheets.values.update({
  spreadsheetId: '1iKFh699K_TapsbUG539bvUG7rYvNN0eA',
  range: 'Sheet1!C2',  // SUBMITTED column
  valueInputOption: 'RAW',
  resource: {
    values: [['Y']]
  }
});
```

---

## 🐛 Troubleshooting

### "Service account not found"

**Problem:** `service-account-key.json` not in correct location

**Solution:**
```bash
# Check if file exists
ls server/service-account-key.json

# If not, copy it
cp path/to/downloaded/file.json server/service-account-key.json
```

### "Permission denied"

**Problem:** Sheets not shared with service account

**Solution:**
1. Open both Google Sheets
2. Click Share
3. Add service account email
4. Set to Editor
5. Share

### "API not enabled"

**Problem:** Google Sheets API not enabled in Cloud Console

**Solution:**
1. Go to Google Cloud Console
2. APIs & Services → Library
3. Search "Google Sheets API"
4. Click Enable

### "Invalid credentials"

**Problem:** Wrong JSON file or corrupted

**Solution:**
1. Go to Google Cloud Console
2. Service Accounts
3. Create new key
4. Download fresh JSON
5. Replace old file

---

## 📝 File Structure

```
project/
├── server/
│   ├── index.js
│   ├── package.json
│   └── service-account-key.json  ← Add this file
├── src/
│   └── app/
│       └── ...
└── ...
```

---

## 🔐 Security Notes

### ⚠️ Important

1. **Never commit `service-account-key.json` to Git!**
   - Add to `.gitignore`
   - Keep it private

2. **Limit service account permissions:**
   - Only share specific sheets
   - Use Editor role (not Owner)

3. **Rotate keys regularly:**
   - Create new keys every few months
   - Delete old keys

### .gitignore

Add this to your `.gitignore`:
```
server/service-account-key.json
*.json
!package.json
!tsconfig.json
```

---

## ✅ Verification Checklist

Before testing:
- [ ] Google Cloud Project created
- [ ] Google Sheets API enabled
- [ ] Service account created
- [ ] JSON key downloaded
- [ ] File placed in `server/service-account-key.json`
- [ ] Both sheets shared with service account email
- [ ] Service account has Editor permission
- [ ] Server started successfully
- [ ] See "✅ Google Sheets write access enabled" message

---

## 🎯 Complete Flow

```
User submits evaluations
    ↓
Frontend sends to backend API
    ↓
Backend authenticates with service account
    ↓
Backend writes to Evaluation Sheet
    ↓
Backend updates SUBMITTED in Users Sheet
    ↓
Backend returns success
    ↓
Frontend shows confirmation
```

---

## 📞 Quick Commands

```bash
# Check if service account file exists
ls server/service-account-key.json

# Start server
cd server
node index.js

# Should see:
# ✅ Google Sheets write access enabled

# If you see:
# ⚠️  Service account not found
# Then the file is missing or in wrong location
```

---

## 🎊 Done!

Now your backend server can write to Google Sheets automatically! 🚀

**Submissions will:**
✅ Write scores to Evaluation Sheet
✅ Update SUBMITTED column to Y
✅ Work automatically
✅ No manual updates needed
