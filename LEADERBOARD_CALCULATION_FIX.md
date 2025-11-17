# Leaderboard Calculation Fix

## ✅ Issue Fixed

### Problem
The leaderboard calculation was including scores from judges who had NOT submitted (SUBMITTED = N), causing incorrect averages.

### Correct Formula
```
Average = Total SUM of all scores / Count of (ISADMIN = N AND SUBMITTED = Y)
```

## 🔧 Changes Made

### Before (Incorrect)
```typescript
// Added ALL non-admin judges' scores to sum
if (!nonAdminJudges.has(judge)) return;  // Only checked ISADMIN = N

current.sum += total;  // Added score regardless of SUBMITTED status
current.count += 1;
if (submittedNonAdminJudges.has(judge)) {
  current.submittedCount += 1;  // Only counted submitted separately
}
```

**Problem**: 
- Sum included scores from judges with SUBMITTED = N
- Division used submittedCount (correct)
- Result: Numerator too large, average inflated

### After (Correct)
```typescript
// Only add scores from submitted non-admin judges
if (!nonAdminJudges.has(judge)) return;  // Check ISADMIN = N
if (!submittedNonAdminJudges.has(judge)) return;  // Check SUBMITTED = Y

current.sum += total;  // Only add if BOTH conditions met
current.count += 1;
current.submittedCount += 1;
```

**Solution**:
- Sum ONLY includes scores from judges with ISADMIN = N AND SUBMITTED = Y
- Division uses count (which equals submittedCount)
- Result: Correct average

## 📊 Example Calculation

### Scenario
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
Blue | Bob Wilson | 80
Blue | Admin User | 110
```

### Before (Incorrect)
```
Sum = 100 + 90 + 80 = 270  (included Bob Wilson who has SUBMITTED = N)
Count = 2  (only John and Jane have SUBMITTED = Y)
Average = 270 / 2 = 135  ❌ WRONG!
```

### After (Correct)
```
Sum = 100 + 90 = 190  (only John and Jane with SUBMITTED = Y)
Count = 2  (only John and Jane)
Average = 190 / 2 = 95  ✅ CORRECT!
```

### Excluded Scores
- **Bob Wilson (80)**: ISADMIN = N but SUBMITTED = N ❌ Excluded
- **Admin User (110)**: ISADMIN = Y ❌ Excluded

## 🎯 Logic Flow

### Step 1: Identify Eligible Judges
```typescript
submittedNonAdminJudges = judges where:
  - ISADMIN = N (not admin)
  - SUBMITTED = Y (submitted evaluation)
```

### Step 2: Process Scores
```typescript
For each evaluation in sheet:
  1. Check if judge is non-admin (ISADMIN = N)
  2. Check if judge has submitted (SUBMITTED = Y)
  3. If BOTH true: Add score to sum and increment count
  4. If either false: Skip this score
```

### Step 3: Calculate Average
```typescript
For each team:
  average = sum / count
  where:
    sum = total of all scores from eligible judges
    count = number of eligible judges who scored this team
```

## ✅ Verification

### Test Case 1: All Judges Submitted
**Setup**:
- 3 judges (ISADMIN = N)
- All have SUBMITTED = Y
- Scores: 100, 90, 80

**Expected**:
- Sum: 270
- Count: 3
- Average: 90

### Test Case 2: Some Judges Not Submitted
**Setup**:
- 3 judges (ISADMIN = N)
- 2 have SUBMITTED = Y (scores: 100, 90)
- 1 has SUBMITTED = N (score: 80)

**Expected**:
- Sum: 190 (only 100 + 90)
- Count: 2
- Average: 95

### Test Case 3: Admin Scores Excluded
**Setup**:
- 2 judges (ISADMIN = N, SUBMITTED = Y, scores: 100, 90)
- 1 admin (ISADMIN = Y, SUBMITTED = Y, score: 110)

**Expected**:
- Sum: 190 (only 100 + 90, admin excluded)
- Count: 2
- Average: 95

### Test Case 4: Mixed Scenario
**Setup**:
- Judge1: ISADMIN = N, SUBMITTED = Y, score: 100 ✅
- Judge2: ISADMIN = N, SUBMITTED = Y, score: 90 ✅
- Judge3: ISADMIN = N, SUBMITTED = N, score: 80 ❌
- Admin: ISADMIN = Y, SUBMITTED = Y, score: 110 ❌

**Expected**:
- Sum: 190
- Count: 2
- Average: 95

## 🔍 How to Verify

### Method 1: Manual Calculation
1. Open Evaluations Sheet
2. For each team, list judges who scored
3. Check Users Sheet for each judge:
   - ISADMIN = N? ✅
   - SUBMITTED = Y? ✅
4. Sum only scores where BOTH are true
5. Divide by count of eligible judges
6. Compare with leaderboard

### Method 2: Console Logging
Add to code:
```typescript
console.log('Team:', team);
console.log('Eligible judges:', submittedNonAdminJudges);
console.log('Sum:', data.sum);
console.log('Count:', data.count);
console.log('Average:', data.sum / data.count);
```

## 📝 Summary

### What Changed
- **Before**: Included ALL non-admin scores, divided by submitted count
- **After**: Include ONLY submitted non-admin scores, divide by that count

### Why It Matters
- Ensures fair competition
- Only counts judges who completed their evaluation
- Excludes incomplete/draft scores
- Excludes admin scores

### Formula
```
Average = SUM(scores where ISADMIN = N AND SUBMITTED = Y) 
          / COUNT(judges where ISADMIN = N AND SUBMITTED = Y)
```

This is now the correct calculation! ✅
