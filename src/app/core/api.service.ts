import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map, of, catchError, from, switchMap } from 'rxjs';
import * as KJUR from 'jsrsasign';
import serviceAccount from '../../service-account-key.json';

export type EvaluationValues = Record<string, number>;

export interface LoginResponse {
  token: string;
  userId: string;
  name: string;
  isAdmin: boolean;
  submitted: boolean;
}

export interface LeaderboardEntry {
  team: string;
  average: number;
  totalJudges?: number;
  submittedJudges?: number;
}

export interface JudgeScore {
  judgeName: string;
  score: number;
  submitted: boolean;
  isAdmin: boolean;
}

export interface TeamJudgeScoresResponse {
  scores: JudgeScore[];
  totalNonAdminJudges: number;
  submittedCount: number;
}

interface UserRow {
  USERID: string;
  NAME: string;
  SUBMITTED: string;
  ISADMIN: string;
}

interface EvaluationRow {
  'Team Name': string;
  'Judge Name': string;
  [key: string]: string;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  // Google Sheets configuration
  private readonly USERS_SHEET_ID = '1jLyGbkHE_fopA1QwYHsvezRZeNBu4ylXTiVQol0QNDQ';
  private readonly EVAL_SHEET_ID = '1aYLnFkq969TOuQ2b0hY6jS2neCf5CHeV-En78QmARf4';

  private readonly SHEETS_API_BASE = 'https://sheets.googleapis.com/v4/spreadsheets';
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  private readonly EVAL_COLUMNS = [
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

  // In-memory cache for evaluations
  private evaluationCache: Map<string, EvaluationValues> = new Map();

  constructor(private http: HttpClient) { }

  // Get OAuth2 access token using service account
  private getAccessToken(): Observable<string> {
    // Check if token is still valid
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return of(this.accessToken);
    }

    // Create JWT for service account using jsrsasign
    const now = Math.floor(Date.now() / 1000);

    const header = { alg: 'RS256', typ: 'JWT' };
    const payload = {
      iss: serviceAccount.client_email,
      scope: 'https://www.googleapis.com/auth/spreadsheets',
      aud: 'https://oauth2.googleapis.com/token',
      exp: now + 3600,
      iat: now
    };

    // Sign JWT with private key
    const sHeader = JSON.stringify(header);
    const sPayload = JSON.stringify(payload);
    const jwt = (KJUR as any).jws.JWS.sign('RS256', sHeader, sPayload, serviceAccount.private_key);

    // Exchange JWT for access token
    const body = new URLSearchParams();
    body.set('grant_type', 'urn:ietf:params:oauth:grant-type:jwt-bearer');
    body.set('assertion', jwt);

    return this.http.post<{ access_token: string; expires_in: number }>(
      'https://oauth2.googleapis.com/token',
      body.toString(),
      {
        headers: new HttpHeaders({
          'Content-Type': 'application/x-www-form-urlencoded'
        })
      }
    ).pipe(
      map(response => {
        this.accessToken = response.access_token;
        this.tokenExpiry = Date.now() + (response.expires_in * 1000) - 60000; // 1 min buffer
        console.log('✅ Access token obtained successfully');
        return this.accessToken;
      }),
      catchError(error => {
        console.error('❌ Error getting access token:', error);
        throw error;
      })
    );
  }

