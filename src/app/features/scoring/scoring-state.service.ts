import { Injectable } from '@angular/core';
import { EvaluationValues } from '../../core/api.service';

type Team = string;

@Injectable({ providedIn: 'root' })
export class ScoringStateService {
  private cache: Record<string, Record<Team, EvaluationValues>> = {};
  private readonly STORAGE_KEY = 'scoring_cache';

  constructor() {
    this.loadFromStorage();
  }

  get(judgeName: string, team: Team): EvaluationValues | undefined {
    return this.cache[judgeName]?.[team];
  }

  set(judgeName: string, team: Team, values: EvaluationValues): void {
    if (!this.cache[judgeName]) this.cache[judgeName] = {};
    this.cache[judgeName][team] = { ...values };
    this.saveToStorage();
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.cache = JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to load scoring cache from localStorage:', error);
      this.cache = {};
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.cache));
    } catch (error) {
      console.warn('Failed to save scoring cache to localStorage:', error);
    }
  }

  clearCache(): void {
    this.cache = {};
    localStorage.removeItem(this.STORAGE_KEY);
  }
}


