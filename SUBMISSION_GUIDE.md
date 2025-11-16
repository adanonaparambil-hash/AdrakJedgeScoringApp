# 📤 Submission Guide - Complete Implementation

## 🎯 Overview

The application now has a **complete submission system** that:
- ✅ Saves all scores to Google Sheets
- ✅ Marks user as SUBMITTED (Y) in Users Sheet
- ✅ Disables editing after submission
- ✅ Persists scores across tabs and sessions
- ✅ Shows submit button in Scoring page

---

## 🚀 How It Works

### 1. **Scoring Phase** (Before Submission)

```
Judge logs in
    ↓
Scores teams (Blue, Red, Green)
    ↓
Scores auto-save to localStorage
    ↓
Can switch between teams/tabs
    ↓
Values persist and show when returning
```

### 2. **Submission Phase**

```
Judge completes all scoring
    ↓
Clicks "Submit All Evaluations" button
    ↓
System saves all scores to Google Sheets
    ↓
Updates SUBMITTED column to Y
    ↓
Disables all sliders (read-only mode)
    ↓
Shows confirmation message
```

### 3. **After Submission**

```
Judge can view scores (read-only)
    ↓
Cannot edit any values
    ↓
Scores counted in leaderboard
    ↓
Admin sees submission status
```

---

## 📋 Features

### ✅ Submit Button Location

**Where:** Scoring page (bottom of page)

**When visible:**
- User is logged in
- User has NOT submitted yet
- Shows for all teams

**Button text:** "Submit All Evaluations"

### ✅ What Happens on Submit

1. **Validates all teams scored**
   - Checks if all teams have scores
   - Warns if some teams are missing
   - Allows submission anyway (with confirmation)

2. **Saves to Google Sheets**
   - Writes all team scores to Evaluation Sheet
   - One row per team (Team Name, Judge Name, 12 scores)
   - Updates existing rows or creates new ones

3. **Updates submission status**
   - Changes SUBMITTED from N to Y in Users Sheet
   - Marks user as submitted in localStorage
   - Updates UI to show submitted state

4. **Disables editing**
   - All sliders become disabled
   - Cursor changes to "not-allowed"
   - Opacity reduced to show disabled state
   - Values remain visible (read-only)

### ✅ Score Persistence

**Across tabs:**
- Open multiple tabs
- Score different teams in each tab
- Switch between tabs
- All values persist and show correctly

**Across sessions:**
- Close browser
- Reopen later
- Login again
- All scores still there

**After submission:**
- Scores locked in Google Sheets
- Cannot be changed
- Visible in read-only mode

---

## 🔧 Technical Implementation

### Frontend (Angular)

**api.service.ts:**
```typescript
submitEvaluation(userId, userName, allScores) {
  // Sends all team scores to backend
  // Returns success/failure message
}
```

**scoring.component.ts:**
```typescript
submitAllEvaluations() {
  // Collects all team scores
  // Validates completion
  // Calls API to submit
  // Updates UI on success
}
```

**Features:**
- Disabled sliders when submitted
- Submit button visibility control
- Confirmation messages
- Error handling

### Backend (Node.js)

**server/index.js:**
```javascript
app.post('/api/submit-all-evaluations', async (req, res) => {
  // Receives all evaluations
  // Writes to Google Sheets
  // Updates SUBMITTED column
  // Returns success status
});
```

**Features:**
- Batch write to Evaluation Sheet
- Update Users Sheet (SUBMITTED = Y)
- Error handling
- Cache management

---

## 📊 Google Sheets Updates

### Evaluation Sheet

**Before submission:**
```
Team Name | Judge Name | Score1 | Score2 | ... | Score12
(empty or partial data)
```

**After submission:**
```
Team Name | Judge Name | Score1 | Score2 | ... | Score12
Blue      | Judge One  | 8      | 9      | ... | 7
Red       | Judge One  | 7      | 8      | ... | 9
Green     | Judge One  | 9      | 7      | ... | 8
```

### Users Sheet

**Before submission:**
```
USERID | NAME      | SUBMITTED | ISADMIN
judge1 | Judge One | N         | N
```

**After submission:**
```
USERID | NAME      | SUBMITTED | ISADMIN
judge1 | Judge One | Y         | N
```

---

## 🎯 User Experience

### Judge Workflow

1. **Login**
   ```
   Enter User ID → Click Sign In
   ```

2. **Score Teams**
   ```
   Home → Select Blue Team → Score (0-120)
   Home → Select Red Team → Score (0-120)
   Home → Select Green Team → Score (0-120)
   ```

3. **Submit**
   ```
   Scoring page → Scroll to bottom
   → Click "Submit All Evaluations"
   → Confirm if prompted
   → See success message
   ```

4. **After Submission**
   ```
   ✅ Scores visible (read-only)
   ✅ Cannot edit anymore
   ✅ Counted in leaderboard
   ✅ Admin sees submission
   ```

### Admin Workflow

