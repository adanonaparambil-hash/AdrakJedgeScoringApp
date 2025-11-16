# Google Sheets Template Setup

## Users Sheet Template

### Sheet 1: Users (Login & Admin Management)
**Sheet ID:** `1iKFh699K_TapsbUG539bvUG7rYvNN0eA`
**GID:** `1017169916`

#### Column Headers (Row 1):
```
USERID | NAME | SUBMITTED | ISADMIN
```

#### Sample Data:
```
USERID    | NAME              | SUBMITTED | ISADMIN
----------|-------------------|-----------|--------
judge1    | Ahmed Al-Mansouri | N         | N
judge2    | Fatima Hassan     | N         | N
judge3    | Mohammed Ali      | N         | N
admin1    | Admin User        | N         | Y
admin2    | Super Admin       | N         | Y
```

#### Column Descriptions:

**USERID** (Required)
- Unique identifier for each user
- Used for login (no password required)
- Case-insensitive matching
- Examples: judge1, admin1, user123

**NAME** (Required)
- Full name of the user
- Displayed throughout the application
- Shown in welcome messages and profile
- Examples: "Ahmed Al-Mansouri", "Fatima Hassan"

**SUBMITTED** (Required)
- Y = User has submitted their evaluation
- N = User has not submitted yet (default)
- Used for leaderboard calculations
- Only submitted judges count in averages

**ISADMIN** (Required)
- Y = User is an administrator
- N = User is a regular judge (default)
- Admins can view leaderboard
- Regular judges cannot view leaderboard

---

## Evaluation Results Sheet Template

### Sheet 2: Evaluation Results
**Sheet ID:** `1e8_bLRJqe6m9vAnc6Jmx6pam1NoJT6nI`
**GID:** `1688314091`

#### Column Headers (Row 1):
```
Team Name | Judge Name | Reflects Creativity and Innovation | Demonstrates clear thought | Clearly representation of the Concept | Visually appealing | Distinctive and Memorable | Relevance to Theme | Audience Appeal | Creativity | Overall Creativity | Integration of Logo and Music | How clearly the content is presented | How synced the presentation with Logo and Theme Music
```

#### Sample Data:
```
Team Name | Judge Name         | Reflects... | Demonstrates... | Clearly... | Visually... | Distinctive... | Relevance... | Audience... | Creativity | Overall... | Integration... | How clearly... | How synced...
----------|-------------------|-------------|-----------------|------------|-------------|----------------|--------------|-------------|------------|------------|----------------|----------------|---------------
Blue      | Ahmed Al-Mansouri | 8           | 9               | 7          | 8           | 9              | 8            | 7           | 9          | 8          | 9              | 8              | 7
Red       | Ahmed Al-Mansouri | 7           | 8               | 8          | 9           | 7              | 9            | 8           | 8          | 9          | 8              | 9              | 8
Green     | Ahmed Al-Mansouri | 9           | 7               | 9          | 7           | 8              | 7            | 9           | 7          | 7          | 8              | 7              | 9
Blue      | Fatima Hassan     | 9           | 8               | 8          | 9           | 8              | 9            | 8           | 9          | 9          | 8              | 9              | 8
```

#### Scoring Criteria:

**Section A: Logo Evaluation (50 points total)**
1. Reflects Creativity and Innovation (0-10)
2. Demonstrates clear thought (0-10)
3. Clearly representation of the Concept (0-10)
4. Visually appealing (0-10)
5. Distinctive and Memorable (0-10)

**Section B: Theme Music Evaluation (30 points total)**
6. Relevance to Theme (0-10)
7. Audience Appeal (0-10)
8. Creativity (0-10)

**Section C: Presentation Evaluation (40 points total)**
9. Overall Creativity (0-10)
10. Integration of Logo and Music (0-10)
11. How clearly the content is presented (0-10)
12. How synced the presentation with Logo and Theme Music (0-10)

**Total Possible Score: 120 points**

---

## Setup Instructions

### Step 1: Create Users Sheet

1. Open Google Sheets
2. Create a new spreadsheet or use existing one
3. Name it "CGT Judge - Users"
4. Add column headers in Row 1: `USERID`, `NAME`, `SUBMITTED`, `ISADMIN`
5. Add your users starting from Row 2
6. Set default values:
   - SUBMITTED = N (for all new users)
   - ISADMIN = N (for judges), Y (for admins)

### Step 2: Create Evaluation Results Sheet

1. Create a new spreadsheet or use existing one
2. Name it "CGT Judge - Evaluations"
3. Add all 14 column headers in Row 1 (see template above)
4. Leave data rows empty (will be populated by the app)

### Step 3: Share Sheets Publicly

For both sheets:
1. Click "Share" button (top right)
2. Click "Change to anyone with the link"
3. Set permission to "Viewer"
4. Click "Done"
5. Copy the sheet URL

### Step 4: Extract Sheet IDs

