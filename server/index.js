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

  // Login Credentials Sheet  
  LOGIN_SHEET_ID: '1iKFh699K_TapsbUG539bvUG7rYvNN0eA',
  LOGIN_GID: '1017169916', // From the URL gid parameter
};

// In-memory cache for evaluation data (since we can't write to public Google Sheets without auth)
let evaluationCache = new Map(); // key: "teamName|judgeName", value: evaluation data
let lastCacheUpdate = 0;
const CACHE_DURATION = 30000; // 30 seconds

// Load initial data from Google Sheets into cache
async function initializeCache() {
  try {
    const rows = await readGoogleSheet(GOOGLE_SHEETS_CONFIG.EVAL_SHEET_ID, GOOGLE_SHEETS_CONFIG.EVAL_GID);
    evaluationCache.clear();

    for (const row of rows) {
      const teamName = String(row['Team Name'] || '').trim();
      const judgeName = String(row['Judge Name'] || '').trim();

      if (teamName && judgeName) {
        const key = `${teamName}|${judgeName}`;
        const values = {};

        for (const col of EVAL_COLUMNS) {
          if (col === 'Team Name' || col === 'Judge Name') continue;
          values[col] = Number(row[col]) || 0;
        }

        evaluationCache.set(key, values);
      }
    }

    lastCacheUpdate = Date.now();
    console.log(`Cache initialized with ${evaluationCache.size} evaluations`);
  } catch (error) {
    console.error('Failed to initialize cache:', error);
  }
}

// Refresh cache if needed
async function refreshCacheIfNeeded() {
  if (Date.now() - lastCacheUpdate > CACHE_DURATION) {
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

// Helper function to read Google Sheets data using CSV export
async function readGoogleSheet(spreadsheetId, gid) {
  try {
    // Use CSV export URL for public Google Sheets (no API key required)
    const csvUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv&gid=${gid}`;

    // Use fetch to get CSV data
    const fetch = (await import('node-fetch')).default;
    const response = await fetch(csvUrl);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const csvText = await response.text();
    const rows = csvText.split('\n').map(row =>
      row.split(',').map(cell => cell.replace(/^"|"$/g, '').trim())
    ).filter(row => row.some(cell => cell.length > 0));

    if (rows.length === 0) return [];

    // Convert to JSON format (first row as headers)
    const headers = rows[0];
    const data = rows.slice(1).map(row => {
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = row[index] || '';
      });
      return obj;
    });

    return data;
  } catch (error) {
    console.error('Error reading Google Sheet:', error.message);
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
app.get('/api/debug/login-data', async (_req, res) => {
  try {
    console.log('Testing login sheet connection...');
    const rows = await readGoogleSheet(GOOGLE_SHEETS_CONFIG.LOGIN_SHEET_ID, GOOGLE_SHEETS_CONFIG.LOGIN_GID);
    console.log('Login sheet data:', rows);
    res.json({
      success: true,
      rowCount: rows.length,
      sampleData: rows.slice(0, 3), // First 3 rows for debugging
      headers: rows.length > 0 ? Object.keys(rows[0]) : []
    });
  } catch (error) {
    console.error('Debug login data error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Login endpoint: validate against Google Sheets
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    const rows = await readGoogleSheet(GOOGLE_SHEETS_CONFIG.LOGIN_SHEET_ID, GOOGLE_SHEETS_CONFIG.LOGIN_GID);
    if (!rows || rows.length === 0) {
      return res.status(500).json({ error: 'Login data not available' });
    }

    const match = rows.find(r =>
      String(r.Username || '').trim() === String(username).trim() &&
      String(r.Password || '').trim() === String(password).trim()
    );

    if (!match) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Use username as judge name for simplicity
    res.json({ token: `judge:${username}`, judgeName: username });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login service unavailable' });
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

// Leaderboard: average per team across judges
app.get('/api/leaderboard', async (_req, res) => {
  try {
    await refreshCacheIfNeeded();

    const agg = new Map(); // team -> { sum, count }

    for (const [key, values] of evaluationCache.entries()) {
      const [teamName] = key.split('|');

      if (!teamName) continue;

      const total = EVAL_COLUMNS
        .filter(c => !['Team Name', 'Judge Name'].includes(c))
        .reduce((acc, c) => acc + (Number(values[c]) || 0), 0);

      const cur = agg.get(teamName) || { sum: 0, count: 0 };
      cur.sum += total;
      cur.count += 1;
      agg.set(teamName, cur);
    }

    const result = Array.from(agg.entries()).map(([team, { sum, count }]) => ({
      team,
      average: count ? sum / count : 0
    })).sort((a, b) => b.average - a.average);

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


