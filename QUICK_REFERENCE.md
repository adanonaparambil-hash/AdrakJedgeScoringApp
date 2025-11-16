# 📋 Quick Reference Card

## 🚀 Start the App

```bash
npm install    # First time only
ng serve       # Start app
```

Open: **http://localhost:4200**

---

## 📊 Google Sheets URLs

### Users Sheet
```
https://docs.google.com/spreadsheets/d/1iKFh699K_TapsbUG539bvUG7rYvNN0eA/edit?gid=1017169916
```

**Columns:** USERID | NAME | SUBMITTED | ISADMIN

### Evaluation Sheet
```
https://docs.google.com/spreadsheets/d/1e8_bLRJqe6m9vAnc6Jmx6pam1NoJT6nI/edit?gid=1688314091
```

**Columns:** Team Name | Judge Name | 12 Criteria

---

## 🔑 Test Users

| USERID | NAME | ISADMIN | Access |
|--------|------|---------|--------|
| admin | Admin User | Y | ✅ Leaderboard |
| judge1 | Judge One | N | ❌ Leaderboard |
| judge2 | Judge Two | N | ❌ Leaderboard |

---

## 🎯 Features

### Admin (ISADMIN = Y)
- ✅ View leaderboard
- ✅ See all scores
- ✅ Monitor submissions
- ❌ No submit button

### Judge (ISADMIN = N)
- ❌ Cannot view leaderboard
- ✅ Score teams
- ✅ View own scores
- ✅ Submit evaluation

---

## 📱 Navigation

| Tab | Admin | Judge |
|-----|-------|-------|
| Home | ✅ | ✅ |
| Scoring | ✅ | ✅ |
| Leaderboard | ✅ | ❌ |
| Profile | ✅ | ✅ |

---

## 🎨 Scoring

### Sections
- **Logo:** 50 points (5 criteria × 10)
- **Music:** 30 points (3 criteria × 10)
- **Presentation:** 40 points (4 criteria × 10)
- **Total:** 120 points

### Teams
- Blue 🔵
- Red 🔴
- Green 🟢

---

## 💾 Data Storage

| Data | Location | Persists |
|------|----------|----------|
| User Info | Google Sheets | ✅ |
| Scores | localStorage | ✅ |
| Session | localStorage | ✅ |
| Cache | Memory | ❌ |

---

## 🐛 Quick Fixes

### User not found
```
1. Check USERID in sheet
2. Verify sheet is public
3. Test CSV URL
```

### CORS Error
```
1. Make sheet publicly viewable
2. Share > Anyone with link > Viewer
```

### Scores not saving
```
1. Enable localStorage
2. Clear cache
3. Check console (F12)
```

---

## 📞 Documentation

| Need | Read |
|------|------|
| Quick start | START_HERE.md |
| Setup guide | NO_BACKEND_SETUP.md |
| Sheet setup | GOOGLE_SHEETS_TEMPLATE.md |
| All docs | DOCUMENTATION_INDEX.md |

---

## ⚡ Commands

```bash
# Development
ng serve

# Build
ng build --configuration production

# Test
ng test

# Lint
ng lint
```

---

## 🔐 Sheet Permissions

**Required:** Anyone with link can **VIEW**

**Steps:**
1. Open sheet
2. Click "Share"
3. Select "Anyone with the link"
4. Set to "Viewer"
5. Click "Done"

---

## 📊 CSV Export URLs

### Test in Browser

**Users:**
```
https://docs.google.com/spreadsheets/d/1iKFh699K_TapsbUG539bvUG7rYvNN0eA/export?format=csv&gid=1017169916
```

**Evaluations:**
```
https://docs.google.com/spreadsheets/d/1e8_bLRJqe6m9vAnc6Jmx6pam1NoJT6nI/export?format=csv&gid=1688314091
```

Should see CSV data.

---

## ✅ Pre-Launch Checklist

- [ ] Users Sheet configured
- [ ] Evaluation Sheet configured
- [ ] Sheets publicly viewable
- [ ] Test CSV URLs
- [ ] Test admin login
- [ ] Test judge login
- [ ] Test scoring
- [ ] Test submission
- [ ] Test leaderboard
- [ ] Clear cache
- [ ] Test incognito

---

## 🎊 That's All!

**No backend needed!**
**Just Angular + Google Sheets!**

Start with: **START_HERE.md** 🚀
