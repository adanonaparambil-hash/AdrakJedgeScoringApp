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
  EVAL_RANGE: 'Sheet1!A:N', // Adjust range as needed
  
  // Login Credentials Sheet  
  LOGIN_SHEET_ID: '1iKFh699K_TapsbUG539bvUG7rYvNN0eA',
  LOGIN_RANGE: 'Sheet1!A:C', // Adjust range as needed
};

// Initialize Google Sheets API (using public sheets - no auth needed for public sheets)
const sheets = google.sheets('v4');

// In-memory cache for evaluation data (since we can't write to public Google Sheets without auth)
let evaluationCache = new Map(); // key: "teamName|judgeName", value: evaluation data
let lastCacheUpdate = 0;
const CACHE_DURATION = 30000; // 30 seconds

// Load initial data from Google Sheets into cache
async function initializeCache() {
  try {
    const rows = await readGoogleSheet(GOOGLE_SHEETS_CONFIG.EVAL_SHEET_ID, GOOGLE_SHEETS_CONFIG.EVAL_RANGE);
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

// Helper function to read Google Sheets data
async function readGoogleSheet(spreadsheetId, range) {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
      key: process.env.GOOGLE_API_KEY, // Optional: for rate limiting, but public sheets work without it
    });
    
    const rows = response.data.values || [];
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

// Helper function to write data to Google Sheets
async function writeGoogleSheet(spreadsheetId, range, values) {
  try {
    // For public sheets, we can't write directly without authentication
    // This would require service account credentials or OAuth
    // For now, we'll simulate the write operation
    console.log('Write operation to Google Sheets (simulated):', { spreadsheetId, range, values });
    return true;
  } catch (error) {
    console.error('Error writing to Google Sheet:', error.message);
    return false;
  }
}

// Helper function to append data to Google Sheets
async function appendGoogleSheet(spreadsheetId, range, values) {
  try {
    // For public sheets, we can't append directly without authentication
    // This would require service account credentials or OAuth
    console.log('Append operation to Google Sheets (simulated):', { spreadsheetId, range, values });
    return true;
  } catch (error) {
    console.error('Error appending to Google Sheet:', error.message);
    return false;
  }
}

// Simple health
app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

// Login endpoint: validate against Google Sheets
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }
  
  try {
    const rows = await readGoogleSheet(GOOGLE_SHEETS_CONFIG.LOGIN_SHEET_ID, GOOGLE_SHEETS_CONFIG.LOGIN_RANGE);
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
    // Store in memory cache (since we can't write to public Google Sheets without authentication)
    const key = `${teamName}|${judgeName}`;
    const evaluationData = {};
    
    for (const col of EVAL_COLUMNS) {
      if (col === 'Team Name' || col === 'Judge Name') continue;
      evaluationData[col] = Number(values[col]) || 0;
    }
    
    evaluationCache.set(key, evaluationData);
    
    console.log(`Evaluation saved for ${teamName} by ${judgeName}:`, evaluationData);
    
    res.json({ ok: true });
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
  await initializeCache();
  
  app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
    console.log('Google Sheets integration enabled');
    console.log(`Login Sheet: https://docs.google.com/spreadsheets/d/${GOOGLE_SHEETS_CONFIG.LOGIN_SHEET_ID}`);
    console.log(`Evaluation Sheet: https://docs.google.com/spreadsheets/d/${GOOGLE_SHEETS_CONFIG.EVAL_SHEET_ID}`);
  });
}

startServer().catch(console.error);


