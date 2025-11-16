# CGT Judge App - Authentication & Admin System Update

## 🎯 What Changed?

Your judging application has been updated with a new authentication system and admin/judge role management based on Google Sheets.

## 🔑 Key Changes

### 1. **Simplified Login - No Password Required!**
- Users now login with just their **User ID**
- Password field has been completely removed
- Authentication checks against Google Sheets Users table

### 2. **User Data from Google Sheets**
Your first Google Sheet now manages all users:
- **USERID**: Login identifier
- **NAME**: Full name (shown in app as "Hi, [NAME]!")
- **SUBMITTED**: Y/N flag for submission tracking
- **ISADMIN**: Y/N flag for admin privileges

### 3. **Admin vs Judge Roles**

#### Admins (ISADMIN = Y)
- ✅ Can view the **Leaderboard** with full rankings
- ✅ See how many judges have submitted (X/Y submitted)
- ✅ View all scores from all judges
- ❌ No submit button (admins don't submit evaluations)

#### Judges (ISADMIN = N)
- ❌ **Cannot** view the Leaderboard (shows "Access Denied")
- ✅ Can only see their own scores
- ✅ Have a **Submit** button on Home page
- ✅ After submitting, see confirmation message

### 4. **Submission System**
- Judges click "Submit My Evaluation" when done scoring
- System marks them as submitted
- Only submitted judges count in leaderboard calculations
- Formula: `Team Average = Total Score / Number of Submitted Judges`

### 5. **Leaderboard Calculation**
- Only counts scores from judges where **SUBMITTED = Y**
- Shows submission statistics: "3/5 submitted"
- Updates in real-time (every 3 seconds)
- Admin-only access

## 📋 Google Sheets Structure

### Sheet 1: Users (Your First URL)
```
https://docs.google.com/spreadsheets/d/1iKFh699K_TapsbUG539bvUG7rYvNN0eA/edit?gid=1017169916
```

**Columns:**
```
USERID    | NAME              | SUBMITTED | ISADMIN
judge1    | Ahmed Al-Mansouri | N         | N
judge2    | Fatima Hassan     | N         | N
admin1    | Admin User        | N         | Y
```

### Sheet 2: Evaluations (Your Second URL)
```
https://docs.google.com/spreadsheets/d/1e8_bLRJqe6m9vAnc6Jmx6pam1NoJT6nI/edit?gid=1688314091
```

**Columns:** Team Name, Judge Name, + 12 scoring criteria (unchanged)

## 🚀 How to Use

### Setup (One-time)
1. Add users to Sheet 1 with columns: USERID, NAME, SUBMITTED, ISADMIN
2. Set SUBMITTED = N for all users initially
3. Set ISADMIN = Y for admins, N for judges
4. Make both sheets publicly viewable (Share > Anyone with link can view)

### For Admins
1. Login with your USERID (no password)
2. View all scores on Home page
3. Access Leaderboard to see rankings
4. Monitor who has submitted

### For Judges
1. Login with your USERID (no password)
2. Score teams on Scoring page
3. View your scores on Home page
4. Click "Submit My Evaluation" when done
5. Leaderboard is not accessible (admin only)

## 📱 UI Changes

### Login Screen
- **Before**: Username + Password fields
- **After**: Only User ID field
- Cleaner, simpler interface

### Home Page
- Shows "Hi, [Your Name]!" instead of username
- Displays your role (Admin/Judge)
- Shows submission status
- Submit button for judges (before submission)
- Confirmation message after submission

### Leaderboard
- **Admins**: Full access with submission stats
- **Judges**: "Access Denied" message
- Shows "X/Y submitted" for each team

### Profile Page
- Displays your full name
- Shows your User ID
- Role badge (Admin 👑 or Judge 🎯)
- Submission status badge

## 🔧 Technical Details

### Modified Files
- `server/index.js` - Updated authentication and leaderboard logic
- `src/app/core/api.service.ts` - New login interface
- `src/app/features/login/login.component.ts` - Removed password
- `src/app/features/home/home.component.ts` - Added submit button
- `src/app/features/leaderboard/leaderboard.component.ts` - Admin-only access
- `src/app/features/profile/profile.component.ts` - Show user info
- `src/app/features/scoring/scoring.component.ts` - Show user name

### New API Endpoints
- `POST /api/login` - Username-only authentication
- `POST /api/submit-evaluation` - Mark user as submitted
- `GET /api/leaderboard` - Returns scores with submission stats

### LocalStorage Keys
- `token` - Authentication token
- `userId` - User's ID
- `userName` - User's full name
- `isAdmin` - Admin status (true/false)
- `submitted` - Submission status (true/false)

## ⚠️ Important Notes

### Current Limitation
The submit button currently acknowledges the submission but doesn't automatically update the Google Sheet. To mark a user as submitted:

**Option 1: Manual (Current)**
1. Open Users Sheet
2. Find the user's row
3. Change SUBMITTED from N to Y

**Option 2: Automatic (Future)**
- Requires Google Sheets API setup with service account
- See `AUTHENTICATION_UPDATE.md` for instructions

### Security
- This is a simplified authentication system
- Suitable for internal/controlled environments
- No passwords = easier access but less secure
- Consider adding passwords for production use

## 📚 Documentation

Four new documentation files have been created:

1. **QUICK_START.md** - Get started in 5 minutes
2. **GOOGLE_SHEETS_TEMPLATE.md** - Sheet setup guide
3. **AUTHENTICATION_UPDATE.md** - Complete technical details
4. **IMPLEMENTATION_SUMMARY.md** - What was changed

## ✅ Testing Checklist

Before using in production:
- [ ] Add all users to Users Sheet
- [ ] Set correct ISADMIN values
- [ ] Test admin login and leaderboard access
- [ ] Test judge login and submit button
- [ ] Verify leaderboard calculations
- [ ] Test submission workflow
- [ ] Verify "Access Denied" for judges

## 🎉 Benefits

1. **Simpler Login**: No passwords to remember
2. **Clear Roles**: Admins and judges have different views
3. **Submission Tracking**: Know who has submitted
4. **Fair Scoring**: Only submitted judges count in averages
5. **Easy Management**: All user data in one Google Sheet
6. **Real-time Updates**: Leaderboard updates automatically

## 🆘 Need Help?

1. **Quick Start**: Read `QUICK_START.md`
2. **Sheet Setup**: Read `GOOGLE_SHEETS_TEMPLATE.md`
3. **Technical Details**: Read `AUTHENTICATION_UPDATE.md`
4. **What Changed**: Read `IMPLEMENTATION_SUMMARY.md`

## 🔄 Migration from Old System

If you were using the old system with passwords:

1. **Users Sheet**: Add SUBMITTED and ISADMIN columns
2. **Set Defaults**: SUBMITTED = N, ISADMIN = N for all
3. **Identify Admins**: Change ISADMIN to Y for admin users
4. **Remove Passwords**: Password column no longer needed
5. **Test**: Login with USERID only

## 📞 Support

Common issues and solutions:

**"User not found"**
→ Check USERID exists in Users Sheet

**"Access Denied" on Leaderboard**
→ Normal for judges, only admins can view

**Submit button not showing**
→ Check you're logged in as judge (not admin)

**Leaderboard not updating**
→ Verify SUBMITTED = Y in Users Sheet

## 🎊 You're All Set!

Your judging application now has:
- ✅ Simplified authentication
- ✅ Role-based access control
- ✅ Submission tracking
- ✅ Fair leaderboard calculations
- ✅ Better user experience

Start by adding your users to the Users Sheet and you're ready to go! 🚀
