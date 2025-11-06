# Google Sheets Write Access Setup

To enable writing evaluation data back to your Google Sheets, you need to set up Google Sheets API credentials.

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Sheets API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Sheets API"
   - Click on it and press "Enable"

## Step 2: Create Service Account Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "Service Account"
3. Fill in the service account details:
   - Name: `judge-app-sheets-access`
   - Description: `Service account for judge app to write to Google Sheets`
4. Click "Create and Continue"
5. Skip the optional steps and click "Done"

## Step 3: Generate and Download Key

1. In the Credentials page, find your service account
2. Click on the service account email
3. Go to the "Keys" tab
4. Click "Add Key" > "Create New Key"
5. Choose "JSON" format
6. Click "Create" - this will download a JSON file

## Step 4: Setup the Key File

1. Rename the downloaded JSON file to `service-account-key.json`
2. Place it in the root directory of your project (same level as package.json)
3. **Important**: Add this file to your `.gitignore` to keep credentials secure

## Step 5: Share Your Google Sheets

1. Open your Google Sheets:
   - [Evaluation Results Sheet](https://docs.google.com/spreadsheets/d/1e8_bLRJqe6m9vAnc6Jmx6pam1NoJT6nI/edit?gid=1688314091#gid=1688314091)
   - [Login Credentials Sheet](https://docs.google.com/spreadsheets/d/1iKFh699K_TapsbUG539bvUG7rYvNN0eA/edit?gid=1017169916#gid=1017169916)

2. For each sheet, click "Share" button
3. Add the service account email (found in your JSON file, looks like: `judge-app-sheets-access@your-project.iam.gserviceaccount.com`)
4. Give it "Editor" permissions
5. Click "Send"

## Step 6: Restart Your Server

After setting up the credentials:

```bash
npm run dev
```

You should see: `✅ Google Sheets write access enabled`

## Troubleshooting

- If you see `⚠️ Google Sheets read-only mode`, check that `service-account-key.json` exists in the root directory
- If writes fail, verify the service account has "Editor" access to both sheets
- Check the console logs for specific error messages

## Security Notes

- Never commit `service-account-key.json` to version control
- The service account only has access to sheets you explicitly share with it
- You can revoke access anytime by removing the service account from sheet sharing