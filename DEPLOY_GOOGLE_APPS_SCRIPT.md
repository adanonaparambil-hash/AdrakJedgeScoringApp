# ✅ Deploy Google Apps Script Web App (NO BACKEND NEEDED)

## Why This is Needed

**You CANNOT call Google Sheets API directly from browser JavaScript with service account credentials** because:
1. Browser cannot sign JWT tokens with RSA private keys (security limitation)
2. Exposing private keys in frontend code is a security risk
3. CORS policy blocks direct API calls from browser

## Solution: Google Apps Script Web App

Google Apps Script runs on Google's servers and can write to your sheets. It acts as a simple API endpoint.

---

## 🚀 Setup (5 Minutes)

### Step 1: Open Apps Script Editor

1. Go to your **Evaluation Sheet**: https://docs.google.com/spreadsheets/d/1aYLnFkq969TOuQ2b0hY6jS2neCf5CHeV-En78QmARf4
2. Click: **Extensions** → **Apps Script**

### Step 2: Paste This Code

Replace all code in the editor with:

```javascript
// Sheet IDs
const EVAL_SHEET_ID = '1aYLnFkq969TOuQ2b0hY6jS2neCf5CHeV-En78QmARf4';
const USERS_SHEET_ID = '1jLyGbkHE_fopA1QwYHsvezRZeNBu4ylXTiVQol0QNDQ';

// Evaluation columns
const EVAL_COLUMNS = [
  'Team Name',
  'Judge Name',
  'Reflects Creativity and Innovation',
  'Demonstrates clear thought',
  'Clearly representation of the Concept',
  'Visually appealing',
  'Distinctive and Memorable',
  'Relevance to Theme',
  'Audience Appeal',
  'Creativity',
  'Overall Creativity',
  'Integration of Logo and Music',
  'How clearly the content is presented',
  'How synced the presentation with Logo and Theme Music'
];

// Handle POST requests from Angular app
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;

    if (action === 'submitEvaluations') {
      return submitEvaluations(data);
    } else if (action === 'markSubmitted') {
      return markUserSubmitted(data);
    }

    return createResponse(false, 'Unknown action');
  } catch (error) {
    return createResponse(false, error.toString());
  }
}

// Handle GET requests (for testing)
function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: 'ok',
    message: 'Judge App API is running',
    timestamp: new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
}

// Submit all evaluations
function submitEvaluations(data) {
  const { userName, evaluations } = data;
  
  if (!userName || !evaluations || evaluations.length === 0) {
    return createResponse(false, 'Missing required data');
  }

  const sheet = SpreadsheetApp.openById(EVAL_SHEET_ID).getSheets()[0];
  const existingData = sheet.getDataRange().getValues();

  // Process each evaluation
  let updatedCount = 0;
  let addedCount = 0;

  evaluations.forEach(eval => {
    const { teamName, judgeName, values } = eval;
    
    // Find existing row for this team/judge
    let rowIndex = -1;
    for (let i = 1; i < existingData.length; i++) {
      if (existingData[i][0] === teamName && existingData[i][1] === judgeName) {
        rowIndex = i + 1; // 1-based index
        break;
      }
    }

    // Prepare row data
    const rowData = [teamName, judgeName];
    EVAL_COLUMNS.slice(2).forEach(col => {
      rowData.push(values[col] || 0);
    });

    if (rowIndex > 0) {
      // Update existing row
      sheet.getRange(rowIndex, 1, 1, rowData.length).setValues([rowData]);
      updatedCount++;
    } else {
      // Append new row
      sheet.appendRow(rowData);
      addedCount++;
    }
  });

  return createResponse(true, `Success! Updated ${updatedCount} rows, added ${addedCount} new rows.`);
}

// Mark user as submitted
function markUserSubmitted(data) {
  const { userId } = data;
  
  if (!userId) {
    return createResponse(false, 'Missing userId');
  }

  const sheet = SpreadsheetApp.openById(USERS_SHEET_ID).getSheets()[0];
  const existingData = sheet.getDataRange().getValues();
  
  // Find user row
  for (let i = 1; i < existingData.length; i++) {
    if (existingData[i][0] === userId) {
      // Update SUBMITTED column (column 3, index 2)
      sheet.getRange(i + 1, 3).setValue('Y');
      return createResponse(true, 'User marked as submitted');
    }
  }

  return createResponse(false, 'User not found');
}

// Helper to create JSON response
function createResponse(ok, message) {
  const response = { ok, message };
  return ContentService.createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}
```

### Step 3: Save the Project

- Click the **Save** icon (💾)
- Name it: "Judge App API"

### Step 4: Deploy as Web App

1. Click **Deploy** → **New deployment**
2. Click the gear icon ⚙️ → Select **Web app**
3. Settings:
   - **Description:** Judge App API
   - **Execute as:** Me (your email)
   - **Who has access:** Anyone
4. Click **Deploy**
5. Click **Authorize access**
6. Choose your Google account
7. Click **Advanced** → **Go to Judge App API (unsafe)**
8. Click **Allow**
9. **COPY THE WEB APP URL** (looks like: `https://script.google.com/macros/s/AKfycby.../exec`)

### Step 5: Update Angular App

Open `src/app/core/api.service.ts` and find this line (around line 50):

```typescript
private readonly APPS_SCRIPT_URL = 'PASTE_YOUR_WEB_APP_URL_HERE';
```

Replace `PASTE_YOUR_WEB_APP_URL_HERE` with your actual Web App URL.

### Step 6: Test It

```bash
npm start
```

Open http://localhost:4200 and test:
1. Login
2. Score teams
3. Submit evaluations
4. Check Google Sheets - data should appear!

---

## ✅ Benefits

- ✅ No backend server needed
- ✅ No `npm run server` required
- ✅ Direct integration with Google Sheets
- ✅ Automatic real-time sync
- ✅ Secure (credentials stay on Google's servers)
- ✅ Free and scalable

---

## 🧪 Test the Web App

After deploying, test it in your browser:

```
https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
```

Should show:
```json
{
  "status": "ok",
  "message": "Judge App API is running",
  "timestamp": "2025-11-17T..."
}
```

---

## 🔄 Update the Deployment

If you make changes to the script:
1. Click **Deploy** → **Manage deployments**
2. Click the edit icon ✏️
3. Change **Version** to "New version"
4. Click **Deploy**

---

## ⚠️ Important Notes

1. The Web App URL never changes (unless you create a new deployment)
2. You can test the URL directly in browser (GET request)
3. Angular app will POST data to this URL
4. No CORS issues (Google Apps Script handles it)
5. No authentication needed from frontend (Apps Script runs as you)

---

## 🆘 Troubleshooting

### "Script function not found: doPost"
- Make sure you pasted the complete code
- Save the project before deploying

### "Authorization required"
- Click "Authorize access" during deployment
- Allow all permissions

### "Access denied"
- Make sure "Who has access" is set to "Anyone"
- Redeploy if needed

### Still not working?
- Check browser console for errors
- Verify the Web App URL is correct in api.service.ts
- Test the URL directly in browser (should show "ok" message)

---

That's it! Once deployed, your Angular app will write directly to Google Sheets with NO backend server needed! 🎉
