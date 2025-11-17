# Admin Features Update

## ✅ Changes Implemented

### 1. Admin Auto-Redirect to Leaderboard
**File**: `src/app/features/home/home.component.ts`

- Admins (ISADMIN = Y) are now automatically redirected to the leaderboard page upon login
- They skip the scoring/home page entirely
- Regular judges still see the home page with team scoring options

### 2. Leaderboard Calculation Update
**File**: `src/app/core/api.service.ts`

**Previous Behavior**:
- Leaderboard calculated average based on ALL judges (including admins)

**New Behavior**:
- Leaderboard now **only counts non-admin judges** (ISADMIN = N)
- Average is calculated as: `Total Score / Number of Submitted Non-Admin Judges`
- Admin scores are excluded from team rankings
- This ensures fair competition based only on actual judge evaluations

### 3. Individual Judge Scores View
**Files**: 
- `src/app/core/api.service.ts` - New method `getTeamJudgeScores()`
- `src/app/features/leaderboard/leaderboard.component.ts` - UI implementation

**Features**:
- Each team in the leaderboard now has a "View Judges" button
- Clicking opens a modal showing all individual judge scores for that team
- Judge list displays:
  - Judge name
  - Individual score (out of 120)
  - Admin badge (if ISADMIN = Y)
  - Submission status (✓ Submitted or Not submitted)
  - Rank order (sorted by score, highest first)

**Modal Summary Stats**:
- Total Judges: All judges who scored this team
- Non-Admin: Count of regular judges (ISADMIN = N)
- Submitted: Count of judges who submitted their evaluations

## 🎯 User Experience

### For Admins (ISADMIN = Y)
1. Login with admin credentials
2. **Automatically redirected to leaderboard** (no home page)
3. See real-time team rankings
4. Click "View Judges" on any team to see individual scores
5. View detailed breakdown of who scored what

### For Judges (ISADMIN = N)
1. Login with judge credentials
2. See home page with teams to score
3. Submit evaluations
4. Cannot access leaderboard (admin only)

## 📊 Leaderboard Logic

### Calculation Example

**Users Sheet**:
```
USERID  | NAME        | SUBMITTED | ISADMIN
judge1  | John Doe    | Y         | N
judge2  | Jane Smith  | Y         | N
admin1  | Admin User  | Y         | Y
judge3  | Bob Wilson  | N         | N
```

**Evaluations Sheet** (Blue Team):
```
Team | Judge      | Total Score
Blue | John Doe   | 100
Blue | Jane Smith | 90
Blue | Admin User | 110  ← EXCLUDED from average
Blue | Bob Wilson | 80   ← Not submitted, excluded
```

**Leaderboard Calculation**:
- Only counts: John Doe (100) + Jane Smith (90)
- Average: (100 + 90) / 2 = **95**
- Admin User's score (110) is NOT included
- Bob Wilson's score (80) is NOT included (not submitted)

## 🔧 Technical Details

### New API Method
```typescript
getTeamJudgeScores(teamName: string): Observable<JudgeScore[]>
```

Returns array of:
```typescript
interface JudgeScore {
  judgeName: string;
  score: number;
  submitted: boolean;
  isAdmin: boolean;
}
```

### Updated API Method
```typescript
getLeaderboard(): Observable<LeaderboardEntry[]>
```

Now filters to only include non-admin judges in calculations.

## 📱 UI Features

### Leaderboard Page
- Real-time updates every 3 seconds
- Podium display for top 3 teams
- Detailed rankings list
- **NEW**: "View Judges" button on each team
- **NEW**: Individual judge scores modal

### Judge Scores Modal
- Clean, modern design
- Scrollable list of judges
- Color-coded badges:
  - Gold badge for admins
  - Green checkmark for submitted
  - Red text for not submitted
- Summary statistics at bottom
- Click outside or X button to close

## 🎨 Visual Indicators

### In Judge List
- **Admin**: Gold badge with "ADMIN" label
- **Submitted**: Green badge with "✓ Submitted"
- **Not Submitted**: Red text "• Not submitted"

### In Summary
- **Total Judges**: Gold color
- **Non-Admin**: Green color
- **Submitted**: Blue color

## ✅ Testing Checklist

- [ ] Admin login redirects to leaderboard
- [ ] Judge login shows home page
- [ ] Leaderboard excludes admin scores
- [ ] "View Judges" button appears on each team
- [ ] Modal opens with correct judge scores
- [ ] Admin judges show gold badge
- [ ] Submitted status displays correctly
- [ ] Summary stats are accurate
- [ ] Modal closes properly
- [ ] Responsive on mobile devices

## 🚀 Benefits

1. **Fair Competition**: Only actual judge scores count
2. **Transparency**: Admins can see individual judge scores
3. **Better UX**: Admins go straight to what they need
4. **Accountability**: Easy to see who submitted and who didn't
5. **Detailed Insights**: View performance by individual judge

## 📝 Notes

- Admin scores are still stored in the database
- Admins can still submit evaluations if needed
- The individual scores view is admin-only
- Regular judges cannot see the leaderboard or individual scores
- All changes are backward compatible with existing data
