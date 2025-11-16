# 📝 Google Apps Script Setup - Write to Sheets

## 🎯 Overview

This guide shows you how to write scores to Google Sheets using **Google Apps Script** - no complex API setup needed!

---

## 🚀 Setup Steps

### Step 1: Create Google Apps Script

1. **Open your Evaluation Sheet:**
   ```
   https://docs.google.com/spreadsheets/d/1e8_bLRJqe6m9vAnc6Jmx6pam1NoJT6nI/edit
   ```

2. **Open Script Editor:**
   - Click **Extensions** → **Apps Script**

3. **Delete existing code and paste this:**

```javascript
function doPost(e) {
  try {
    // Parse the incoming data
    const data = JSON.parse(e.postData.contents);
    const { userId, userName, evaluations } = data;
    
    // Get the spreadsheets
    const evalSheet = SpreadsheetApp.openById('1e8_bLRJqe6m9vAnc6Jmx6pam1NoJT6nI');
    const usersSheet = SpreadsheetApp.openById('1iKFh699K_TapsbUG539bvUG7rYvNN0eA');
    
    // Get the first sheet (or specify sheet name)
    const evalData = evalSheet.getSheets()[0];
    const usersData = usersSheet.getSheets()[0];
    
    // Column headers for evaluation sheet
    const evalHeaders = [
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
    
    // Write evaluations to Evaluation Sheet
    for (let i = 0; i < evaluations.length; i++) {
      const eval = evaluations[i];
      const { teamName, judgeName, values } = eval;
      
      // Find existing row or create new one
      const allData = evalData.getDataRange().getValues();
      let rowIndex = -1;
      
      for (let j = 1; j < allData.length; j++) {
        if (allData[j][0] === teamName && allData[j][1] === judgeName) {
          rowIndex = j + 1; // 1-based index
          break;
        }
      }
      
      // Prepare row data
      const rowData = [teamName, judgeName];
      for (let k = 2; k < evalHeaders.length; k++) {
        const header = evalHeaders[k];
        rowData.push(values[header] || 0);
      }
      
      if (rowIndex > 0) {
        // Update existing row
        evalData.getRange(rowIndex, 1, 1, rowData.length).setValues([rowData]);
      } else {
        // Append new row
        evalData.appendRow(rowData);
      }
    }
    
    // Update SUBMITTED column in Users Sheet
    const usersAllData = usersData.getDataRange().getValues();
    for (let i = 1; i < usersAllData.length; i++) {
      if (usersAllData[i][0] === userId) { // USERID column
        usersData.getRange(i + 1, 3).setValue('Y'); // SUBMITTED column (column C = 3)
        break;
      }
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      ok: true,
      message: 'All evaluations submitted successfully to Google Sheets!',
      writtenToSheet: true
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      ok: false,
      message: 'Error: ' + error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: 'ok',
    message: 'Google Apps Script is running'
  })).setMimeType(ContentService.MimeType.JSON);
}
```

4. **Save the script:**
   - Click **Save** (💾 icon)
   - Name it: "CGT Judge Submission Handler"

5. **Deploy as Web App:**
   - Click **Deploy** → **New deployment**
   - Click **Select type** → **Web app**
   - Settings:
     - Description: "CGT Judge Submission API"
     - Execute as: **Me**
     - Who has access: **Anyone**
   - Click **Deploy**
   - **Copy the Web App URL** (you'll need this!)
   - Example: `https://script.google.com/macros/s/AKfycby.../exec`

6. **Authorize the script:**
   - Click **Review permissions**
   - Choose your Google account
   - Click **Advanced** → **Go to [Project name] (unsafe)**
   - Click **Allow**

---

### Step 2: Update Frontend to Use Apps Script

Now update the API service to use the Google Apps Script URL:

**src/app/core/api.service.ts:**

Find the `submitEvaluation` method and update it:

```typescript
submitEvaluation(userId: string, userName: string, allScores: Map<string, EvaluationValues>): Observable<{ ok: boolean; message: string }> {
  // Use Google Apps Script URL instead of backend
  const appsScriptUrl = 'YOUR_APPS_SCRIPT_URL_HERE'; // Paste your URL here!
  
  // Prepare data for submission
  const evaluations: any[] = [];
  allScores.forEach((values, team) => {
    evaluations.push({
      teamName: team,
      judgeName: userName,
      values: values
    });
  });

  return this.http.post<{ ok: boolean; message: string }>(appsScriptUrl, {
    userId,
    userName,
    evaluations
  }).pipe(
    catchError(error => {
      console.error('Submit error:', error);
      return of({
        ok: false,
        message: 'Failed to submit. Please try again.'
      });
    })
  );
}
```

---

### Step 3: Test the Setup

1. **Start the app:**
   ```bash
   ng serve
   ```

2. **Login and score teams**

3. **Submit evaluations**

4. **Check Google Sheets:**
   - Evaluation Sheet should have new rows
   - Users Sheet SUBMITTED column should be Y

---

## 🔧 Troubleshooting

### "Script not authorized"
- Go back to Apps Script
- Click **Deploy** → **Manage deployments**
- Click **Edit** (pencil icon)
- Click **Deploy**
- Authorize again

### "CORS error"
- Make sure you deployed as **Web app**
- Make sure "Who has access" is set to **Anyone**

### "Data not saving"
- Check Apps Script **Executions** tab for errors
- Verify sheet IDs are correct
- Check column names match exactly

---

## 📊 What Gets Written

### Evaluation Sheet (Sheet 2)

**Before:**
```
Team Name | Judge Name | Criteria 1 | Criteria 2 | ... | Criteria 12
```

**After submission:**
```
Team Name | Judge Name | Criteria 1 | Criteria 2 | ... | Criteria 12
Blue      | Judge One  | 8          | 9          | ... | 7
Red       | Judge One  | 7          | 8          | ... | 9
Green     | Judge One  | 9          | 7          | ... | 8
```

### Users Sheet (Sheet 1)

**Before:**
```
USERID | NAME      | SUBMITTED | ISADMIN
judge1 | Judge One | N         | N
```

**After submission:**
```
USERID | NAME      | SUBMITTED | ISADMIN
judge1 | Judge One | Y         | N
```

---

## ✅ Advantages

✅ **No backend server needed** (can remove Node.js server)
✅ **No API keys needed**
✅ **No service account setup**
✅ **Direct write to Google Sheets**
✅ **Free and simple**
✅ **Works from anywhere**

---

## 🎯 Complete Flow

```
User clicks "Submit All Evaluations"
    ↓
Frontend sends data to Apps Script URL
    ↓
Apps Script receives data
    ↓
Writes to Evaluation Sheet
    ↓
Updates SUBMITTED column in Users Sheet
    ↓
Returns success message
    ↓
Frontend shows confirmation
    ↓
Sliders disabled
```

---

## 📝 Quick Reference

**Apps Script URL format:**
```
https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
```

**Update in code:**
```typescript
const appsScriptUrl = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';
```

**Test URL in browser:**
```
https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
```

Should return:
```json
{
  "status": "ok",
  "message": "Google Apps Script is running"
}
```

---

## 🎊 Done!

Now your submissions will write directly to Google Sheets! 🚀

**No backend server needed!**
**No complex API setup!**
**Just works!** ✅
