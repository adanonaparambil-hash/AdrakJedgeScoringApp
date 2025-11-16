const express = require('express');
const cors = require('cors');
const { google } = require('googleapis');

const app = express();
app.use(cors());
app.use(express.json());

// Google Sheets configuration
const GOOGLE_SHEETS_CONFIG = {
  // Evaluation Results Sheet
  EVAL_SHEET_ID: '1e8_bLRJqe6m9vAnc6Jmx6pam1NoJT6nI',
  EVAL_GID: '1688314091', // From the URL gid parameter

  // Users Sheet (Login + Admin + Submitted tracking)
  USERS_SHEET_ID: '1iKFh699K_TapsbUG539bvUG7rYvNN0eA',
  USERS_GID: '1017169916', // From the URL gid parameter
  // Columns: USERID, NAME, SUBMITTED, ISADMIN
};

// In-memory cache for evaluation data (since we can't write to public Google Sheets without auth)
let evaluationCache = new Map(); // key: "teamName|judgeName", value: evaluation data
let lastCacheUpdate = 0;
const CACHE_DURATION = 30000; // 30 seconds

// Load initial data from Google Sheets into cache
async function initializeCache() {
  try {
    console.log('Loading evaluation data from Google Sheet...');
    const rows = await readGoogleSheet(GOOGLE_SHEETS_CONFIG.EVAL_SHEET_ID, GOOGLE_SHEETS_CONFIG.EVAL_GID);
    evaluationCache.clear();

    let loadedCount = 0;
    for (const row of rows) {
      const teamName = String(row['Team Name'] || row['team name'] || '').trim();
      const judgeName = String(row['Judge Name'] || row['judge name'] || '').trim();

      if (teamName && judgeName) {
        const key = `${teamName}|${judgeName}`;
        const values = {};

        for (const col of EVAL_COLUMNS) {
          if (col === 'Team Name' || col === 'Judge Name') continue;
          // Try both exact match and case-insensitive match
          const colValue = row[col] || row[col.toLowerCase()] || row[col.toUpperCase()] || 0;
          values[col] = Number(colValue) || 0;
        }

        evaluationCache.set(key, values);
        loadedCount++;
      }
    }

    lastCacheUpdate = Date.now();
    console.log(`Cache initialized with ${loadedCount} evaluations from Google Sheet`);
  } catch (error) {
    console.error('Failed to initialize cache:', error);
    console.error('Stack:', error.stack);
  }
}

// Refresh cache if needed
async function refreshCacheIfNeeded() {
  if (Date.now() - lastCacheUpdate > CACHE_DURATION) {
    console.log('Refreshing cache from Google Sheet...');
    await initializeCache();
  }
}

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

// Helper function to properly parse CSV with quoted fields
function parseCSV(csvText) {
  const rows = [];
  let currentRow = [];
  let currentCell = '';
  let insideQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        // Escaped quote
        currentCell += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote state
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      // End of cell
      currentRow.push(currentCell.trim());
      currentCell = '';
    } else if ((char === '\n' || char === '\r') && !insideQuotes) {
      // End of row
      if (char === '\r' && nextChar === '\n') {
        i++; // Skip \n after \r
      }
      currentRow.push(currentCell.trim());
      if (currentRow.some(cell => cell.length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentCell = '';
    } else {
      currentCell += char;
    }
  }

  // Add last cell and row if any
  if (currentCell.length > 0 || currentRow.length > 0) {
    currentRow.push(currentCell.trim());
    if (currentRow.some(cell => cell.length > 0)) {
      rows.push(currentRow);
    }
  }

  return rows;
}

