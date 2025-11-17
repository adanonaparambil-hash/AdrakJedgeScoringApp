import { Component, OnInit } from '@angular/core';
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
        <!-- Show Home and Scoring tabs only for non-admin users -->
        <a *ngIf="!isAdmin" routerLink="/tabs/home" routerLinkActive="active" class="tab-btn" [routerLinkActiveOptions]="{ exact: true }">
          <div class="tab-icon">🏠</div>
          <div class="tab-label">Home</div>
        </a>
        <a *ngIf="!isAdmin" routerLink="/tabs/scoring" routerLinkActive="active" class="tab-btn">
          <div class="tab-icon">📝</div>
          <div class="tab-label">Scoring</div>
        </a>
        <!-- Show Leaderboard tab for everyone -->
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
export class TabsComponent implements OnInit {
  isAdmin = false;

  ngOnInit(): void {
    this.isAdmin = localStorage.getItem('isAdmin') === 'true';
  }
}