1. **Monitor Submissions**
   ```
   Leaderboard → See "X/Y submitted"
   ```

2. **View All Scores**
   ```
   Leaderboard → See team averages
   → Only submitted judges counted
   ```

---

## 🔐 Security & Validation

### Validation Checks

1. **Before submission:**
   - User must be logged in
   - User must not have submitted already
   - Warns if teams not fully scored

2. **During submission:**
   - Validates user ID and name
   - Checks all team data present
   - Verifies server connection

3. **After submission:**
   - Prevents re-submission
   - Disables all editing
   - Locks scores in sheet

### Error Handling

**Server not running:**
```
❌ Failed to submit evaluations.
Please make sure the server is running on http://localhost:3000
```

**Network error:**
```
❌ Failed to submit. Please check your connection and try again.
```

**Partial completion:**
```
⚠️ Not all teams have been scored.
Do you want to submit anyway?
[Yes] [No]
```

---

## 🚀 Setup Requirements

### 1. Start Backend Server

**Required for submission to work!**

```bash
cd server
npm install
node index.js
```

Server must be running on: `http://localhost:3000`

### 2. Google Sheets API (Optional)

**For automatic sheet updates:**

1. Create Google Cloud Project
2. Enable Google Sheets API
3. Create service account
4. Download credentials as `server/service-account-key.json`
5. Share sheets with service account email

**Without API:**
- Scores saved to cache
- Manual update required in sheet
- Still works, just not automatic

### 3. Start Angular App

```bash
ng serve
```

Open: `http://localhost:4200`

---

## 🧪 Testing

### Test Submission Flow

1. **Login as judge**
   ```
   User ID: judge1
   ```

2. **Score all teams**
   ```
   Blue: 95/120
   Red: 88/120
   Green: 92/120
   ```

3. **Submit**
   ```
   Scoring page → Submit All Evaluations
   → See success message
   ```

4. **Verify**
   ```
   ✅ Sliders disabled
   ✅ Submit button gone
   ✅ Confirmation shown
   ✅ Check Google Sheets
   ✅ SUBMITTED = Y
   ```

5. **Test read-only**
   ```
   Try to move sliders → Cannot move
   Try to edit → Disabled
   Values still visible → ✅
   ```

### Test Persistence

1. **Score in one tab**
   ```
   Tab 1: Score Blue team
   ```

2. **Open another tab**
   ```
   Tab 2: Login same user
   → See Blue team scores
   ```

3. **Score different team**
   ```
   Tab 2: Score Red team
   ```

4. **Switch back**
   ```
   Tab 1: Refresh or navigate
   → See both Blue and Red scores
   ```

---

## 🐛 Troubleshooting

### Submit Button Not Showing

**Check:**
- [ ] User is logged in
- [ ] User has NOT submitted (SUBMITTED = N)
- [ ] On Scoring page (not Home)
- [ ] Scroll to bottom of page

### Submission Fails

**Check:**
- [ ] Server is running (`node server/index.js`)
- [ ] Server on http://localhost:3000
- [ ] Check browser console (F12)
- [ ] Check server logs

### Scores Not Saving to Sheet

**Check:**
- [ ] Google Sheets API configured
- [ ] Service account credentials present
- [ ] Sheets shared with service account
- [ ] Check server logs for errors

**Workaround:**
- Scores saved to cache
- Manually copy to sheet
- Or set up API properly

### Sliders Not Disabled

**Check:**
- [ ] SUBMITTED = true in localStorage
- [ ] Refresh page
- [ ] Clear cache and login again

---

## 📞 Quick Reference

### Commands

```bash
# Start server (required for submission)
cd server
node index.js

# Start app
ng serve

# Check server health
curl http://localhost:3000/api/health
```

### URLs

**App:** http://localhost:4200
**Server:** http://localhost:3000
**Health:** http://localhost:3000/api/health

### localStorage Keys

```javascript
// Check submission status
localStorage.getItem('submitted')  // 'true' or 'false'

// Check user info
localStorage.getItem('userId')
localStorage.getItem('userName')
localStorage.getItem('isAdmin')
```

---

## ✅ Checklist

Before going live:
- [ ] Server running
- [ ] Google Sheets configured
- [ ] Test login
- [ ] Test scoring
- [ ] Test submission
- [ ] Test read-only mode
- [ ] Test persistence
- [ ] Test leaderboard
- [ ] Verify sheet updates

---

## 🎊 Summary

### What Works

✅ **Submit button in Scoring page**
✅ **Saves all scores to Google Sheets**
✅ **Updates SUBMITTED column to Y**
✅ **Disables editing after submission**
✅ **Persists across tabs/sessions**
✅ **Shows confirmation messages**
✅ **Read-only mode after submission**
✅ **Counts in leaderboard**

### Requirements

⚠️ **Backend server must be running**
⚠️ **Google Sheets API for auto-update (optional)**
⚠️ **Manual sheet update if no API**

---

**The submission system is now complete and ready to use!** 🚀
