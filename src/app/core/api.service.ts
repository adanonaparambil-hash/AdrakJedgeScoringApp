import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export type EvaluationValues = Record<string, number>;

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly baseUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  login(username: string, password: string) {
    return this.http.post<{ token: string; judgeName: string }>(`${this.baseUrl}/login`, { username, password });
  }

  getTeams(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/teams`);
  }

  saveEvaluation(teamName: string, judgeName: string, values: EvaluationValues) {
    return this.http.post<{ ok: boolean }>(`${this.baseUrl}/evaluations`, { teamName, judgeName, values });
  }

  getJudgeScores(judgeName: string) {
    return this.http.get<Record<string, number>>(`${this.baseUrl}/judge-scores`, { params: { judge: judgeName } });
  }

  getLeaderboard() {
    return this.http.get<Array<{ team: string; average: number }>>(`${this.baseUrl}/leaderboard`);
  }

  getEvaluation(teamName: string, judgeName: string) {
    return this.http.get<EvaluationValues>(`${this.baseUrl}/evaluation`, { params: { team: teamName, judge: judgeName } });
  }
}


