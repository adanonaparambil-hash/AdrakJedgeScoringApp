# ✅ FINAL SETUP - Service Account Integration

## What's Configured

Your application now uses:
- ✅ **service-account-key.json** for Google Sheets API access
- ✅ **Backend server** (server/index.js) with Google Sheets API v4
- ✅ **Frontend** (Angular) calls backend API
- ✅ **Direct read** from Google Sheets (CSV export)
- ✅ **Write through backend** using service account

---

## 🚀 START THE APPLICATION

```bash
npm run dev
```

This command starts:
1. Backend server on http://localhost:3000
2. Angular app on http://localhost:4200

---

## 📊 Your Google Sheets

### Users Sheet
- **URL:** https://docs.google.com/spreadsheets/d/1jLyGbkHE_fopA1QwYHsvezRZeNBu4ylXTiVQol0QNDQ
- **Columns:** USERID, NAME, SUBMITTED, ISADMIN
- **Used for:** Login, tracking submissions

### Evaluation Sheet
- **URL:** https://docs.google.com/spreadsheets/d/1aYLnFkq969TOuQ2b0hY6jS2neCf5CHeV-En78QmARf4
- **Columns:** Team Name, Judge Name, [12 evaluation criteria]
- **Used for:** Storing scores, leaderboard

---

## 🔑 Service Account

- **File:** `service-account-key.json` (in project root)
- **Project:** adrakcgteventapp
- **Email:** adrakapiforjedgeapplication@adrakcgteventapp.iam.gserviceaccount.com
- **Access:** Edit permission granted to both sheets

---

## ✅ How It Works

### Reading Data (No Auth Needed)
```
Angular App → Google Sheets CSV Export → Display Data
```
- Login validation
- Leaderboard
- Existing evaluations

### Writing Data (Uses Service Account)
```
Angular App → Backend API → Google Sheets API v4 → Update Sheets
```
- Submit evaluations
- Mark user as submitted

---

## 🧪 Test It

### 1. Start the app:
```bash
npm run dev
```

### 2. Check backend is running:
Open: http://localhost:3000/api/health
Should show: `{"ok":true}`

### 3. Open the app:
Open: http://localhost:4200

### 4. Test the flow:
1. **Login** with a USERID from your Users sheet
2. **Score teams** (0-10 for each criterion)
3. **Submit** all evaluations
4. **Check Google Sheets** - data should appear immediately!

---

## 📁 Key Files

```
project/
├── service-account-key.json          ← Your credentials (DO NOT COMMIT)
├── server/
│   └── index.js                      ← Backend server (uses service account)
├── src/
│   └── app/
│       └── core/
│           └── api.service.ts        ← Frontend service (calls backend)
└── package.json                      ← Scripts: npm run dev
```

---

## ⚠️ Important Notes

1. **Backend must be running** for submissions to work
2. **Service account file** must exist in project root
3. **Sheets must be shared** with service account email
4. **Port 3000** must be available for backend
5. **Port 4200** must be available for Angular

---

## 🎯 Commands

| Command | What it does |
|---------|-------------|
| `npm run dev` | Start both backend and frontend |
| `npm run server` | Start only backend server |
| `npm start` | Start only Angular app |
| `npm run build` | Build Angular app for production |

---

## ✅ Everything is Ready!

Just run:
```bash
npm run dev
```

Then open http://localhost:4200 and start using the app! 🎉

The data will be automatically saved to your Google Sheets using the service account credentials.
