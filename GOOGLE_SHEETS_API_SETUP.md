# Google Sheets API Direct Integration Setup

This application now uses **Google Sheets API directly** from the Angular frontend using service account credentials. No backend server or Apps Script required!

## ✅ What's Already Done

1. ✅ Google Cloud Console project created (`adrakcgteventapp`)
2. ✅ Service account created with credentials
3. ✅ Google Sheets API enabled
4. ✅ Service account has edit access to both sheets:
   - Users Sheet: `1jLyGbkHE_fopA1QwYHsvezRZeNBu4ylXTiVQol0QNDQ`
   - Evaluations Sheet: `1aYLnFkq969TOuQ2b0hY6jS2neCf5CHeV-En78QmARf4`
5. ✅ `service-account-key.json` file saved in project

## 📋 Google Sheets Structure

### Users Sheet (Sheet1)
Columns: `USERID | NAME | SUBMITTED | ISADMIN`

Example:
```
USERID    | NAME        | SUBMITTED | ISADMIN
judge1    | John Doe    | N         | N
judge2    | Jane Smith  | Y         | N
admin1    | Admin User  | Y         | Y
```

### Evaluations Sheet (Sheet1)
Columns: `Team Name | Judge Name | [12 evaluation columns]`

The 12 evaluation columns are:
1. Reflects Creativity and Innovation
2. Demonstrates clear thought
3. Clearly representation of the Concept
4. Visually appealing
5. Distinctive and Memorable
6. Relevance to Theme
7. Audience Appeal
8. Creativity
9. Overall Creativity
10. Integration of Logo and Music
11. How clearly the content is presented
12. How synced the presentation with Logo and Theme Music

## 🚀 How It Works

### Authentication Flow
1. App loads service account credentials from `service-account-key.json`
2. Creates a JWT (JSON Web Token) signed with the private key
3. Exchanges JWT for an OAuth2 access token from Google
4. Uses access token to make authenticated requests to Google Sheets API

### Operations

#### Login
- Reads Users Sheet to verify user exists
- Returns user info (name, admin status, submitted status)

#### Submit Evaluation
- Appends new rows to Evaluations Sheet with scores
- Updates Users Sheet to mark user as submitted

#### Get Leaderboard
- Reads all evaluations from Evaluations Sheet
- Calculates team averages
- Returns sorted leaderboard

#### Get Judge Scores
- Reads evaluations for specific judge
- Returns scores for all teams

## 🔧 Technical Implementation

### Key Files Modified
- `src/app/core/api.service.ts` - Main service with Google Sheets API integration
- `package.json` - Added `jsrsasign` for JWT signing
- `tsconfig.json` - Added `resolveJsonModule` to import JSON
- `src/typings.d.ts` - Type declarations for JSON imports

### API Methods Used
- `GET /v4/spreadsheets/{spreadsheetId}/values/{range}` - Read data
- `POST /v4/spreadsheets/{spreadsheetId}/values/{range}:append` - Append rows
- `PUT /v4/spreadsheets/{spreadsheetId}/values/{range}` - Update cells

## 🔐 Security Notes

⚠️ **IMPORTANT**: The service account private key is embedded in the frontend code. This means:

1. **Anyone with access to your app can extract the credentials**
2. **Only use this for internal/trusted applications**
3. **For production apps, use a backend server to handle authentication**

### Better Security Approach (Future)
For production, consider:
- Moving authentication to a backend server
- Using OAuth2 user authentication instead of service account
- Implementing API key restrictions
- Using environment variables for sensitive data

## 🧪 Testing

1. Start the app:
   ```bash
   npm start
   ```

2. Login with a user from your Users Sheet

3. Submit evaluations - they will be written directly to Google Sheets

4. Check the Evaluations Sheet to see the data

5. View leaderboard to see calculated averages

## 📝 Adding New Users

Add rows to the Users Sheet:
```
USERID    | NAME        | SUBMITTED | ISADMIN
newjudge  | New Judge   | N         | N
```

## 🎯 Adding New Teams

Update the `getTeams()` method in `api.service.ts` or read from a Teams sheet.

## 🐛 Troubleshooting

### "Error getting access token"
- Check that service account email has edit access to sheets
- Verify Google Sheets API is enabled in Cloud Console
- Check service-account-key.json is valid

### "Error fetching sheet data"
- Verify sheet IDs are correct
- Check sheet names (default is "Sheet1")
- Ensure service account has access

### CORS Errors
- Google Sheets API should allow CORS from browser
- If issues persist, may need to use a proxy server

## 📚 Resources

- [Google Sheets API Documentation](https://developers.google.com/sheets/api)
- [Service Account Authentication](https://developers.google.com/identity/protocols/oauth2/service-account)
- [jsrsasign Library](https://kjur.github.io/jsrsasign/)
