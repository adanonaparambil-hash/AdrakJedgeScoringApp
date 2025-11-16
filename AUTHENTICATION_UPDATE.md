# Authentication & Google Sheets Integration Update

## Overview
This update implements a simplified authentication system using Google Sheets and adds admin/judge role management with submission tracking.

## Changes Made

### 1. Google Sheets Structure

#### Users Sheet (Sheet 1)
**URL:** `https://docs.google.com/spreadsheets/d/1iKFh699K_TapsbUG539bvUG7rYvNN0eA/edit?gid=1017169916`

**Columns:**
- `USERID` - Unique user identifier (used for login)
- `NAME` - Full name of the user (displayed in the app)
- `SUBMITTED` - Y/N flag indicating if user has submitted their evaluation
- `ISADMIN` - Y/N flag indicating if user is an administrator

#### Evaluation Results Sheet (Sheet 2)
**URL:** `https://docs.google.com/spreadsheets/d/1e8_bLRJqe6m9vAnc6Jmx6pam1NoJT6nI/edit?gid=1688314091`

**Columns:**
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

### 2. Authentication Changes

#### Login Process (No Password Required)
- Users now login with only their **USERID**
- Password field has been removed from the login screen
- System checks if USERID exists in the Users Sheet
- Upon successful login, the following data is stored in localStorage:
  - `token` - Authentication token
  - `userId` - User's ID
  - `userName` - User's full name
  - `isAdmin` - Admin status (true/false)
  - `submitted` - Submission status (true/false)

### 3. Role-Based Features

#### Admin Users (ISADMIN = Y)
- Can view the **Leaderboard** with full team rankings
- See submission statistics (X/Y judges submitted)
- View all scores from all judges
- No submit button (admins don't submit evaluations)

#### Regular Judges (ISADMIN = N)
- **Cannot** view the Leaderboard (shows access denied message)
- Can only see their own scores on Home and Profile pages
- Have a **Submit** button on the Home page
- Once submitted, the button is replaced with a confirmation message

### 4. Submission System

#### Submit Button
- Appears on the Home page for non-admin users who haven't submitted
- When clicked, marks the user's evaluation as submitted
- Updates the `SUBMITTED` column in the Users Sheet to "Y"
- After submission, user sees a confirmation message

#### Leaderboard Calculation
- Only counts scores from judges where `SUBMITTED = Y`
- Formula: `Average Score = Total Score / Number of Submitted Judges`
- Displays submission statistics: "X/Y submitted" for each team

### 5. UI Updates

#### Welcome Message
- Shows user's NAME from the sheet: "Hi, [NAME]!"
- Displays role: "Admin • View All Scores" or "Judge • Ready to Score"
- Shows submission status for judges: "✓ Submitted"

#### Profile Page
- Displays user's full name and User ID
- Shows role badge (Admin 👑 or Judge 🎯)
- Shows submission status badge for judges

#### Home Page
- Personalized greeting with user's name
- Submit button for non-admin users (before submission)
- Confirmation message after submission
- Role-specific information display

### 6. API Endpoints

#### Updated Endpoints

**POST /api/login**
```json
Request: { "username": "user123" }
Response: {
  "token": "user:user123",
  "userId": "user123",
  "name": "John Doe",
  "isAdmin": false,
  "submitted": false
}
```

**POST /api/submit-evaluation**
```json
Request: { "userId": "user123" }
Response: {
  "ok": true,
  "message": "Evaluation submitted successfully"
}
```

**GET /api/leaderboard**
```json
Response: [
  {
    "team": "Blue",
    "average": 95.5,
    "totalJudges": 5,
    "submittedJudges": 3
  }
]
```

### 7. Server Configuration

The server now uses:
- `USERS_SHEET_ID` and `USERS_GID` for authentication and user management
- `EVAL_SHEET_ID` and `EVAL_GID` for evaluation data
- Reads from Google Sheets using CSV export (no API key required for reading)
- Writing to sheets requires Google Sheets API setup (optional)

## Setup Instructions

### 1. Prepare Google Sheets

#### Users Sheet
1. Create or update the sheet with columns: USERID, NAME, SUBMITTED, ISADMIN
2. Add user records:
   ```
   USERID    | NAME          | SUBMITTED | ISADMIN
   judge1    | John Smith    | N         | N
   judge2    | Jane Doe      | N         | N
   admin1    | Admin User    | N         | Y
   ```
3. Make the sheet publicly viewable (Share > Anyone with link can view)

#### Evaluation Sheet
1. Ensure the sheet has all required columns
2. Make the sheet publicly viewable

### 2. Update Server Configuration

The server is already configured with the correct sheet IDs:
- Users Sheet: `1iKFh699K_TapsbUG539bvUG7rYvNN0eA`
- Evaluation Sheet: `1e8_bLRJqe6m9vAnc6Jmx6pam1NoJT6nI`

### 3. Test the Application

1. Start the server: `npm start` (in server directory)
2. Start the Angular app: `ng serve`
3. Login with a USERID from your Users Sheet
4. Test admin features with an admin account (ISADMIN = Y)
5. Test judge features with a regular account (ISADMIN = N)

## Important Notes

### Write Access to Google Sheets
Currently, the submit functionality acknowledges the submission but doesn't write back to the Google Sheet. To enable full write access:

1. Create a Google Cloud Project
2. Enable Google Sheets API
3. Create a service account and download credentials
4. Save credentials as `server/service-account-key.json`
5. Share your Google Sheets with the service account email

### Security Considerations
- This is a simplified authentication system without passwords
- Suitable for internal/controlled environments
- For production use, consider adding:
  - Password authentication
  - JWT tokens with expiration
  - HTTPS/SSL
  - Rate limiting
  - Session management

### Data Persistence
- User data is stored in localStorage
- Clears on logout
- Survives page refreshes
- Separate per browser/device

## Testing Scenarios

### Test Case 1: Admin Login
1. Login with USERID where ISADMIN = Y
2. Verify leaderboard is accessible
3. Verify no submit button appears
4. Check profile shows "Admin" role

### Test Case 2: Judge Login
1. Login with USERID where ISADMIN = N
2. Verify leaderboard shows "Access Denied"
3. Verify submit button appears on Home page
4. Click submit and verify confirmation message
5. Check profile shows "Judge" role and "Submitted" badge

### Test Case 3: Leaderboard Calculation
1. Have multiple judges submit scores
2. Mark some as SUBMITTED = Y in the sheet
3. Verify leaderboard only counts submitted judges
4. Check submission statistics display correctly

## Troubleshooting

### Login Issues
- Verify USERID exists in Users Sheet
- Check sheet is publicly accessible
- Verify sheet ID and GID are correct
- Check browser console for errors

### Leaderboard Not Showing
- Verify user has ISADMIN = Y
- Check evaluation data exists in Evaluation Sheet
- Verify sheet permissions

### Submit Button Not Working
- Check user is not an admin
- Verify user hasn't already submitted
- Check browser console for API errors
- Verify server is running

## Future Enhancements

1. **Google Sheets Write Access**
   - Implement service account authentication
   - Update SUBMITTED column on submit
   - Real-time sync with sheets

2. **Enhanced Security**
   - Add password authentication
   - Implement JWT tokens
   - Add session timeout

3. **Additional Features**
   - Email notifications on submission
   - Export leaderboard to PDF
   - Real-time collaboration indicators
   - Audit log of all changes

## Support

For issues or questions:
1. Check the browser console for errors
2. Verify Google Sheets are accessible
3. Check server logs for API errors
4. Review this documentation for setup steps
