# Sample Google Sheets Data

Use this as a template to set up your Google Sheets.

## Users Sheet

**Sheet Name**: Sheet1  
**Sheet ID**: 1jLyGbkHE_fopA1QwYHsvezRZeNBu4ylXTiVQol0QNDQ

### Column Headers (Row 1)
```
USERID | NAME | SUBMITTED | ISADMIN
```

### Sample Data (Rows 2+)
```
judge1  | John Doe      | N | N
judge2  | Jane Smith    | N | N
judge3  | Bob Johnson   | N | N
admin1  | Admin User    | N | Y
```

### Field Descriptions
- **USERID**: Unique identifier for login (case-insensitive)
- **NAME**: Display name of the user
- **SUBMITTED**: Y/N - Has the user submitted their evaluations?
- **ISADMIN**: Y/N - Can the user access the leaderboard?

---

## Evaluations Sheet

**Sheet Name**: Sheet1  
**Sheet ID**: 1aYLnFkq969TOuQ2b0hY6jS2neCf5CHeV-En78QmARf4

### Column Headers (Row 1)
```
Team Name | Judge Name | Reflects Creativity and Innovation | Demonstrates clear thought | Clearly representation of the Concept | Visually appealing | Distinctive and Memorable | Relevance to Theme | Audience Appeal | Creativity | Overall Creativity | Integration of Logo and Music | How clearly the content is presented | How synced the presentation with Logo and Theme Music
```

### Sample Data (Rows 2+)
```
Blue | John Doe | 8 | 7 | 9 | 8 | 7 | 8 | 9 | 8 | 8 | 7 | 8 | 9
Red  | John Doe | 7 | 8 | 7 | 9 | 8 | 7 | 8 | 7 | 8 | 8 | 7 | 8
```

### Field Descriptions
- **Team Name**: Name of the team being evaluated
- **Judge Name**: Name of the judge (from Users sheet)
- **Evaluation Columns**: Scores from 1-10 for each criterion

---

## Quick Setup Instructions

### 1. Create Users Sheet
1. Open: https://docs.google.com/spreadsheets/d/1jLyGbkHE_fopA1QwYHsvezRZeNBu4ylXTiVQol0QNDQ/edit
2. Rename the first sheet to "Sheet1" (if not already)
3. In Row 1, add headers: `USERID`, `NAME`, `SUBMITTED`, `ISADMIN`
4. Add your users starting from Row 2
5. Share with service account email as Editor:
   `adrakapiforjedgeapplication@adrakcgteventapp.iam.gserviceaccount.com`

### 2. Create Evaluations Sheet
1. Open: https://docs.google.com/spreadsheets/d/1aYLnFkq969TOuQ2b0hY6jS2neCf5CHeV-En78QmARf4/edit
2. Rename the first sheet to "Sheet1" (if not already)
3. In Row 1, add all 14 column headers (see above)
4. Leave data rows empty (app will populate)
5. Share with service account email as Editor:
   `adrakapiforjedgeapplication@adrakcgteventapp.iam.gserviceaccount.com`

---

## Copy-Paste Templates

### Users Sheet Headers
```
USERID	NAME	SUBMITTED	ISADMIN
```

### Users Sheet Sample Rows
```
judge1	John Doe	N	N
judge2	Jane Smith	N	N
judge3	Bob Johnson	N	N
admin1	Admin User	N	Y
```

### Evaluations Sheet Headers
```
Team Name	Judge Name	Reflects Creativity and Innovation	Demonstrates clear thought	Clearly representation of the Concept	Visually appealing	Distinctive and Memorable	Relevance to Theme	Audience Appeal	Creativity	Overall Creativity	Integration of Logo and Music	How clearly the content is presented	How synced the presentation with Logo and Theme Music
```

---

## Important Notes

1. **Sheet Names**: Must be exactly "Sheet1" (case-sensitive)
2. **Column Order**: Must match exactly as shown
3. **Data Types**: 
   - SUBMITTED and ISADMIN: Use "Y" or "N" (uppercase)
   - Scores: Numbers 1-10
4. **No Extra Spaces**: Avoid leading/trailing spaces in data
5. **Service Account Access**: Must have Editor permissions

---

## Verification

After setup, verify:
- [ ] Sheet names are "Sheet1"
- [ ] Headers match exactly
- [ ] Service account has Editor access
- [ ] At least one test user exists
- [ ] At least one admin user exists (ISADMIN = Y)

---

## Testing Data

For testing, you can use these credentials:

**Judge Login**: `judge1`  
**Admin Login**: `admin1`

After first login, you can:
- As judge: Submit evaluations
- As admin: View leaderboard

The app will automatically:
- Append evaluation data to Evaluations Sheet
- Update SUBMITTED status in Users Sheet
