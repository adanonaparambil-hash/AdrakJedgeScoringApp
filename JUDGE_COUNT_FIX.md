# Judge Count Fix - View Judges Modal

## ✅ Issue Fixed

### Problem
In the "View Judges" modal, the counts were incorrect:
- **Total Judges** was showing only judges who scored that specific team
- Both counts were showing the same value (1)

### Solution
Updated the API to return comprehensive statistics:
- **Total Judges**: Count of ALL judges where ISADMIN = N (from Users sheet)
- **Submitted**: Count of judges who scored this team AND have SUBMITTED = Y

## 🔧 Changes Made

### 1. New Interface in API Service
**File**: `src/app/core/api.service.ts`

Added new interface:
```typescript
export interface TeamJudgeScoresResponse {
  scores: JudgeScore[];
  totalNonAdminJudges: number;  // Total count of ISADMIN = N from Users sheet
  submittedCount: number;        // Count of judges who scored this team with SUBMITTED = Y
}
```

### 2. Updated getTeamJudgeScores Method
**File**: `src/app/core/api.service.ts`

Now returns:
- `scores`: Array of judge scores for this team
- `totalNonAdminJudges`: Total count of all non-admin judges (ISADMIN = N)
- `submittedCount`: Count of judges who scored this team and have SUBMITTED = Y

**Logic**:
```typescript
// Count ALL non-admin judges from Users sheet
userRows.forEach(u => {
  const isAdmin = (u.ISADMIN || 'N').toUpperCase() === 'Y';
  if (!isAdmin) {
    totalNonAdminJudges++;  // Count all ISADMIN = N
  }
});

// Count submitted judges who scored this team
const submittedCount = judgeScores.filter(j => j.submitted).length;
```

### 3. Updated Leaderboard Component
**File**: `src/app/features/leaderboard/leaderboard.component.ts`

Added properties:
```typescript
totalNonAdminJudges = 0;
submittedJudgesCount = 0;
```

Updated methods:
```typescript
viewTeamScores(team: string): void {
  this.api.getTeamJudgeScores(team).subscribe(response => {
    this.teamJudgeScores = response.scores;
    this.totalNonAdminJudges = response.totalNonAdminJudges;
    this.submittedJudgesCount = response.submittedCount;
  });
}

getNonAdminCount(): number {
  return this.totalNonAdminJudges;  // Returns total from Users sheet
}

getSubmittedCount(): number {
  return this.submittedJudgesCount;  // Returns submitted count for this team
}
```

## 📊 How It Works

### Example Scenario

**Users Sheet**:
```
USERID  | NAME        | SUBMITTED | ISADMIN
judge1  | John Doe    | Y         | N
judge2  | Jane Smith  | Y         | N
judge3  | Bob Wilson  | N         | N
admin1  | Admin User  | Y         | Y
```

**Evaluations Sheet (Blue Team)**:
```
Team | Judge      | Score
Blue | John Doe   | 100
Blue | Jane Smith | 90
```

**When admin clicks "View Judges" for Blue Team**:

Modal shows:
- **Judge List**: John Doe (100), Jane Smith (90)
- **Total Judges**: 3 (count of judge1, judge2, judge3 where ISADMIN = N)
- **Submitted**: 2 (John Doe and Jane Smith have SUBMITTED = Y)

### Calculation Details

**Total Judges**:
- Counts ALL users where ISADMIN = N
- Does NOT check if they scored this team
- Does NOT check SUBMITTED status
- Formula: `COUNT(ISADMIN = N)`

**Submitted**:
- Counts judges who scored this team
- AND have SUBMITTED = Y in Users sheet
- Formula: `COUNT(judges who scored this team AND SUBMITTED = Y)`

## 🎯 Expected Behavior

### Modal Summary Section

```
┌─────────────────────────────────────┐
│  Total Judges        Submitted      │
│      3                   2           │
│  (ISADMIN=N)      (SUBMITTED=Y)     │
└─────────────────────────────────────┘
```

**Total Judges (3)**:
- All judges in Users sheet where ISADMIN = N
- Regardless of whether they scored this team
- Regardless of submission status

**Submitted (2)**:
- Judges who scored this specific team
- AND have SUBMITTED = Y in Users sheet

## ✅ Verification

### Test Case 1: Team with All Judges
If all 3 non-admin judges scored the team and all submitted:
- Total Judges: 3
- Submitted: 3

### Test Case 2: Team with Partial Scores
If only 2 judges scored the team, both submitted:
- Total Judges: 3 (still shows all non-admin judges)
- Submitted: 2

### Test Case 3: Team with Unsubmitted Scores
If 2 judges scored the team, but only 1 submitted:
- Total Judges: 3
- Submitted: 1

### Test Case 4: Team with No Scores
If no judges scored the team yet:
- Total Judges: 3 (still shows all non-admin judges)
- Submitted: 0

## 🐛 Troubleshooting

### Issue: Total Judges shows 0
**Cause**: No users with ISADMIN = N in Users sheet

**Solution**: 
1. Check Users Sheet
2. Ensure some users have ISADMIN = N
3. Verify column name is exactly "ISADMIN"

### Issue: Submitted shows 0 but judges scored
**Cause**: Judges have SUBMITTED = N in Users sheet

**Solution**:
1. Check Users Sheet
2. Update SUBMITTED column to Y for judges who submitted
3. Verify column name is exactly "SUBMITTED"

### Issue: Counts don't match expectations
**Check**:
1. Open browser console (F12)
2. Click "View Judges"
3. Check API response in Network tab
4. Verify totalNonAdminJudges and submittedCount values

## 📝 Summary

**Before**:
- Total Judges: Showed only judges who scored this team
- Both counts were the same

**After**:
- Total Judges: Shows ALL non-admin judges (ISADMIN = N)
- Submitted: Shows judges who scored this team with SUBMITTED = Y
- Counts are now independent and correct

The modal now provides accurate statistics for admins to understand:
1. How many total judges exist in the system
2. How many judges have submitted evaluations for this specific team
