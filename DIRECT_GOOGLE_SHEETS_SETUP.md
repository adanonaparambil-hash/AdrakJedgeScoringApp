# Direct Google Sheets Integration (No Backend Server)

## Problem
You want to write data directly to Google Sheets from the Angular frontend without running a Node.js backend server.

## Solutions

### Option 1: Google Apps Script Web App (RECOMMENDED)

This is the best solution for your use case. You create a web app using Google Apps Script that acts as an API endpoint.

#### Steps:

1. **Open Google Apps Script Editor**
   - Go to your Evaluation Sheet: https://docs.google.com/spreadsheets/d/1aYLnFkq969TOuQ2b0hY6jS2neCf5CHeV-En78QmARf4
   - Click `Extensions` → `Apps Script`

2. **Create the Web App Script**
   - Replace the default code with the script below
   - Save the project (name it "Judge App API")

3. **Deploy as Web App**
   - Click `Deploy` → `New deployment`
   - Select type: `Web app`
   - Execute as: `Me`
   - Who has access: `Anyone` (or `Anyone with Google account`)
   - Click `Deploy`
   - Copy the Web App URL (looks like: `https://script.google.com/macros/s/...../exec`)

4. **Update Angular App**
   - Replace the Web App URL in `api.service.ts`

#### Google Apps Script Code:

```javascript
// Configuration
const EVAL_SHEET_ID = '1aYLnFkq969TOuQ2b0hY6jS2neCf5CHeV-En78QmARf4';
const USERS_SHEET_ID = '1jLyGbkHE_fopA1QwYHsvezRZeNBu4ylXTiVQol0QNDQ';

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

// Handle POST requests
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
    message: 'Judge App API is running'
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
  const headers = existingData[0];

  // Process each evaluation
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
    } else {
      // Append new row
      sheet.appendRow(rowData);
    }
  });

  return createResponse(true, 'All evaluations submitted successfully!');
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

---

### Option 2: Current Implementation (LocalStorage + Manual Export)

The current implementation saves data to browser localStorage and provides CSV export functionality.

**Pros:**
- No server needed
- Works offline
- Simple implementation

**Cons:**
- Data not automatically synced to Google Sheets
- Requires manual CSV export and paste
- Data lost if browser cache cleared

**How to use:**
1. Users complete evaluations
2. Click "Submit All Evaluations"
3. Download CSV file or copy from console
4. Manually paste into Google Sheets

---

### Option 3: Keep the Node.js Backend (Current Setup)

Keep using the backend server with Google Sheets API.

**Pros:**
- Full control over data
- Secure service account authentication
- Automatic sync to Google Sheets

**Cons:**
- Requires running `npm run server`
- Need to deploy backend separately for production

**How to use:**
```bash
npm run dev
```

---

## Recommendation

**For your use case, I recommend Option 1 (Google Apps Script Web App)** because:

✅ No backend server needed
✅ Direct integration with Google Sheets
✅ Automatic data sync
✅ Easy to deploy and maintain
✅ Works from any device with internet
✅ Free and scalable

Would you like me to:
1. Update the Angular app to use Google Apps Script Web App endpoint?
2. Keep the current localStorage + manual export approach?
3. Keep the Node.js backend server approach?

Let me know which option you prefer!