// Helper function to read Google Sheets data using CSV export
async function readGoogleSheet(spreadsheetId, gid) {
  try {
    // Use CSV export URL for public Google Sheets (no API key required)
    const csvUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv&gid=${gid}`;

    console.log(`Reading Google Sheet from: ${csvUrl}`);

    // Use fetch to get CSV data
    const fetch = (await import('node-fetch')).default;
    const response = await fetch(csvUrl);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const csvText = await response.text();

    if (!csvText || csvText.trim().length === 0) {
      console.warn('Empty CSV response from Google Sheet');
      return [];
    }

    // Parse CSV properly handling quoted fields
    const rows = parseCSV(csvText);

    if (rows.length === 0) {
      console.warn('No rows found in CSV');
      return [];
    }

    // Convert to JSON format (first row as headers)
    const headers = rows[0].map(h => String(h || '').trim());
    const data = rows.slice(1).map(row => {
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = String(row[index] || '').trim();
      });
      return obj;
    });

    console.log(`Successfully parsed ${data.length} rows from Google Sheet`);
    if (data.length > 0) {
      console.log(`Headers found: ${headers.join(', ')}`);
    }

    return data;
  } catch (error) {
    console.error('Error reading Google Sheet:', error.message);
    console.error('Stack:', error.stack);
    return [];
  }
}

// Google Sheets API setup
let sheets = null;

async function initializeGoogleSheetsAPI() {
  try {
    // Try to use service account credentials if available
    const auth = new google.auth.GoogleAuth({
      keyFile: './service-account-key.json', // You'll need to create this
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    sheets = google.sheets({ version: 'v4', auth });
    console.log('Google Sheets API initialized with service account');
    return true;
  } catch (error) {
    console.log('Service account not found, using public read-only mode');
    return false;
  }
}

// Helper function to write data to Google Sheets
async function writeEvaluationToSheet(teamName, judgeName, values) {
  if (!sheets) {
    console.log('Google Sheets API not available for writing');
    return false;
  }

  try {
    const spreadsheetId = GOOGLE_SHEETS_CONFIG.EVAL_SHEET_ID;

    // First, try to find existing row
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Sheet1!A:N', // Adjust range as needed
    });

    const rows = response.data.values || [];
    const headers = rows[0] || [];

    // Find existing row for this team/judge combination
    let rowIndex = -1;
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (row[0] === teamName && row[1] === judgeName) {
        rowIndex = i + 1; // 1-based indexing
        break;
      }
    }

    // Prepare the row data
    const rowData = [teamName, judgeName];
    for (const col of EVAL_COLUMNS) {
      if (col === 'Team Name' || col === 'Judge Name') continue;
      rowData.push(values[col] || 0);
    }

    if (rowIndex > 0) {
      // Update existing row
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `Sheet1!A${rowIndex}:N${rowIndex}`,
        valueInputOption: 'RAW',
        resource: {
          values: [rowData]
        }
      });
      console.log(`Updated row ${rowIndex} for ${teamName} by ${judgeName}`);
    } else {
      // Append new row
      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: 'Sheet1!A:N',
        valueInputOption: 'RAW',
        resource: {
          values: [rowData]
        }
      });
      console.log(`Added new row for ${teamName} by ${judgeName}`);
    }

    return true;
  } catch (error) {
    console.error('Error writing to Google Sheet:', error.message);
    return false;
  }
}

// Simple health
app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

// Debug endpoint to test Google Sheets connection
app.get('/api/debug/users-data', async (_req, res) => {
  try {
    console.log('Testing users sheet connection...');
    const rows = await readGoogleSheet(GOOGLE_SHEETS_CONFIG.USERS_SHEET_ID, GOOGLE_SHEETS_CONFIG.USERS_GID);
    console.log('Users sheet data:', rows);
    res.json({
      success: true,
      rowCount: rows.length,
      sampleData: rows.slice(0, 3), // First 3 rows for debugging
      headers: rows.length > 0 ? Object.keys(rows[0]) : []
    });
  } catch (error) {
    console.error('Debug users data error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Submit all evaluations endpoint - saves all scores and marks user as submitted
app.post('/api/submit-all-evaluations', async (req, res) => {
  const { userId, userName, evaluations } = req.body || {};

  if (!userId || !userName || !evaluations) {
    return res.status(400).json({ error: 'userId, userName, and evaluations are required' });
  }

  try {
    console.log('Submit all evaluations request for user:', userName);
    console.log('Number of evaluations:', evaluations.length);

    // Save all evaluations to cache and try to write to Google Sheets
    let allSaved = true;

    for (const eval of evaluations) {
      const { teamName, judgeName, values } = eval;

      // Save to cache
      const key = `${teamName}|${judgeName}`;
      evaluationCache.set(key, values);

      // Try to write to Google Sheets
      const writeSuccess = await writeEvaluationToSheet(teamName, judgeName, values);
      if (!writeSuccess) {
        allSaved = false;
      }
    }

    // Try to update SUBMITTED column to Y
    // Note: This requires Google Sheets API write access
    // For now, we'll just log it
    console.log(`User ${userId} (${userName}) marked as submitted`);
    console.log(`Scores saved to cache. Google Sheets write: ${allSaved ? 'Success' : 'Failed (using cache only)'}`);

    res.json({
      ok: true,
      message: allSaved
        ? 'All evaluations submitted successfully to Google Sheets!'
        : 'Evaluations saved to cache. Please manually update SUBMITTED column in Google Sheet.',
      writtenToSheet: allSaved
    });
  } catch (error) {
    console.error('Submit all evaluations error:', error);
    res.status(500).json({ error: 'Failed to submit evaluations' });
  }
});

// Login endpoint: validate against Google Sheets (username only, no password)
app.post('/api/login', async (req, res) => {
  const { username } = req.body || {};
  if (!username) {
    return res.status(400).json({ error: 'Username is required' });
  }

  try {
    console.log('Login attempt for username:', username);
    const rows = await readGoogleSheet(GOOGLE_SHEETS_CONFIG.USERS_SHEET_ID, GOOGLE_SHEETS_CONFIG.USERS_GID);

    if (!rows || rows.length === 0) {
      console.error('No user data found in Google Sheet');
      return res.status(500).json({ error: 'User data not available. Please check Google Sheet access.' });
    }

    console.log(`Found ${rows.length} user records in sheet`);

    // Find user by USERID (case-insensitive)
    const match = rows.find(r => {
      const sheetUserId = String(r.USERID || r.userid || r.UserId || r.userId || '').trim();
      const inputUsername = String(username).trim();

      return sheetUserId.toLowerCase() === inputUsername.toLowerCase();
    });

    if (!match) {
      console.log('Login failed: User not found');
      return res.status(401).json({ error: 'User not found. Please check your username.' });
    }

    // Extract user data
    const userId = String(match.USERID || match.userid || match.UserId || match.userId || username).trim();
    const name = String(match.NAME || match.name || match.Name || userId).trim();
    const isAdmin = String(match.ISADMIN || match.isadmin || match.IsAdmin || match.isAdmin || 'N').trim().toUpperCase() === 'Y';
    const submitted = String(match.SUBMITTED || match.submitted || match.Submitted || 'N').trim().toUpperCase();

    console.log('Login successful for:', name, '| Admin:', isAdmin, '| Submitted:', submitted);

    res.json({
      token: `user:${userId}`,
      userId: userId,
      name: name,
      isAdmin: isAdmin,
      submitted: submitted === 'Y'
    });
  } catch (error) {
    console.error('Login error:', error);
    console.error('Stack:', error.stack);
    res.status(500).json({ error: 'Login service unavailable. Please try again later.' });
  }
});

// Teams (static)
app.get('/api/teams', (_req, res) => {
  res.json(['Blue', 'Red', 'Green']);
});

// Upsert evaluation for a judge/team
app.post('/api/evaluations', async (req, res) => {
  const {
    teamName,
    judgeName,
    values // object with keys matching EVAL_COLUMNS (except Team Name/Judge Name)
  } = req.body || {};

  if (!teamName || !judgeName || !values) {
    return res.status(400).json({ error: 'teamName, judgeName, and values are required' });
  }

  try {
    // Store in memory cache
    const key = `${teamName}|${judgeName}`;
    const evaluationData = {};

    for (const col of EVAL_COLUMNS) {
      if (col === 'Team Name' || col === 'Judge Name') continue;
      evaluationData[col] = Number(values[col]) || 0;
    }

    evaluationCache.set(key, evaluationData);

    // Try to write to Google Sheets
    const writeSuccess = await writeEvaluationToSheet(teamName, judgeName, evaluationData);

    console.log(`Evaluation saved for ${teamName} by ${judgeName}:`, evaluationData);
    if (writeSuccess) {
      console.log('Successfully written to Google Sheets');
    } else {
      console.log('Saved to memory cache only (Google Sheets write failed)');
    }

    res.json({ ok: true, writtenToSheet: writeSuccess });
  } catch (error) {
    console.error('Evaluation save error:', error);
    res.status(500).json({ error: 'Failed to save evaluation' });
  }
});

// Load evaluation for a judge/team
app.get('/api/evaluation', async (req, res) => {
  const teamName = String(req.query.team || '').trim();
  const judgeName = String(req.query.judge || '').trim();

  if (!teamName || !judgeName) {
    return res.status(400).json({ error: 'team and judge are required' });
  }

  try {
    await refreshCacheIfNeeded();

    const key = `${teamName}|${judgeName}`;
    const cachedData = evaluationCache.get(key);

    if (cachedData) {
      res.json(cachedData);
    } else {
      res.json({});
    }
  } catch (error) {
    console.error('Evaluation load error:', error);
    res.json({});
  }
});

// Get a judge's per-team totals (out of 120)
app.get('/api/judge-scores', async (req, res) => {
  const judge = String(req.query.judge || '').trim();

  if (!judge) {
    return res.status(400).json({ error: 'judge required' });
  }

  try {
    await refreshCacheIfNeeded();

    const byTeam = {};

    for (const [key, values] of evaluationCache.entries()) {
      const [teamName, judgeName] = key.split('|');

      if (judgeName === judge) {
        const total = EVAL_COLUMNS
          .filter(c => !['Team Name', 'Judge Name'].includes(c))
          .reduce((acc, c) => acc + (Number(values[c]) || 0), 0);

        byTeam[teamName] = total;
      }
    }

    res.json(byTeam);
  } catch (error) {
    console.error('Judge scores error:', error);
    res.json({});
  }
});

// Leaderboard: average per team across judges (only count submitted judges)
app.get('/api/leaderboard', async (_req, res) => {
  try {
    await refreshCacheIfNeeded();

    // Get list of users who have submitted
    const usersRows = await readGoogleSheet(GOOGLE_SHEETS_CONFIG.USERS_SHEET_ID, GOOGLE_SHEETS_CONFIG.USERS_GID);
    const submittedUsers = new Set();

    for (const row of usersRows) {
      const userId = String(row.USERID || row.userid || row.UserId || row.userId || '').trim();
      const submitted = String(row.SUBMITTED || row.submitted || row.Submitted || 'N').trim().toUpperCase();
      const name = String(row.NAME || row.name || row.Name || userId).trim();

      if (submitted === 'Y' && userId) {
        submittedUsers.add(name); // Use name as it's used in evaluations
        submittedUsers.add(userId); // Also add userId in case it's used
      }
    }

    console.log('Submitted users:', Array.from(submittedUsers));

    const agg = new Map(); // team -> { sum, count, submittedCount }

    for (const [key, values] of evaluationCache.entries()) {
      const [teamName, judgeName] = key.split('|');

      if (!teamName || !judgeName) continue;

      const total = EVAL_COLUMNS
        .filter(c => !['Team Name', 'Judge Name'].includes(c))
        .reduce((acc, c) => acc + (Number(values[c]) || 0), 0);

      const cur = agg.get(teamName) || { sum: 0, count: 0, submittedCount: 0 };
      cur.sum += total;
      cur.count += 1;

      // Check if this judge has submitted
      if (submittedUsers.has(judgeName)) {
        cur.submittedCount += 1;
      }

      agg.set(teamName, cur);
    }

    // Calculate average based on submitted count, or fall back to total count
    const result = Array.from(agg.entries()).map(([team, { sum, count, submittedCount }]) => {
      const divisor = submittedCount > 0 ? submittedCount : count;
      return {
        team,
        average: divisor ? sum / divisor : 0,
        totalJudges: count,
        submittedJudges: submittedCount
      };
    }).sort((a, b) => b.average - a.average);

    res.json(result);
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.json([]);
  }
});

const PORT = process.env.PORT || 3000;

// Initialize the server
async function startServer() {
  const hasWriteAccess = await initializeGoogleSheetsAPI();
  await initializeCache();

  app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
    console.log('Google Sheets integration enabled');
    console.log(`Login Sheet: https://docs.google.com/spreadsheets/d/${GOOGLE_SHEETS_CONFIG.LOGIN_SHEET_ID}`);
    console.log(`Evaluation Sheet: https://docs.google.com/spreadsheets/d/${GOOGLE_SHEETS_CONFIG.EVAL_SHEET_ID}`);

    if (hasWriteAccess) {
      console.log('✅ Google Sheets write access enabled');
    } else {
      console.log('⚠️  Google Sheets read-only mode (no service account)');
      console.log('   To enable writing to sheets, create service-account-key.json');
    }
  });
}

startServer().catch(console.error);


