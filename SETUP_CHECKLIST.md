# ✅ Setup Checklist

Use this checklist to ensure everything is configured correctly.

## 1. Google Cloud Console Setup

- [ ] Project created: `adrakcgteventapp`
- [ ] Google Sheets API enabled
- [ ] Service account created: `adrakapiforjedgeapplication@adrakcgteventapp.iam.gserviceaccount.com`
- [ ] Service account key downloaded as `service-account-key.json`

## 2. Google Sheets Access

### Users Sheet
- [ ] Sheet ID: `1jLyGbkHE_fopA1QwYHsvezRZeNBu4ylXTiVQol0QNDQ`
- [ ] Service account email added as Editor
- [ ] Sheet named "Sheet1" exists
- [ ] Headers: `USERID | NAME | SUBMITTED | ISADMIN`
- [ ] At least one test user added

### Evaluations Sheet
- [ ] Sheet ID: `1aYLnFkq969TOuQ2b0hY6jS2neCf5CHeV-En78QmARf4`
- [ ] Service account email added as Editor
- [ ] Sheet named "Sheet1" exists
- [ ] Headers: `Team Name | Judge Name | [12 evaluation columns]`

## 3. Project Files

- [ ] `service-account-key.json` exists in project root
- [ ] `src/service-account-key.json` exists (copy of above)
- [ ] `node_modules/` folder exists (run `npm install` if not)
- [ ] `jsrsasign` package installed
- [ ] `@types/jsrsasign` package installed

## 4. Configuration Files

- [ ] `tsconfig.json` has `resolveJsonModule: true`
- [ ] `src/typings.d.ts` exists
- [ ] `.gitignore` includes `service-account-key.json`

## 5. Code Updates

- [ ] `src/app/core/api.service.ts` updated with new implementation
- [ ] No TypeScript errors (run `npm start` to check)

## 6. Testing

### Basic Tests
- [ ] App starts without errors: `npm start`
- [ ] Can access login page
- [ ] Can login with valid USERID
- [ ] Login fails with invalid USERID

### Functionality Tests
- [ ] Can view scoring page after login
- [ ] Can enter scores for a team
- [ ] Can navigate between teams
- [ ] Can submit evaluations
- [ ] Data appears in Evaluations Sheet
- [ ] SUBMITTED status updates in Users Sheet

### Admin Tests
- [ ] Admin user can access leaderboard
- [ ] Leaderboard shows correct averages
- [ ] Non-admin cannot access leaderboard

## 7. Verification Steps

### Step 1: Check Service Account Access
1. Open Users Sheet in browser
2. Click "Share" button
3. Verify `adrakapiforjedgeapplication@adrakcgteventapp.iam.gserviceaccount.com` is listed as Editor
4. Repeat for Evaluations Sheet

### Step 2: Test Authentication
1. Open browser console (F12)
2. Start the app: `npm start`
3. Login with a test user
4. Check console for "✅ Access token obtained successfully"
5. Should NOT see any errors

### Step 3: Test Data Write
1. Login as a judge
2. Enter scores for a team
3. Click "Submit All Evaluations"
4. Open Evaluations Sheet
5. Verify new row(s) added with your data
6. Open Users Sheet
7. Verify SUBMITTED column changed to "Y"

### Step 4: Test Data Read
1. Login as admin
2. Navigate to leaderboard
3. Verify teams and scores display
4. Check calculations are correct

## 8. Troubleshooting

If something doesn't work, check:

### Authentication Issues
- [ ] Service account email has access to sheets
- [ ] Google Sheets API is enabled
- [ ] `service-account-key.json` is valid JSON
- [ ] No CORS errors in console

### Data Issues
- [ ] Sheet names are exactly "Sheet1"
- [ ] Column headers match exactly
- [ ] Sheet IDs are correct
- [ ] Data types are correct (Y/N for boolean fields)

### App Issues
- [ ] All dependencies installed
- [ ] No TypeScript compilation errors
- [ ] Browser console shows no errors
- [ ] Network tab shows successful API calls

## 9. Common Errors and Solutions

### "Error getting access token"
**Solution**: Check service account credentials and API enablement

### "Error fetching sheet data"
**Solution**: Verify sheet IDs and service account access

### "Cannot find module '../service-account-key.json'"
**Solution**: Ensure file exists in `src/` folder

### "User not found"
**Solution**: Add user to Users Sheet with correct USERID

### CORS errors
**Solution**: Google Sheets API should allow CORS; if not, may need proxy

## 10. Ready to Use!

Once all items are checked:
- [ ] All setup items complete
- [ ] All tests passing
- [ ] No errors in console
- [ ] Data syncing with Google Sheets

**You're ready to use the application! 🎉**

## Need Help?

Refer to these documents:
- `QUICK_START.md` - Quick reference
- `GOOGLE_SHEETS_API_SETUP.md` - Detailed documentation
- `IMPLEMENTATION_SUMMARY.md` - Technical details
