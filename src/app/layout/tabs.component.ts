import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-tabs',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="mobile-container">
      <div class="content">
        <router-outlet></router-outlet>
      </div>
      <nav class="glass bottom-tabs">
        <a routerLink="/tabs/home" routerLinkActive="active" class="tab-btn" [routerLinkActiveOptions]="{ exact: true }">
          <div class="tab-icon">🏠</div>
          <div class="tab-label">Home</div>
        </a>
        <a routerLink="/tabs/scoring" routerLinkActive="active" class="tab-btn">
          <div class="tab-icon">📝</div>
          <div class="tab-label">Scoring</div>
        </a>
        <a routerLink="/tabs/leaderboard" routerLinkActive="active" class="tab-btn">
          <div class="tab-icon">🏆</div>
          <div class="tab-label">Leaderboard</div>
        </a>
        <a routerLink="/tabs/profile" routerLinkActive="active" class="tab-btn">
          <div class="tab-icon">👤</div>
          <div class="tab-label">Profile</div>
        </a>
      </nav>
    </div>
  `
})
export class TabsComponent {}



