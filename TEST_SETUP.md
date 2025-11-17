# Testing the Google Sheets Integration

## Quick Test Steps

### 1. Verify Service Account File
```bash
# Check if the file exists
dir service-account-key.json
```
✅ Should show the file exists (already confirmed)

### 2. Start the Backend Server
```bash
npm run server
```

**Expected Output:**
```
Server listening on http://localhost:3000
Google Sheets integration enabled
Users Sheet: https://docs.google.com/spreadsheets/d/1jLyGbkHE_fopA1QwYHsvezRZeNBu4ylXTiVQol0QNDQ
Evaluation Sheet: https://docs.google.com/spreadsheets/d/1aYLnFkq969TOuQ2b0hY6jS2neCf5CHeV-En78QmARf4
✅ Google Sheets write access enabled
Cache initialized with X evaluations from Google Sheet
```

### 3. Test Backend Endpoints

**Test Health Check:**
```bash
curl http://localhost:3000/api/health
```
Expected: `{"ok":true}`

**Test Users Data:**
```bash
curl http://localhost:3000/api/debug/users-data
```
Expected: JSON with user data from your sheet

**Test Login:**
```bash
curl -X POST http://localhost:3000/api/login -H "Content-Type: application/json" -d "{\"username\":\"YOUR_USERID\"}"
```
Replace `YOUR_USERID` with an actual user ID from your Users sheet

### 4. Start the Angular App
```bash
npm start
```

Navigate to http://localhost:4200

### 5. Test the Full Flow

1. **Login Page**
   - Enter a valid USERID from your Users sheet
   - Should successfully log in

2. **Scoring Page**
   - Select a team
   - Enter scores (0-10) for each criterion
   - Click "Save Progress" - should save to cache
   - Repeat for all teams

3. **Submit**
   - Click "Submit All Evaluations"
   - Should write to Google Sheets
   - User's SUBMITTED column should be marked as 'Y'

4. **Leaderboard**
   - Should show team averages
   - Only counts submitted judges

5. **Profile**
   - Should show submission status

## Troubleshooting

### Issue: "Google Sheets read-only mode"
**Cause:** Service account file not found or invalid
**Fix:** Verify `service-account-key.json` exists and has correct permissions

### Issue: "Failed to submit"
**Cause:** Backend server not running
**Fix:** Make sure `npm run server` is running in a separate terminal

### Issue: "User not found"
**Cause:** USERID doesn't exist in Users sheet
**Fix:** Check the Users sheet and use exact USERID (case-insensitive)

### Issue: CORS errors
**Cause:** Backend server not running or wrong URL
**Fix:** Ensure backend is on http://localhost:3000

## Verify Google Sheets Access

### Users Sheet Structure
Should have these columns:
- USERID
- NAME
- SUBMITTED (Y/N)
- ISADMIN (Y/N)

### Evaluation Sheet Structure
Should have these columns:
- Team Name
- Judge Name
- Reflects Creativity and Innovation
- Demonstrates clear thought
- Clearly representation of the Concept
- Visually appealing
- Distinctive and Memorable
- Relevance to Theme
- Audience Appeal
- Creativity
- Overall Creativity
- Integration of Logo and Music
- How clearly the content is presented
- How synced the presentation with Logo and Theme Music

## Success Indicators

✅ Backend server starts without errors
✅ "Google Sheets write access enabled" message appears
✅ Can log in with valid USERID
✅ Can save evaluations
✅ Can submit all evaluations
✅ Leaderboard shows data
✅ Data persists in Google Sheets
