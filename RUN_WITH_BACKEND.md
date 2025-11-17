# ✅ Running with Backend Server (Service Account)

## Setup Complete!

Your app is now configured to use the **Node.js backend server** with your **service account credentials** to write to Google Sheets.

---

## 🚀 How to Run

### Option 1: Run Both Together (EASIEST)
```bash
npm run dev
```

This starts:
- Backend server on http://localhost:3000
- Angular app on http://localhost:4200

### Option 2: Run Separately

**Terminal 1 - Backend Server:**
```bash
npm run server
```

**Terminal 2 - Angular App:**
```bash
npm start
```

---

## ✅ What Happens

1. **Frontend reads** from Google Sheets (CSV export - no auth needed)
   - Login validation
   - Leaderboard data
   - Existing evaluations

2. **Frontend writes** through backend server
   - Backend uses `service-account-key.json`
   - Backend calls Google Sheets API v4
   - Data is written directly to your sheets

---

## 📊 Data Flow

```
Angular App (Browser)
    ↓ READ (CSV)
Google Sheets ← → Backend Server (service-account-key.json)
    ↑ WRITE (API v4)
Angular App (Browser)
```

---

## 🔍 Verify It's Working

### 1. Start the backend:
```bash
npm run server
```

**Expected output:**
```
Server listening on http://localhost:3000
Google Sheets integration enabled
Users Sheet: https://docs.google.com/spreadsheets/d/1jLyGbkHE_fopA1QwYHsvezRZeNBu4ylXTiVQol0QNDQ
Evaluation Sheet: https://docs.google.com/spreadsheets/d/1aYLnFkq969TOuQ2b0hY6jS2neCf5CHeV-En78QmARf4
✅ Google Sheets write access enabled
Cache initialized with X evaluations from Google Sheet
```

### 2. Test backend endpoint:
Open browser: http://localhost:3000/api/health

Should show: `{"ok":true}`

### 3. Start Angular app:
```bash
npm start
```

Open: http://localhost:4200

### 4. Test the flow:
1. Login with a valid USERID from your Users sheet
2. Score teams
3. Click "Submit All Evaluations"
4. Check your Google Sheets - data should appear!

---

## ❌ Troubleshooting

### "Failed to submit. Make sure backend server is running"
**Fix:** Run `npm run server` in a separate terminal

### "Google Sheets read-only mode"
**Fix:** Check that `service-account-key.json` exists in the project root

### "User not found"
**Fix:** Make sure the USERID exists in your Users sheet

### CORS errors
**Fix:** Backend server must be running on http://localhost:3000

---

## 📁 Files Used

- `service-account-key.json` - Your Google Cloud service account credentials
- `server/index.js` - Backend server that uses the service account
- `src/app/core/api.service.ts` - Frontend service that calls the backend

---

## 🎯 Summary

✅ Backend server uses your service account credentials
✅ Frontend calls backend API at http://localhost:3000/api
✅ Data is written directly to Google Sheets
✅ No manual export needed
✅ Real-time sync

Just run: `npm run dev` and you're good to go! 🎉
