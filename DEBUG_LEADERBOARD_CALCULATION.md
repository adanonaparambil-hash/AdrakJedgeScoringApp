# Debug Leaderboard Calculation

## 🔍 How to Debug

### Step 1: Open Browser Console
1. Press F12 to open Developer Tools
2. Go to Console tab
3. Clear the console

### Step 2: View Leaderboard
1. Login as admin
2. Navigate to leaderboard
3. Wait for data to load

### Step 3: Check Console Output

You should see detailed logs like this:

```
👥 Non-admin judges (ISADMIN=N): ["John Doe", "Jane Smith", "Bob Wilson"]
✅ Submitted non-admin judges (ISADMIN=N & SUBMITTED=Y): ["John Doe", "Jane Smith"]

✅ Adding John Doe score for Blue: 100
✅ Adding Jane Smith score for Blue: 90
⏭️ Skipping Bob Wilson for Blue - Not submitted
⏭️ Skipping Admin User for Blue - Admin

📊 Blue Team Calculation: {
  sum: 190,
  count: 2,
  average: 95,
  formula: "190 / 2 = 95"
}
```

## 📊 What to Check

### 1. Judge Identification
Look for:
```
👥 Non-admin judges (ISADMIN=N): [...]
✅ Submitted non-admin judges (ISADMIN=N & SUBMITTED=Y): [...]
```

**Verify**:
- All non-admin judges are listed
- Only submitted judges are in the second list
- Names match exactly with Evaluations Sheet

### 2. Score Processing
Look for:
```
✅ Adding [Judge Name] score for [Team]: [Score]
⏭️ Skipping [Judge Name] for [Team] - [Reason]
```

**Verify**:
- Each submitted judge's score is added
- Non-submitted judges are skipped
- Admin judges are skipped
- Scores match the Evaluations Sheet

### 3. Final Calculation
Look for:
```
📊 [Team] Team Calculation: {
  sum: [Total],
  count: [Number of judges],
  average: [Result],
  formula: "[sum] / [count] = [average]"
}
```

**Verify**:
- Sum = total of all added scores
- Count = number of submitted non-admin judges
- Average = sum / count

## 🐛 Common Issues

### Issue 1: Judge Names Don't Match
**Symptoms**:
```
⏭️ Skipping John Doe for Blue - Not submitted
```
But John Doe has SUBMITTED = Y in Users Sheet.

**Cause**: Name mismatch between Users Sheet and Evaluations Sheet

**Solution**:
1. Check Users Sheet - NAME column value
2. Check Evaluations Sheet - Judge Name column value
3. Ensure they match EXACTLY (case-sensitive, no extra spaces)

### Issue 2: All Judges Skipped
**Symptoms**:
```
⏭️ Skipping Judge1 for Blue - Not submitted
⏭️ Skipping Judge2 for Blue - Not submitted
```

**Cause**: SUBMITTED column not set to Y

**Solution**:
1. Open Users Sheet
2. Check SUBMITTED column
3. Change to "Y" for judges who submitted

### Issue 3: Wrong Sum
**Symptoms**:
```
📊 Blue Team Calculation: { sum: 270, count: 2, average: 135 }
```
But manually adding scores gives 190.

**Cause**: Including scores from non-submitted judges

**Solution**: Check the "Adding" logs to see which scores are being included.

### Issue 4: ISADMIN Undefined
**Symptoms**:
```
👥 Non-admin judges (ISADMIN=N): []
```

**Cause**: ISADMIN column not reading correctly

**Solution**: See earlier debug guides for ISADMIN column fix.

## 📝 Manual Verification

### Step 1: List Eligible Judges
From Users Sheet, find judges where:
- ISADMIN = N
- SUBMITTED = Y

Example:
```
Judge1: John Doe - ISADMIN=N, SUBMITTED=Y ✅
Judge2: Jane Smith - ISADMIN=N, SUBMITTED=Y ✅
Judge3: Bob Wilson - ISADMIN=N, SUBMITTED=N ❌
Admin: Admin User - ISADMIN=Y, SUBMITTED=Y ❌
```

Eligible: John Doe, Jane Smith

### Step 2: Get Scores from Evaluations Sheet
For Blue Team:
```
John Doe: 100
Jane Smith: 90
```

### Step 3: Calculate
```
Sum = 100 + 90 = 190
Count = 2
Average = 190 / 2 = 95
```

### Step 4: Compare with Leaderboard
Check if leaderboard shows 95 for Blue Team.

## 🔧 Quick Fix Checklist

If calculation is wrong:

- [ ] Check console logs for judge identification
- [ ] Verify judge names match between sheets
- [ ] Confirm SUBMITTED = Y for judges who submitted
- [ ] Confirm ISADMIN = N for judges
- [ ] Check that scores are being added correctly
- [ ] Verify sum and count in console logs
- [ ] Manually calculate and compare

## 📞 What to Share

If you need help, share:

1. **Console output** - Copy all logs
2. **Users Sheet data** - Screenshot or list of judges
3. **Evaluations Sheet data** - Scores for one team
4. **Expected vs Actual** - What you calculated vs what shows

Example:
```
Team: Blue
Expected: (100 + 90) / 2 = 95
Actual: Shows 135
Console shows: sum: 270, count: 2
```

This will help identify the exact issue!

## 🎯 Expected Console Output

For a correct calculation:

```
👥 Non-admin judges (ISADMIN=N): ["John Doe", "Jane Smith", "Bob Wilson"]
✅ Submitted non-admin judges (ISADMIN=N & SUBMITTED=Y): ["John Doe", "Jane Smith"]

Processing Blue Team:
✅ Adding John Doe score for Blue: 100
✅ Adding Jane Smith score for Blue: 90
⏭️ Skipping Bob Wilson for Blue - Not submitted

📊 Blue Team Calculation: {
  sum: 190,
  count: 2,
  average: 95,
  formula: "190 / 2 = 95"
}
```

The logs will show you EXACTLY what's being calculated!