From the URL: `https://docs.google.com/spreadsheets/d/SHEET_ID/edit?gid=GID#gid=GID`

- **SHEET_ID**: The long string after `/d/` and before `/edit`
- **GID**: The number after `gid=`

Example:
```
URL: https://docs.google.com/spreadsheets/d/1iKFh699K_TapsbUG539bvUG7rYvNN0eA/edit?gid=1017169916#gid=1017169916

SHEET_ID: 1iKFh699K_TapsbUG539bvUG7rYvNN0eA
GID: 1017169916
```

### Step 5: Update Server Configuration

The server is already configured with your sheet IDs. If you need to change them:

Edit `server/index.js`:
```javascript
const GOOGLE_SHEETS_CONFIG = {
  EVAL_SHEET_ID: 'YOUR_EVAL_SHEET_ID',
  EVAL_GID: 'YOUR_EVAL_GID',
  USERS_SHEET_ID: 'YOUR_USERS_SHEET_ID',
  USERS_GID: 'YOUR_USERS_GID',
};
```

---

## Data Management

### Adding New Users

1. Open Users Sheet
2. Add new row with:
   - USERID: Unique identifier
   - NAME: Full name
   - SUBMITTED: N
   - ISADMIN: N (or Y for admin)
3. User can immediately login with their USERID

### Marking Submissions

**Option 1: Manual (Current)**
1. Open Users Sheet
2. Find the user's row
3. Change SUBMITTED from N to Y

**Option 2: Automatic (Requires Setup)**
- Implement Google Sheets API write access
- App will automatically update SUBMITTED column
- See AUTHENTICATION_UPDATE.md for setup instructions

### Resetting Submissions

To reset all submissions (e.g., for a new round):
1. Open Users Sheet
2. Select all SUBMITTED cells
3. Replace Y with N
4. Users can submit again

### Managing Admins

To make a user an admin:
1. Open Users Sheet
2. Find the user's row
3. Change ISADMIN from N to Y
4. User must logout and login again to see changes

---

## Validation Rules

### USERID
- ✅ Alphanumeric characters
- ✅ Underscores and hyphens allowed
- ❌ No spaces
- ❌ Must be unique

### NAME
- ✅ Any characters allowed
- ✅ Spaces allowed
- ✅ Unicode characters supported (Arabic, etc.)

### SUBMITTED
- ✅ Only Y or N (case-insensitive)
- ❌ Default should be N
- ❌ Empty cells treated as N

### ISADMIN
- ✅ Only Y or N (case-insensitive)
- ❌ Default should be N
- ❌ Empty cells treated as N

---

## Testing Your Setup

### Test 1: Verify Sheet Access
1. Open sheet URL in incognito/private browser
2. You should be able to view the sheet
3. If not, check sharing settings

### Test 2: Test Login
1. Start the server and app
2. Try logging in with a USERID from your sheet
3. Should see welcome message with NAME

### Test 3: Test Admin Access
1. Login with ISADMIN = Y user
2. Navigate to Leaderboard tab
3. Should see full leaderboard

### Test 4: Test Judge Access
1. Login with ISADMIN = N user
2. Navigate to Leaderboard tab
3. Should see "Access Denied" message

### Test 5: Test Submission
1. Login as judge (ISADMIN = N)
2. Go to Home page
3. Should see Submit button
4. Click Submit
5. Should see confirmation message

---

## Troubleshooting

### "User not found" Error
- Check USERID spelling in sheet
- Verify sheet is publicly accessible
- Check sheet ID and GID in server config

### Leaderboard Not Showing
- Verify user has ISADMIN = Y
- Check evaluation data exists
- Verify sheet permissions

### Submit Button Not Appearing
- Check user has ISADMIN = N
- Verify SUBMITTED = N
- Clear browser cache and reload

### Data Not Loading
- Verify sheets are publicly viewable
- Check sheet IDs in server config
- Check browser console for errors
- Verify server is running

---

## Best Practices

1. **Backup Your Data**
   - Make a copy of sheets before major changes
   - Export to CSV regularly

2. **User Management**
   - Use consistent USERID format
   - Keep NAME field updated
   - Document admin users

3. **Submission Tracking**
   - Monitor SUBMITTED column regularly
   - Reset after each judging round
   - Keep historical data in separate sheet

4. **Security**
   - Don't share edit access publicly
   - Use view-only sharing
   - Consider password protection for sensitive data

5. **Performance**
   - Keep sheets organized
   - Archive old data
   - Limit number of rows for faster loading

---

## Sample Users for Testing

```
USERID    | NAME              | SUBMITTED | ISADMIN | Purpose
----------|-------------------|-----------|---------|------------------
admin     | Admin User        | N         | Y       | Test admin features
judge1    | Test Judge 1      | N         | N       | Test judge features
judge2    | Test Judge 2      | Y         | N       | Test submitted state
judge3    | Test Judge 3      | N         | N       | Additional judge
```

Copy this data to your Users Sheet for testing!
