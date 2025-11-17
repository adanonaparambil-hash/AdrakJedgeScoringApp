# 🚀 Quick Start Guide

## Prerequisites
✅ Service account credentials saved as `service-account-key.json`
✅ Service account has edit access to both Google Sheets
✅ Node.js and npm installed

## Setup Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Copy Service Account Key
Make sure `service-account-key.json` is in the project root (already done).

### 3. Prepare Google Sheets

#### Users Sheet Structure
Sheet ID: `1jLyGbkHE_fopA1QwYHsvezRZeNBu4ylXTiVQol0QNDQ`

Create a sheet named "Sheet1" with these columns:
```
USERID | NAME | SUBMITTED | ISADMIN
```

Example data:
```
judge1 | John Doe    | N | N
judge2 | Jane Smith  | N | N
admin1 | Admin User  | N | Y
```

#### Evaluations Sheet Structure
Sheet ID: `1aYLnFkq969TOuQ2b0hY6jS2neCf5CHeV-En78QmARf4`

Create a sheet named "Sheet1" with these columns:
```
Team Name | Judge Name | Reflects Creativity and Innovation | Demonstrates clear thought | Clearly representation of the Concept | Visually appealing | Distinctive and Memorable | Relevance to Theme | Audience Appeal | Creativity | Overall Creativity | Integration of Logo and Music | How clearly the content is presented | How synced the presentation with Logo and Theme Music
```

### 4. Start the Application
```bash
npm start
```

The app will open at `http://localhost:4200`

## Usage

### Login
1. Enter your USERID from the Users Sheet
2. Click Login

### Submit Evaluations
1. Select a team
2. Rate each criterion (1-10)
3. Move to next team
4. Click "Submit All Evaluations" when done

### View Leaderboard (Admin Only)
- Admins can see the leaderboard with team rankings

## How It Works

```
Frontend (Angular)
    ↓
Service Account JWT
    ↓
Google OAuth2 Token
    ↓
Google Sheets API
    ↓
Your Google Sheets
```

**No backend server needed!** Everything runs in the browser.

## Troubleshooting

### Can't login?
- Check USERID exists in Users Sheet
- Verify service account has access to the sheet

### Submission fails?
- Check browser console for errors
- Verify service account has edit permissions
- Check Google Sheets API is enabled

### Need help?
See `GOOGLE_SHEETS_API_SETUP.md` for detailed documentation.
