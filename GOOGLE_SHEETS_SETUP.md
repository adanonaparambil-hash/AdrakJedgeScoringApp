# Google Sheets Integration Setup

This application now uses Google Sheets instead of local Excel files for data storage.

## Required Google Sheets

### 1. Login Credentials Sheet
**URL**: https://docs.google.com/spreadsheets/d/1iKFh699K_TapsbUG539bvUG7rYvNN0eA/edit?gid=1017169916#gid=1017169916

**Required Columns** (Row 1 - Headers):
- `Username` - Judge username
- `Password` - Judge password
- `Name` - Judge full name (optional)

**Example Data**:
```
Username | Password | Name
judge1   | pass123  | John Smith
judge2   | pass456  | Jane Doe
admin    | admin123 | Administrator
```

### 2. Evaluation Results Sheet
**URL**: https://docs.google.com/spreadsheets/d/1e8_bLRJqe6m9vAnc6Jmx6pam1NoJT6nI/edit?gid=1688314091#gid=1688314091

**Required Columns** (Row 1 - Headers):
- `Team Name` - Team being evaluated (Blue, Red, Green)
- `Judge Name` - Name of the judge
- `Reflects Creativity and Innovation` - Score 0-10
- `Demonstrates clear thought` - Score 0-10
- `Clearly representation of the Concept` - Score 0-10
- `Visually appealing` - Score 0-10
- `Distinctive and Memorable` - Score 0-10
- `Relevance to Theme` - Score 0-10
- `Audience Appeal` - Score 0-10
- `Creativity` - Score 0-10
- `Overall Creativity` - Score 0-10
- `Integration of Logo and Music` - Score 0-10
- `How clearly the content is presented` - Score 0-10
- `How synced the presentation with Logo and Theme Music` - Score 0-10

## Sheet Permissions

**IMPORTANT**: Make sure both Google Sheets are set to:
- **"Anyone with the link can view"** for reading data
- For writing data, you would need to set up Google Service Account credentials

## Current Implementation

- ✅ **Reading**: The app can read data from public Google Sheets
- ⚠️ **Writing**: Currently uses in-memory cache (data persists during server session)
- 🔄 **Cache**: Refreshes every 30 seconds from Google Sheets

## Production Setup (Optional)

For full read/write functionality to Google Sheets:

1. Create a Google Cloud Project
2. Enable Google Sheets API
3. Create Service Account credentials
4. Share your sheets with the service account email
5. Add credentials to server environment

## Testing

1. Make sure your Google Sheets have the correct column headers
2. Add some test data to the Login sheet
3. Start the server: `npm run dev` (from server directory)
4. Check console for successful connection messages

## Troubleshooting

- **"Login data not available"**: Check if Login sheet is publicly accessible
- **"Empty leaderboard"**: Check if Evaluation sheet has correct column headers
- **"Service unavailable"**: Check internet connection and sheet URLs

## Sheet URLs Used in Code

```javascript
LOGIN_SHEET_ID: '1iKFh699K_TapsbUG539bvUG7rYvNN0eA'
EVAL_SHEET_ID: '1e8_bLRJqe6m9vAnc6Jmx6pam1NoJT6nI'
```