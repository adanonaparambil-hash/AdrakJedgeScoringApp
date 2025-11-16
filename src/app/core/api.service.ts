import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, of, catchError } from 'rxjs';

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
  // Google Sheets CSV export URLs
  private readonly USERS_SHEET_URL = 'https://docs.google.com/spreadsheets/d/1iKFh699K_TapsbUG539bvUG7rYvNN0eA/export?format=csv&gid=1017169916';
  private readonly EVAL_SHEET_URL = 'https://docs.google.com/spreadsheets/d/1e8_bLRJqe6m9vAnc6Jmx6pam1NoJT6nI/export?format=csv&gid=1688314091';

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

  // Parse CSV text to array of objects
  private parseCSV(csvText: string): any[] {
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length === 0) return [];

    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    const data: any[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
      const row: any = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      data.push(row);
    }

    return data;
  }

  // Fetch and parse Google Sheet
  private fetchSheet(url: string): Observable<any[]> {
    return this.http.get(url, { responseType: 'text' }).pipe(
      map(csvText => this.parseCSV(csvText)),
      catchError(error => {
        console.error('Error fetching sheet:', error);
        return of([]);
      })
    );
  }

  // Login by checking Users Sheet
  login(username: string): Observable<LoginResponse> {
    return this.fetchSheet(this.USERS_SHEET_URL).pipe(
      map((rows: UserRow[]) => {
        const user = rows.find(r =>
          (r.USERID || '').toLowerCase() === username.toLowerCase()
        );

        if (!user) {
          throw new Error('User not found. Please check your User ID.');
        }

        const userId = user.USERID || username;
        const name = user.NAME || userId;
        const isAdmin = (user.ISADMIN || 'N').toUpperCase() === 'Y';
        const submitted = (user.SUBMITTED || 'N').toUpperCase() === 'Y';

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

  // Submit evaluation - save all scores to Google Sheets and mark as submitted
  submitEvaluation(userId: string, userName: string, allScores: Map<string, EvaluationValues>): Observable<{ ok: boolean; message: string }> {
    // ⚠️ IMPORTANT: Replace this URL with your Google Apps Script Web App URL
    // Follow the guide in GOOGLE_APPS_SCRIPT_SETUP.md to get your URL
    const GOOGLE_APPS_SCRIPT_URL = '103484491137456818689';
    
    // Check if URL is configured
    if (GOOGLE_APPS_SCRIPT_URL === '103484491137456818689') {
      console.error('❌ Google Apps Script URL not configured!');
      console.error('📖 Please follow GOOGLE_APPS_SCRIPT_SETUP.md to:');
      console.error('   1. Create Google Apps Script');
      console.error('   2. Deploy as Web App');
      console.error('   3. Copy the URL');
      console.error('   4. Replace GOOGLE_APPS_SCRIPT_URL in api.service.ts');
      
      return of({
        ok: false,
        message: '⚠️ Google Apps Script URL not configured. Please check the console and follow GOOGLE_APPS_SCRIPT_SETUP.md'
      });
    }

    // Prepare data for submission
    const evaluations: any[] = [];
    allScores.forEach((values, team) => {
      evaluations.push({
        teamName: team,
        judgeName: userName,
        values: values
      });
    });

    const payload = {
      userId,
      userName,
      evaluations
    };

    console.log('📤 Submitting to Google Apps Script:', GOOGLE_APPS_SCRIPT_URL);
    console.log('📊 Data:', payload);

    return this.http.post<{ ok: boolean; message: string }>(GOOGLE_APPS_SCRIPT_URL, payload).pipe(
      map(response => {
        console.log('✅ Submission successful:', response);
        return response;
      }),
      catchError(error => {
        console.error('❌ Submit error:', error);
        console.error('📖 Troubleshooting:');
        console.error('   1. Check if Google Apps Script is deployed');
        console.error('   2. Verify URL is correct');
        console.error('   3. Check Apps Script permissions');
        console.error('   4. See GOOGLE_APPS_SCRIPT_SETUP.md for help');
        
        return of({
          ok: false,
          message: 'Failed to submit. Please check console for details and verify Google Apps Script setup.'
        });
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
    return this.fetchSheet(this.EVAL_SHEET_URL).pipe(
      map((rows: EvaluationRow[]) => {
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

  // Get leaderboard
  getLeaderboard(): Observable<LeaderboardEntry[]> {
    return this.fetchSheet(this.EVAL_SHEET_URL).pipe(
      map((rows: EvaluationRow[]) => {
        // Also get submitted users
        return this.fetchSheet(this.USERS_SHEET_URL).pipe(
          map((userRows: UserRow[]) => {
            const submittedUsers = new Set(
              userRows
                .filter(u => (u.SUBMITTED || 'N').toUpperCase() === 'Y')
                .map(u => u.NAME || u.USERID)
            );

            const teamScores = new Map<string, { sum: number; count: number; submittedCount: number }>();

            // Load cache
            this.loadCacheFromLocalStorage();

            // Process sheet data
            rows.forEach(row => {
              const team = row['Team Name'];
              const judge = row['Judge Name'];

              if (!team || !judge) return;

              let total = 0;
              this.EVAL_COLUMNS.forEach(col => {
                total += Number(row[col]) || 0;
              });

              const current = teamScores.get(team) || { sum: 0, count: 0, submittedCount: 0 };
              current.sum += total;
              current.count += 1;
              if (submittedUsers.has(judge)) {
                current.submittedCount += 1;
              }
              teamScores.set(team, current);
            });

            // Process cached data
            this.evaluationCache.forEach((values, key) => {
              const [team, judge] = key.split('|');
              if (!team || !judge) return;

              const total = Object.values(values).reduce((sum, val) => sum + (Number(val) || 0), 0);
              const current = teamScores.get(team) || { sum: 0, count: 0, submittedCount: 0 };
              current.sum += total;
              current.count += 1;
              if (submittedUsers.has(judge)) {
                current.submittedCount += 1;
              }
              teamScores.set(team, current);
            });

            // Calculate averages
            const result: LeaderboardEntry[] = [];
            teamScores.forEach((data, team) => {
              const divisor = data.submittedCount > 0 ? data.submittedCount : data.count;
              result.push({
                team,
                average: divisor > 0 ? data.sum / divisor : 0,
                totalJudges: data.count,
                submittedJudges: data.submittedCount
              });
            });

            return result.sort((a, b) => b.average - a.average);
          })
        );
      }),
      // Flatten the nested observable
      map(obs => obs),
      catchError(() => of([]))
    ) as any;
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
    return this.fetchSheet(this.EVAL_SHEET_URL).pipe(
      map((rows: EvaluationRow[]) => {
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


