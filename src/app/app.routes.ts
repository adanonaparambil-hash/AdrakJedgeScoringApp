import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./features/login/login.component').then(m => m.LoginComponent) },
  {
    path: 'tabs',
    loadComponent: () => import('./layout/tabs.component').then(m => m.TabsComponent),
    children: [
      { path: 'home', loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent) },
      { path: 'scoring', loadComponent: () => import('./features/scoring/scoring.component').then(m => m.ScoringComponent) },
      { path: 'leaderboard', loadComponent: () => import('./features/leaderboard/leaderboard.component').then(m => m.LeaderboardComponent) },
      { path: 'profile', loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent) },
      { path: '', pathMatch: 'full', redirectTo: 'home' }
    ]
  },
  { path: '**', redirectTo: '' }
];



