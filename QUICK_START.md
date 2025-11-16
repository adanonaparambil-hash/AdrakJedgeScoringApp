# Quick Start Guide - CGT Judge App

## 🚀 Get Started in 5 Minutes

### Step 1: Prepare Google Sheets (2 minutes)

#### Users Sheet
1. Open: https://docs.google.com/spreadsheets/d/1iKFh699K_TapsbUG539bvUG7rYvNN0eA/edit?gid=1017169916
2. Add these columns in Row 1: `USERID | NAME | SUBMITTED | ISADMIN`
3. Add sample users:
```
USERID    | NAME          | SUBMITTED | ISADMIN
admin     | Admin User    | N         | Y
judge1    | Judge One     | N         | N
judge2    | Judge Two     | N         | N
```
4. Share > Anyone with link can view

#### Evaluation Sheet
1. Open: https://docs.google.com/spreadsheets/d/1e8_bLRJqe6m9vAnc6Jmx6pam1NoJT6nI/edit?gid=1688314091
2. Verify columns exist (Team Name, Judge Name, + 12 criteria)
3. Share > Anyone with link can view

### Step 2: Start the Server (1 minute)

```bash
cd server
npm install  # First time only
node index.js
```

You should see:
```
Server listening on http://localhost:3000
Google Sheets integration enabled
```

### Step 3: Start the App (1 minute)

```bash
# In project root
npm install  # First time only
ng serve
```

Open browser: http://localhost:4200

### Step 4: Test Login (1 minute)

#### Test as Admin:
1. Enter USERID: `admin`
2. Click "Sign In"
3. You should see: "Hi, Admin User!"
4. Navigate to Leaderboard tab ✅ (should work)

#### Test as Judge:
1. Logout (Profile > Logout)
2. Enter USERID: `judge1`
3. Click "Sign In"
4. You should see: "Hi, Judge One!"
5. Navigate to Leaderboard tab ❌ (should show "Access Denied")
6. Go to Home > Click "Submit My Evaluation" ✅

## 🎯 Key Features

### Login (No Password!)
- Just enter your USERID
- System checks Google Sheets
- Instant access

### For Admins (ISADMIN = Y)
- ✅ View Leaderboard
- ✅ See all scores
- ✅ Monitor submissions
- ❌ No submit button

### For Judges (ISADMIN = N)
- ✅ Score teams
- ✅ View own scores
- ✅ Submit evaluation
- ❌ Cannot view leaderboard

## 📱 Navigation

### Home Tab
- Welcome message with your name
- Team cards with your scores
- Submit button (judges only)
- Quick statistics

### Scoring Tab
- Select team to score
- 3 sections: Logo, Music, Presentation
- Auto-save as you score
- Total out of 120 points

### Leaderboard Tab
- Admin only
- Live rankings
- Submission statistics
- Updates every 3 seconds

### Profile Tab
- Your name and ID
- Role badge (Admin/Judge)
- Submission status
- Logout button

## 🔧 Troubleshooting

### "User not found"
- Check USERID spelling
- Verify it exists in Users Sheet
- Make sure sheet is publicly viewable

### Leaderboard shows "Access Denied"
- This is normal for judges
- Only admins (ISADMIN = Y) can view
- Check your role in Profile tab

### Submit button not showing
- Make sure you're logged in as judge (not admin)
- Check you haven't already submitted
- Refresh the page

### Server won't start
```bash
cd server
npm install
node index.js
```

### App won't start
```bash
npm install
ng serve
```

## 📊 Sample Test Data

### Add to Users Sheet:
```
USERID    | NAME              | SUBMITTED | ISADMIN
admin     | Admin User        | N         | Y
judge1    | Ahmed Al-Mansouri | N         | N
judge2    | Fatima Hassan     | N         | N
judge3    | Mohammed Ali      | Y         | N
```

### Test Scenarios:
1. Login as `admin` → Can view leaderboard
2. Login as `judge1` → Cannot view leaderboard, can submit
3. Login as `judge3` → Shows "Submitted" badge

## 🎨 Scoring Guide

### Section A: Logo (50 points)
- Creativity and Innovation (10)
- Clear thought (10)
- Concept representation (10)
- Visual appeal (10)
- Distinctive and Memorable (10)

### Section B: Music (30 points)
- Relevance to Theme (10)
- Audience Appeal (10)
- Creativity (10)

### Section C: Presentation (40 points)
- Overall Creativity (10)
- Integration of Logo and Music (10)
- Content clarity (10)
- Synchronization (10)

**Total: 120 points**

## 💡 Tips

1. **Auto-save**: Scores save automatically as you slide
2. **Switch teams**: Use team selector at top
3. **Progress**: See completion percentage per team
4. **Submit**: Only submit when all teams are scored
5. **Admin view**: Admins see everyone's scores

## 📞 Need Help?

1. Check browser console (F12) for errors
2. Verify Google Sheets are accessible
3. Check server is running (http://localhost:3000/api/health)
4. Review AUTHENTICATION_UPDATE.md for details
5. Check GOOGLE_SHEETS_TEMPLATE.md for sheet setup

## ✅ Checklist

Before going live:
- [ ] Users Sheet has all judges
- [ ] Evaluation Sheet is accessible
- [ ] Server is running
- [ ] App is running
- [ ] Test admin login
- [ ] Test judge login
- [ ] Test scoring
- [ ] Test submission
- [ ] Test leaderboard (admin)

## 🎉 You're Ready!

The app is now configured and ready to use. Happy judging! 🏆
