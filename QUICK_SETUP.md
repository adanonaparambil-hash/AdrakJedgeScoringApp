# 🚀 Quick Setup - Google Apps Script (5 Minutes)

## Step 1: Create Google Apps Script

1. **Open your Evaluation Sheet:**
   ```
   https://docs.google.com/spreadsheets/d/1e8_bLRJqe6m9vAnc6Jmx6pam1NoJT6nI/edit
   ```

2. **Click:** Extensions → Apps Script

3. **Delete all code** and paste this:

```javascript
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const { userId, userName, evaluations } = data;
    
    const evalSheet = SpreadsheetApp.openById('1e8_bLRJqe6m9vAnc6Jmx6pam1NoJT6nI');
    const usersSheet = SpreadsheetApp.openById('1iKFh699K_TapsbUG539bvUG7rYvNN0eA');
    
    const evalData = evalSheet.getSheets()[0];
    const usersData = usersSheet.getSheets()[0];
    
    const evalHeaders = [
      'Team Name', 'Judge Name',
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
    
    for (let i = 0; i < evaluations.length; i++) {
      const eval = evaluations[i];
      const { teamName, judgeName, values } = eval;
      
      const allData = evalData.getDataRange().getValues();
      let rowIndex = -1;
      
      for (let j = 1; j < allData.length; j++) {
        if (allData[j][0] === teamName && allData[j][1] === judgeName) {
          rowIndex = j + 1;
          break;
        }
      }
      
      const rowData = [teamName, judgeName];
      for (let k = 2; k < evalHeaders.length; k++) {
        rowData.push(values[evalHeaders[k]] || 0);
      }
      
      if (rowIndex > 0) {
        evalData.getRange(rowIndex, 1, 1, rowData.length).setValues([rowData]);
      } else {
        evalData.appendRow(rowData);
      }
    }
    
    const usersAllData = usersData.getDataRange().getValues();
    for (let i = 1; i < usersAllData.length; i++) {
      if (usersAllData[i][0] === userId) {
        usersData.getRange(i + 1, 3).setValue('Y');
        break;
      }
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      ok: true,
      message: 'Submitted successfully!'
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      ok: false,
      message: 'Error: ' + error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
```

4. **Save:** Click 💾 Save

5. **Deploy:**
   - Click **Deploy** → **New deployment**
   - Click gear icon → **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
   - Click **Deploy**
   - Click **Authorize access**
   - Choose your account
   - Click **Advanced** → **Go to [project] (unsafe)**
   - Click **Allow**

6. **Copy the URL** - looks like:
   ```
   https://script.google.com/macros/s/AKfycby.../exec
   ```

## Step 2: Update Your Code

Open `src/app/core/api.service.ts` and find this line (around line 122):

```typescript
const GOOGLE_APPS_SCRIPT_URL = 'YOUR_APPS_SCRIPT_URL_HERE';
```

Replace with your URL:

```typescript
const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/YOUR_URL/exec';
```

## Step 3: Test

```bash
ng serve
```

Login, score teams, submit - it should work! ✅

## Troubleshooting

**"Script not authorized"**
- Redeploy and authorize again

**"CORS error"**
- Make sure "Who has access" = Anyone

**Still not working?**
- Check browser console (F12)
- Check Apps Script Executions tab
