const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const xlsx = require('xlsx');

const app = express();
app.use(cors());
app.use(express.json());

const ROOT_DIR = path.resolve(__dirname, '..');
const LOGIN_XLSX = path.join(ROOT_DIR, 'Login_User_Credentials.xlsx');
const EVAL_XLSX = path.join(ROOT_DIR, 'Evaluation_Result.xlsx');

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

function readWorkbook(filePath) {
  if (!fs.existsSync(filePath)) {
    return null;
  }
  return xlsx.readFile(filePath);
}

function sheetToJsonFirstSheet(wb) {
  const sheetName = wb.SheetNames[0];
  const sheet = wb.Sheets[sheetName];
  return xlsx.utils.sheet_to_json(sheet, { defval: '' });
}

function writeRowsToWorkbook(filePath, rows, headers) {
  const ws = xlsx.utils.json_to_sheet(rows, { header: headers });
  const wb = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(wb, ws, 'Sheet1');
  xlsx.writeFile(wb, filePath);
}

// Simple health
app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

// Login endpoint: validate against Login_User_Credentials.xlsx
app.post('/api/login', (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }
  const wb = readWorkbook(LOGIN_XLSX);
  if (!wb) {
    return res.status(500).json({ error: 'Login file not found' });
  }
  const rows = sheetToJsonFirstSheet(wb);
  const match = rows.find(r => String(r.Username).trim() === String(username).trim() && String(r.Password).trim() === String(password).trim());
  if (!match) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  // Use username as judge name for simplicity
  res.json({ token: `judge:${username}`, judgeName: username });
});

// Teams (static)
app.get('/api/teams', (_req, res) => {
  res.json(['Blue', 'Red', 'Green']);
});

// Upsert evaluation for a judge/team
app.post('/api/evaluations', (req, res) => {
  const {
    teamName,
    judgeName,
    values // object with keys matching EVAL_COLUMNS (except Team Name/Judge Name)
  } = req.body || {};

  if (!teamName || !judgeName || !values) {
    return res.status(400).json({ error: 'teamName, judgeName, and values are required' });
  }

  let rows = [];
  const existingWb = readWorkbook(EVAL_XLSX);
  if (existingWb) {
    rows = sheetToJsonFirstSheet(existingWb);
  }

  const idx = rows.findIndex(r => String(r['Team Name']).trim() === String(teamName).trim() && String(r['Judge Name']).trim() === String(judgeName).trim());
  const rowBase = { 'Team Name': teamName, 'Judge Name': judgeName };
  const newRow = { ...rowBase };
  for (const col of EVAL_COLUMNS) {
    if (col in rowBase) continue;
    newRow[col] = Number(values[col]) || 0;
  }
  if (idx >= 0) {
    rows[idx] = { ...rows[idx], ...newRow };
  } else {
    rows.push(newRow);
  }
  writeRowsToWorkbook(EVAL_XLSX, rows, EVAL_COLUMNS);
  res.json({ ok: true });
});

// Load evaluation for a judge/team
app.get('/api/evaluation', (req, res) => {
  const teamName = String(req.query.team || '').trim();
  const judgeName = String(req.query.judge || '').trim();
  if (!teamName || !judgeName) return res.status(400).json({ error: 'team and judge are required' });
  const wb = readWorkbook(EVAL_XLSX);
  if (!wb) return res.json({});
  const rows = sheetToJsonFirstSheet(wb);
  const row = rows.find(r => String(r['Team Name']).trim() === teamName && String(r['Judge Name']).trim() === judgeName);
  if (!row) return res.json({});
  const values = {};
  for (const col of EVAL_COLUMNS) {
    if (col === 'Team Name' || col === 'Judge Name') continue;
    values[col] = Number(row[col]) || 0;
  }
  res.json(values);
});

// Get a judge's per-team totals (out of 120)
app.get('/api/judge-scores', (req, res) => {
  const judge = String(req.query.judge || '').trim();
  if (!judge) return res.status(400).json({ error: 'judge required' });
  const wb = readWorkbook(EVAL_XLSX);
  if (!wb) return res.json({});
  const rows = sheetToJsonFirstSheet(wb);
  const byTeam = {};
  for (const r of rows) {
    if (String(r['Judge Name']).trim() !== judge) continue;
    const total = EVAL_COLUMNS
      .filter(c => !['Team Name', 'Judge Name'].includes(c))
      .reduce((acc, c) => acc + (Number(r[c]) || 0), 0);
    byTeam[String(r['Team Name']).trim()] = total;
  }
  res.json(byTeam);
});

// Leaderboard: average per team across judges
app.get('/api/leaderboard', (_req, res) => {
  const wb = readWorkbook(EVAL_XLSX);
  if (!wb) return res.json([]);
  const rows = sheetToJsonFirstSheet(wb);
  const agg = new Map(); // team -> { sum, count }
  for (const r of rows) {
    const team = String(r['Team Name']).trim();
    const total = EVAL_COLUMNS
      .filter(c => !['Team Name', 'Judge Name'].includes(c))
      .reduce((acc, c) => acc + (Number(r[c]) || 0), 0);
    const cur = agg.get(team) || { sum: 0, count: 0 };
    cur.sum += total;
    cur.count += 1;
    agg.set(team, cur);
  }
  const result = Array.from(agg.entries()).map(([team, { sum, count }]) => ({
    team,
    average: count ? sum / count : 0
  })).sort((a, b) => b.average - a.average);
  res.json(result);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});


