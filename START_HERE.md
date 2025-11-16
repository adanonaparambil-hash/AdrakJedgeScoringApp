# 🚀 START HERE - CGT Judge App

## ✨ No Backend Required!

This app works **directly with Google Sheets** - no server needed!

---

## 📋 Quick Setup (3 Steps)

### Step 1: Prepare Google Sheets ⏱️ 2 minutes

#### Sheet 1 - Users
**URL:** https://docs.google.com/spreadsheets/d/1iKFh699K_TapsbUG539bvUG7rYvNN0eA/edit?gid=1017169916

**Add these columns:**
```
USERID | NAME | SUBMITTED | ISADMIN
```

**Add sample data:**
```
admin  | Admin User  | N | Y
judge1 | Judge One   | N | N
judge2 | Judge Two   | N | N
```

**Share:** Click "Share" → "Anyone with the link" → "Viewer"

#### Sheet 2 - Evaluations
**URL:** https://docs.google.com/spreadsheets/d/1e8_bLRJqe6m9vAnc6Jmx6pam1NoJT6nI/edit?gid=1688314091

**Verify columns exist** (Team Name, Judge Name, + 12 criteria)

**Share:** Click "Share" → "Anyone with the link" → "Viewer"

---

### Step 2: Start the App ⏱️ 1 minute

```bash
npm install
ng serve
```

Open: http://localhost:4200

---

### Step 3: Test Login ⏱️ 30 seconds

**Login as Admin:**
- User ID: `admin`
- Click "Sign In"
- ✅ Should see leaderboard

**Login as Judge:**
- User ID: `judge1`
- Click "Sign In"
- ✅ Should see submit button
- ❌ Cannot view leaderboard

---

## 🎯 Key Features

### ✅ What Works
- Login with User ID (no password!)
- Score teams (0-120 points)
- Auto-save to browser
- Submit evaluation
- Leaderboard (admin only)
- Role-based access

### ⚠️ Manual Steps
- Update SUBMITTED column in sheet (N → Y)
- Scores saved in browser only

---

## 📚 Documentation

**New to the app?**
→ Read **NO_BACKEND_SETUP.md**

**Need detailed setup?**
→ Read **GOOGLE_SHEETS_TEMPLATE.md**

**Want to understand everything?**
→ Read **DOCUMENTATION_INDEX.md**

---

## 🐛 Troubleshooting

### "User not found"
1. Check USERID exists in Users Sheet
2. Verify sheet is publicly viewable
3. Test CSV URL in browser:
   ```
   https://docs.google.com/spreadsheets/d/1iKFh699K_TapsbUG539bvUG7rYvNN0eA/export?format=csv&gid=1017169916
   ```

### CORS Errors
1. Make sure sheets are publicly viewable
2. Check "Share" settings
3. Try in incognito mode

### Scores Not Saving
1. Check browser localStorage is enabled
2. Clear cache and reload
3. Check browser console (F12)

---

## 🎊 That's It!

**No server needed!**
**No database needed!**
**Just Google Sheets + Angular!**

Start the app and login with any USERID from your sheet! 🚀

---

## 📞 Quick Links

- **Setup Guide:** NO_BACKEND_SETUP.md
- **Sheet Templates:** GOOGLE_SHEETS_TEMPLATE.md
- **All Docs:** DOCUMENTATION_INDEX.md
- **Troubleshooting:** NO_BACKEND_SETUP.md (Troubleshooting section)

---

## ⚡ Commands

```bash
# Install dependencies
npm install

# Start development server
ng serve

# Build for production
ng build --configuration production

# That's all! No backend server needed!
```

---

## 🎯 Next Steps

1. ✅ Add your real users to Users Sheet
2. ✅ Test login with each user
3. ✅ Test scoring workflow
4. ✅ Test admin features
5. ✅ Test judge features
6. ✅ Deploy to static hosting (optional)

---

**Ready? Let's go!** 🚀

```bash
ng serve
```

Then open http://localhost:4200 and login!