  // Fetch data from Google Sheets API
  private fetchSheetData(sheetId: string, range: string): Observable<any[][]> {
    return this.getAccessToken().pipe(
      switchMap(token => {
        const url = `${this.SHEETS_API_BASE}/${sheetId}/values/${range}`;
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`
        });

        return this.http.get<{ values: any[][] }>(url, { headers });
      }),
      map(response => response.values || []),
      catchError(error => {
        console.error('Error fetching sheet data:', error);
        return of([]);
      })
    );
  }

  // Append data to Google Sheets
  private appendToSheet(sheetId: string, range: string, values: any[][]): Observable<any> {
    return this.getAccessToken().pipe(
      switchMap(token => {
        const url = `${this.SHEETS_API_BASE}/${sheetId}/values/${range}:append?valueInputOption=RAW`;
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        });

        return this.http.post(url, { values }, { headers });
      }),
      catchError(error => {
        console.error('Error appending to sheet:', error);
        throw error;
      })
    );
  }

  // Update data in Google Sheets
  private updateSheet(sheetId: string, range: string, values: any[][]): Observable<any> {
    return this.getAccessToken().pipe(
      switchMap(token => {
        const url = `${this.SHEETS_API_BASE}/${sheetId}/values/${range}?valueInputOption=RAW`;
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        });

        return this.http.put(url, { values }, { headers });
      }),
      catchError(error => {
        console.error('Error updating sheet:', error);
        throw error;
      })
    );
  }

  // Convert sheet data to objects
  private parseSheetData(data: any[][]): any[] {
    if (data.length === 0) return [];

    const headers = data[0];
    console.log('🔤 Parsing sheet - Headers:', headers);
    console.log('🔤 Header details:', headers.map((h: string, i: number) => `[${i}]: "${h}" (length: ${h?.length})`));

    const rows: any[] = [];

    for (let i = 1; i < data.length; i++) {
      const row: any = {};
      headers.forEach((header: string, index: number) => {
        row[header] = data[i][index] || '';
      });
      rows.push(row);
    }

    return rows;
  }

  // Login by checking Users Sheet
  login(username: string): Observable<LoginResponse> {
    return this.fetchSheetData(this.USERS_SHEET_ID, 'Sheet1!A:D').pipe(
      map(data => {
        console.log('📋 Raw sheet data:', data);

        if (data.length === 0) {
          throw new Error('Users sheet is empty');
        }

        // Log headers to see exact column names
        console.log('📊 Sheet headers:', data[0]);

        const rows = this.parseSheetData(data) as UserRow[];
        console.log('👥 Parsed users:', rows);

        const user = rows.find(r =>
          (r.USERID || '').toLowerCase() === username.toLowerCase()
        );

        if (!user) {
          throw new Error('User not found. Please check your User ID.');
        }

        console.log('✅ Found user:', user);
        console.log('🔍 User properties:', {
          USERID: user.USERID,
          NAME: user.NAME,
          SUBMITTED: user.SUBMITTED,
          ISADMIN: user.ISADMIN,
          allKeys: Object.keys(user)
        });

        const userId = user.USERID || username;
        const name = user.NAME || userId;
        const isAdmin = (user.ISADMIN || 'N').toUpperCase() === 'Y';
        const submitted = (user.SUBMITTED || 'N').toUpperCase() === 'Y';

        console.log('🎯 Final values:', { userId, name, isAdmin, submitted });

        return {
          token: `user:${userId}`,
          userId,
          name,
          isAdmin,
          submitted
        };
      })
    );
  }

  // Submit evaluation - directly to Google Sheets API
  submitEvaluation(userId: string, userName: string, allScores: Map<string, EvaluationValues>): Observable<{ ok: boolean; message: string }> {
    // Prepare rows to append
    const rows: any[][] = [];

    allScores.forEach((values, team) => {
      const row: any[] = [team, userName];
      this.EVAL_COLUMNS.forEach(col => {
        row.push(values[col] || 0);
      });
      rows.push(row);
    });

    console.log('📤 Submitting to Google Sheets API');
    console.log('📊 Data:', rows);

    return this.appendToSheet(this.EVAL_SHEET_ID, 'Sheet1!A:Z', rows).pipe(
      switchMap(() => {
        // Mark user as submitted
        return this.markUserAsSubmitted(userId);
      }),
      map(() => {
        console.log('✅ Submission successful');

        // Save to localStorage as backup
        allScores.forEach((values, team) => {
          const key = `${team}|${userName}`;
          this.evaluationCache.set(key, values);
        });
        const cacheData = JSON.stringify(Array.from(this.evaluationCache.entries()));
        localStorage.setItem('evaluationCache', cacheData);

        return {
          ok: true,
          message: 'Evaluations submitted successfully to Google Sheets!'
        };
      }),
      catchError(error => {
        console.error('❌ Google Sheets API error:', error);
        return of({
          ok: false,
          message: 'Failed to submit to Google Sheets. Please try again.'
        });
      })
    );
  }

  // Mark user as submitted in Users sheet
  private markUserAsSubmitted(userId: string): Observable<any> {
    // First, get all users to find the row
    return this.fetchSheetData(this.USERS_SHEET_ID, 'Sheet1!A:D').pipe(
      switchMap(data => {
        const rows = data;
        let rowIndex = -1;

        for (let i = 1; i < rows.length; i++) {
          if (rows[i][0] === userId) {
            rowIndex = i + 1; // +1 because sheets are 1-indexed
            break;
          }
        }

        if (rowIndex === -1) {
          console.error('User not found in sheet');
          localStorage.setItem(`submitted_${userId}`, 'true');
          return of({ ok: false });
        }

        // Update the SUBMITTED column (column C, index 2)
        const range = `Sheet1!C${rowIndex}`;
        return this.updateSheet(this.USERS_SHEET_ID, range, [['Y']]).pipe(
          map(() => {
            localStorage.setItem(`submitted_${userId}`, 'true');
            return { ok: true };
          })
        );
      }),
      catchError(error => {
        console.error('Failed to mark user as submitted:', error);
        localStorage.setItem(`submitted_${userId}`, 'true');
        return of({ ok: false });
      })
    );
  }

  // Get teams (hardcoded for now)
  getTeams(): Observable<string[]> {
    return of(['Blue', 'Red', 'Green']);
  }

  // Save evaluation to cache
  saveEvaluation(teamName: string, judgeName: string, values: EvaluationValues): Observable<{ ok: boolean }> {
    const key = `${teamName}|${judgeName}`;
    this.evaluationCache.set(key, values);

    // Store in localStorage for persistence
    const cacheData = JSON.stringify(Array.from(this.evaluationCache.entries()));
    localStorage.setItem('evaluationCache', cacheData);

    return of({ ok: true });
  }

  // Get judge's scores for all teams
  getJudgeScores(judgeName: string): Observable<Record<string, number>> {
    return this.fetchSheetData(this.EVAL_SHEET_ID, 'Sheet1!A:Z').pipe(
      map(data => {
        const rows = this.parseSheetData(data) as EvaluationRow[];
        const scores: Record<string, number> = {};

        rows.forEach(row => {
          const team = row['Team Name'];
          const judge = row['Judge Name'];

          if (judge === judgeName && team) {
            let total = 0;
            this.EVAL_COLUMNS.forEach(col => {
              total += Number(row[col]) || 0;
            });
            scores[team] = total;
          }
        });

        // Merge with cached data
        this.loadCacheFromLocalStorage();
        this.evaluationCache.forEach((values, key) => {
          const [team, judge] = key.split('|');
          if (judge === judgeName) {
            const total = Object.values(values).reduce((sum, val) => sum + (Number(val) || 0), 0);
            scores[team] = total;
          }
        });

        return scores;
      })
    );
  }

  // Get leaderboard (only count non-admin judges where ISADMIN = N)
  getLeaderboard(): Observable<LeaderboardEntry[]> {
    return this.fetchSheetData(this.EVAL_SHEET_ID, 'Sheet1!A:Z').pipe(
      switchMap(evalData => {
        const rows = this.parseSheetData(evalData) as EvaluationRow[];

        // Get users to identify non-admin judges
        return this.fetchSheetData(this.USERS_SHEET_ID, 'Sheet1!A:D').pipe(
          map(userData => {
            const userRows = this.parseSheetData(userData) as UserRow[];

            // Get non-admin judges (ISADMIN = N)
            const nonAdminJudges = new Set(
              userRows
                .filter(u => (u.ISADMIN || 'N').toUpperCase() === 'N')
                .map(u => u.NAME || u.USERID)
            );

            // Get submitted non-admin judges
            const submittedNonAdminJudges = new Set(
              userRows
                .filter(u =>
                  (u.ISADMIN || 'N').toUpperCase() === 'N' &&
                  (u.SUBMITTED || 'N').toUpperCase() === 'Y'
                )
                .map(u => u.NAME || u.USERID)
            );

            console.log('👥 Non-admin judges (ISADMIN=N):', Array.from(nonAdminJudges));
            console.log('✅ Submitted non-admin judges (ISADMIN=N & SUBMITTED=Y):', Array.from(submittedNonAdminJudges));

            const teamScores = new Map<string, { sum: number; count: number; submittedCount: number }>();

            // Load cache
            this.loadCacheFromLocalStorage();

            // Process sheet data - only count non-admin judges with SUBMITTED = Y
            rows.forEach(row => {
              const team = row['Team Name'];
              const judge = row['Judge Name'];

              if (!team || !judge) return;

              // Skip if judge is admin
              if (!nonAdminJudges.has(judge)) {
                console.log(`⏭️ Skipping ${judge} for ${team} - Admin`);
                return;
              }

              // Only count if judge has SUBMITTED = Y
              if (!submittedNonAdminJudges.has(judge)) {
                console.log(`⏭️ Skipping ${judge} for ${team} - Not submitted`);
                return;
              }

              let total = 0;
              this.EVAL_COLUMNS.forEach(col => {
                total += Number(row[col]) || 0;
              });

              console.log(`✅ Adding ${judge} score for ${team}: ${total}`);

              const current = teamScores.get(team) || { sum: 0, count: 0, submittedCount: 0 };
              current.sum += total;
              current.count += 1;
              current.submittedCount += 1;
              teamScores.set(team, current);
            });

            // Process cached data - only count non-admin judges with SUBMITTED = Y
            this.evaluationCache.forEach((values, key) => {
              const [team, judge] = key.split('|');
              if (!team || !judge) return;

              // Skip if judge is admin
              if (!nonAdminJudges.has(judge)) return;

              // Only count if judge has SUBMITTED = Y
              if (!submittedNonAdminJudges.has(judge)) return;

              const total = Object.values(values).reduce((sum, val) => sum + (Number(val) || 0), 0);
              const current = teamScores.get(team) || { sum: 0, count: 0, submittedCount: 0 };
              current.sum += total;
              current.count += 1;
              current.submittedCount += 1;
              teamScores.set(team, current);
            });

            // Calculate averages: Total Sum / Count of (ISADMIN = N AND SUBMITTED = Y)
            const result: LeaderboardEntry[] = [];
            teamScores.forEach((data, team) => {
              const average = data.count > 0 ? data.sum / data.count : 0;

              console.log(`📊 ${team} Team Calculation:`, {
                sum: data.sum,
                count: data.count,
                average: average,
                formula: `${data.sum} / ${data.count} = ${average}`
              });

              // Since we only counted submitted judges, count = submittedCount
              result.push({
                team,
                average: average,
                totalJudges: data.count,
                submittedJudges: data.submittedCount
              });
            });

            return result.sort((a, b) => b.average - a.average);
          })
        );
      }),
      catchError(() => of([]))
    );
  }

  // Get individual judge scores for a specific team
  getTeamJudgeScores(teamName: string): Observable<TeamJudgeScoresResponse> {
    return this.fetchSheetData(this.EVAL_SHEET_ID, 'Sheet1!A:Z').pipe(
      switchMap(evalData => {
        const rows = this.parseSheetData(evalData) as EvaluationRow[];

        // Get user info to determine admin status and submission status
        return this.fetchSheetData(this.USERS_SHEET_ID, 'Sheet1!A:D').pipe(
          map(userData => {
            const userRows = this.parseSheetData(userData) as UserRow[];
            const userMap = new Map<string, { isAdmin: boolean; submitted: boolean }>();

            // Count total non-admin judges (ISADMIN = N)
            let totalNonAdminJudges = 0;

            userRows.forEach(u => {
              const name = u.NAME || u.USERID;
              const isAdmin = (u.ISADMIN || 'N').toUpperCase() === 'Y';
              const submitted = (u.SUBMITTED || 'N').toUpperCase() === 'Y';

              userMap.set(name, { isAdmin, submitted });

              // Count non-admin judges
              if (!isAdmin) {
                totalNonAdminJudges++;
              }
            });

            const judgeScores: JudgeScore[] = [];

            // Load cache
            this.loadCacheFromLocalStorage();

            // Process sheet data
            rows.forEach(row => {
              const team = row['Team Name'];
              const judge = row['Judge Name'];

              if (team === teamName && judge) {
                let total = 0;
                this.EVAL_COLUMNS.forEach(col => {
                  total += Number(row[col]) || 0;
                });

                const userInfo = userMap.get(judge) || { isAdmin: false, submitted: false };
                judgeScores.push({
                  judgeName: judge,
                  score: total,
                  submitted: userInfo.submitted,
                  isAdmin: userInfo.isAdmin
                });
              }
            });

            // Process cached data
            this.evaluationCache.forEach((values, key) => {
              const [team, judge] = key.split('|');
              if (team === teamName && judge) {
                // Check if already added from sheet
                if (!judgeScores.find(j => j.judgeName === judge)) {
                  const total = Object.values(values).reduce((sum, val) => sum + (Number(val) || 0), 0);
                  const userInfo = userMap.get(judge) || { isAdmin: false, submitted: false };
                  judgeScores.push({
                    judgeName: judge,
                    score: total,
                    submitted: userInfo.submitted,
                    isAdmin: userInfo.isAdmin
                  });
                }
              }
            });

            // Count submitted judges for this team
            const submittedCount = judgeScores.filter(j => j.submitted).length;

            // Sort by score descending
            const sortedScores = judgeScores.sort((a, b) => b.score - a.score);

            return {
              scores: sortedScores,
              totalNonAdminJudges,
              submittedCount
            };
          })
        );
      }),
      catchError(() => of({ scores: [], totalNonAdminJudges: 0, submittedCount: 0 }))
    );
  }

  // Get evaluation for a specific team and judge
  getEvaluation(teamName: string, judgeName: string): Observable<EvaluationValues> {
    // First check cache
    this.loadCacheFromLocalStorage();
    const key = `${teamName}|${judgeName}`;
    const cached = this.evaluationCache.get(key);

    if (cached) {
      return of(cached);
    }

    // Then check Google Sheet
    return this.fetchSheetData(this.EVAL_SHEET_ID, 'Sheet1!A:Z').pipe(
      map(data => {
        const rows = this.parseSheetData(data) as EvaluationRow[];
        const row = rows.find(r =>
          r['Team Name'] === teamName && r['Judge Name'] === judgeName
        );

        if (!row) {
          return {};
        }

        const values: EvaluationValues = {};
        this.EVAL_COLUMNS.forEach(col => {
          values[col] = Number(row[col]) || 0;
        });

        // Cache it
        this.evaluationCache.set(key, values);
        return values;
      }),
      catchError(() => of({}))
    );
  }

  // Load cache from localStorage
  private loadCacheFromLocalStorage(): void {
    try {
      const cacheData = localStorage.getItem('evaluationCache');
      if (cacheData) {
        const entries = JSON.parse(cacheData);
        this.evaluationCache = new Map(entries);
      }
    } catch (error) {
      console.error('Error loading cache:', error);
    }
  }
}


