# Google Sheets Integration Setup

This application uses Google Sheets as the backend database for storing user data and evaluation results.

## Configuration

### Google Sheets URLs

**Users Sheet:**
- URL: https://docs.google.com/spreadsheets/d/1jLyGbkHE_fopA1QwYHsvezRZeNBu4ylXTiVQol0QNDQ/edit?gid=617871645
- Sheet ID: `1jLyGbkHE_fopA1QwYHsvezRZeNBu4ylXTiVQol0QNDQ`
- GID: `617871645`
- Columns: USERID, NAME, SUBMITTED, ISADMIN

**Evaluation Results Sheet:**
- URL: https://docs.google.com/spreadsheets/d/1aYLnFkq969TOuQ2b0hY6jS2neCf5CHeV-En78QmARf4/edit?gid=1574680633
- Sheet ID: `1aYLnFkq969TOuQ2b0hY6jS2neCf5CHeV-En78QmARf4`
- GID: `1574680633`
- Columns: Team Name, Judge Name, [12 evaluation criteria columns]

### Service Account Credentials

The application uses a Google Cloud service account to access and modify the sheets. The credentials are stored in `service-account-key.json` (already configured).

**Service Account Details:**
- Project ID: `adrakcgteventapp`
- Client Email: `adrakapiforjedgeapplication@adrakcgteventapp.iam.gserviceaccount.com`
- The service account has been granted edit access to both sheets

## How It Works

### Read Operations (Frontend)
The Angular frontend can directly read from Google Sheets using CSV export URLs:
- No authentication required for public sheets
- Fast and efficient for displaying data
- Used for: login validation, leaderboard display, loading existing evaluations

### Write Operations (Backend)
All write operations go through the Node.js backend server:
- Uses Google Sheets API v4 with service account authentication
- Handles: submitting evaluations, updating user submission status
- Avoids CORS issues and keeps credentials secure

## Running the Application

1. **Start the backend server:**
   ```bash
   npm run server
   ```
   Server will run on http://localhost:3000

2. **Start the Angular app:**
   ```bash
   npm start
   ```
   App will run on http://localhost:4200

3. **Or run both together:**
   ```bash
   npm run dev
   ```

## API Endpoints

The backend server provides these endpoints:

- `POST /api/login` - Validate user credentials
- `GET /api/teams` - Get list of teams
- `POST /api/evaluations` - Save evaluation for a team
- `GET /api/evaluation` - Load evaluation for a team/judge
- `GET /api/judge-scores` - Get judge's scores for all teams
- `GET /api/leaderboard` - Get leaderboard with averages
- `POST /api/submit-all-evaluations` - Submit all evaluations and mark user as submitted

## Security Notes

- The `service-account-key.json` file is excluded from git via `.gitignore`
- Service account has minimal permissions (only access to these two sheets)
- Frontend never exposes the service account credentials
- All write operations are authenticated through the backend
