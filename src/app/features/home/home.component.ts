import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { ApiService } from '../../core/api.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  template: `
    <div style="display:flex; flex-direction:column; gap:16px;">
      
      <!-- Welcome Header -->
      <div class="glass welcome-header" style="padding:20px; text-align:center; background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1));">
        <div style="font-size:28px; margin-bottom:8px;">👋</div>
        <div style="font-weight:700; font-size:20px; background: linear-gradient(45deg, var(--adrak-green), var(--adrak-gold)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">
          أهلاً وسهلاً Welcome, {{ judgeName }}!
        </div>
        <div style="font-size:14px; color:var(--muted); margin-top:4px;">
          <i class="fas fa-gavel" style="margin-right:6px;"></i>
          Ready to judge the competition
        </div>
      </div>

      <!-- Teams Section -->
      <div class="glass" style="padding:16px;">
        <div style="font-weight:600; margin-bottom:16px; display:flex; align-items:center; gap:8px; font-size:18px;">
          <i class="fas fa-users" style="color:var(--accent);"></i>
          Select Team to Score
        </div>
        
        <div style="display:grid; grid-template-columns:1fr; gap:14px;">
          <div *ngFor="let team of teams; let i = index" 
               class="team-card glass card-animate glow" 
               (click)="goScore(team)" 
               style="padding:20px; cursor:pointer; border-radius:16px; position:relative; overflow:hidden; transition: all 0.3s ease;"
               [style.background]="getTeamBackground(team)"
               [style.borderLeft]="'5px solid ' + color(team)"
               [style.--team-color]="color(team)">
            
            <!-- Team Header -->
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
              <div style="display:flex; align-items:center; gap:12px;">
                <div class="team-icon" 
                     style="width:48px; height:48px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:24px; color:white; font-weight:700;"
                     [style.background]="color(team)">
                  {{ getTeamIcon(team) }}
                </div>
                <div>
                  <div style="font-weight:700; font-size:18px; display:flex; align-items:center; gap:8px;">
                    {{ team }} Team
                    <span style="font-size:14px;">{{ getTeamEmoji(team) }}</span>
                  </div>
                  <div style="font-size:12px; color:var(--muted); display:flex; align-items:center; gap:4px;">
                    <i class="fas fa-star" style="color:#FFD700;"></i>
                    Your evaluation
                  </div>
                </div>
              </div>
              
              <!-- Score Badge -->
              <div class="score-badge" 
                   style="background: linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0.1)); padding:8px 12px; border-radius:20px; backdrop-filter: blur(10px);">
                <div style="font-size:12px; color:rgba(255,255,255,0.8); text-align:center;">Score</div>
                <div style="font-size:20px; font-weight:700; color:white; text-align:center;">
                  {{ scores[team] || 0 }}
                </div>
                <div style="font-size:10px; color:rgba(255,255,255,0.6); text-align:center;">/ 120</div>
              </div>
            </div>

            <!-- Progress Bar -->
            <div style="margin-bottom:12px;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                <span style="font-size:12px; color:var(--muted);">Progress</span>
                <span style="font-size:12px; font-weight:600;">{{ getProgressPercentage(team) }}%</span>
              </div>
              <div style="height:6px; background:rgba(255,255,255,0.2); border-radius:3px; overflow:hidden;">
                <div style="height:100%; border-radius:3px; transition: width 1s ease;" 
                     [style.width.%]="getProgressPercentage(team)"
                     [style.background]="getProgressGradient(team)"></div>
              </div>
            </div>

            <!-- Action Button -->
            <div style="display:flex; align-items:center; justify-content:space-between;">
              <div style="display:flex; align-items:center; gap:8px; font-size:12px; color:var(--muted);">
                <i class="fas fa-clock"></i>
                <span>{{ getScoreStatus(team) }}</span>
              </div>
              <div style="display:flex; align-items:center; gap:6px; font-size:14px; font-weight:600; color:white;">
                {{ scores[team] ? 'Update Score' : 'Start Scoring' }}
                <i class="fas fa-arrow-right"></i>
              </div>
            </div>

            <!-- Hover Effect Overlay -->
            <div class="hover-overlay" style="position:absolute; top:0; left:0; right:0; bottom:0; background:rgba(255,255,255,0.1); opacity:0; transition: opacity 0.3s ease; pointer-events:none;"></div>
          </div>
        </div>
      </div>

      <!-- Quick Stats -->
      <div class="glass" style="padding:16px;">
        <div style="font-weight:600; margin-bottom:12px; display:flex; align-items:center; gap:8px;">
          <i class="fas fa-chart-bar" style="color:var(--accent);"></i>
          Your Judging Summary
        </div>
        
        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); gap:8px;">
          <div class="stat-card glass" style="padding:12px; text-align:center; background:rgba(34, 197, 94, 0.1);">
            <div style="font-size:24px; margin-bottom:4px;">{{ getCompletedTeams() }}</div>
            <div style="font-size:12px; color:var(--muted);">Teams Scored</div>
            <i class="fas fa-check-circle" style="color:#22C55E; margin-top:4px;"></i>
          </div>
          
          <div class="stat-card glass" style="padding:12px; text-align:center; background:rgba(59, 130, 246, 0.1);">
            <div style="font-size:24px; margin-bottom:4px;">{{ getTotalScore() }}</div>
            <div style="font-size:12px; color:var(--muted);">Total Points</div>
            <i class="fas fa-trophy" style="color:#3B82F6; margin-top:4px;"></i>
          </div>
          
          <div class="stat-card glass" style="padding:12px; text-align:center; background:rgba(168, 85, 247, 0.1);">
            <div style="font-size:24px; margin-bottom:4px;">{{ getAverageScore() }}</div>
            <div style="font-size:12px; color:var(--muted);">Average</div>
            <i class="fas fa-star" style="color:#A855F7; margin-top:4px;"></i>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="glass" style="padding:16px; text-align:center; background: linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02));">
        <div style="display:flex; align-items:center; justify-content:center; gap:8px; margin-bottom:8px;">
          <i class="fas fa-code" style="color:var(--adrak-gold);"></i>
          <span style="font-weight:600;">الأدراك Al Adrak IT Department</span>
        </div>
        <div style="font-size:12px; color:var(--muted);">
          © 2025 • CGT Judge App • Version 1.0
        </div>
      </div>
    </div>

    <style>
      .welcome-header {
        animation: welcomeGlow 3s ease-in-out infinite alternate;
      }
      
      @keyframes welcomeGlow {
        0% { box-shadow: 0 4px 20px rgba(59, 130, 246, 0.2); }
        100% { box-shadow: 0 8px 30px rgba(147, 51, 234, 0.3); }
      }
      
      .team-card:hover {
        transform: translateY(-4px) scale(1.02);
        box-shadow: 0 12px 30px rgba(0,0,0,0.2);
      }
      
      .team-card:hover .hover-overlay {
        opacity: 1;
      }
      
      .team-card:hover .team-icon {
        transform: scale(1.1);
        box-shadow: 0 4px 15px rgba(0,0,0,0.3);
      }
      
      .team-icon {
        transition: all 0.3s ease;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
      }
      
      .score-badge {
        transition: all 0.3s ease;
      }
      
      .team-card:hover .score-badge {
        transform: scale(1.05);
      }
      
      .stat-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(0,0,0,0.15);
      }
      
      .card-animate {
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }
      
      /* Mobile-first responsive design */
      
      /* Base mobile styles */
      .team-card {
        padding: 16px !important;
        min-height: 120px;
        touch-action: manipulation;
      }
      
      .team-icon {
        width: 40px !important;
        height: 40px !important;
        font-size: 20px !important;
      }
      
      .score-badge {
        padding: 6px 10px !important;
        min-width: 60px;
      }
      
      .stat-card {
        padding: 10px !important;
        min-height: 80px;
      }
      
      .welcome-header {
        padding: 16px !important;
      }
      
      /* Tablet styles */
      @media (min-width: 768px) {
        .team-card {
          padding: 20px !important;
          min-height: 140px;
        }
        
        .team-icon {
          width: 48px !important;
          height: 48px !important;
          font-size: 24px !important;
        }
        
        .score-badge {
          padding: 8px 12px !important;
          min-width: 70px;
        }
        
        .stat-card {
          padding: 12px !important;
          min-height: 90px;
        }
        
        .welcome-header {
          padding: 20px !important;
        }
        
        .team-card:hover {
          transform: translateY(-4px) scale(1.02);
          box-shadow: 0 12px 30px rgba(0,0,0,0.2);
        }
        
        .team-card:hover .hover-overlay {
          opacity: 1;
        }
        
        .team-card:hover .team-icon {
          transform: scale(1.1);
          box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        }
        
        .team-card:hover .score-badge {
          transform: scale(1.05);
        }
        
        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0,0,0,0.15);
        }
      }
      
      /* Touch-friendly interactions */
      @media (hover: none) and (pointer: coarse) {
        .team-card:hover,
        .team-card:hover .hover-overlay,
        .team-card:hover .team-icon,
        .team-card:hover .score-badge,
        .stat-card:hover {
          transform: none;
          box-shadow: initial;
          opacity: initial;
        }
        
        .team-card:active {
          transform: scale(0.98);
          background: rgba(255,255,255,0.1);
        }
      }
      
      /* Accessibility improvements */
      @media (prefers-reduced-motion: reduce) {
        .welcome-header,
        .card-animate,
        .team-icon,
        .score-badge {
          animation: none;
          transition: none;
        }
      }
      
      /* High contrast mode */
      @media (prefers-contrast: high) {
        .glass {
          border: 2px solid rgba(255,255,255,0.5);
        }
        
        .team-card {
          border: 2px solid rgba(255,255,255,0.3);
        }
      }
    </style>
  `
})
export class HomeComponent implements OnInit {
  private api = inject(ApiService);
  private router = inject(Router);

  judgeName = localStorage.getItem('judgeName') || '';
  teams: string[] = [];
  scores: Record<string, number> = {};

  ngOnInit(): void {
    this.api.getTeams().subscribe(t => this.teams = t);
    if (this.judgeName) {
      this.api.getJudgeScores(this.judgeName).subscribe(s => this.scores = s);
    }
  }

  goScore(team: string) {
    this.router.navigate(['/tabs/scoring'], { queryParams: { team } });
  }

  color(team: string) {
    if (team.toLowerCase() === 'blue') return 'var(--blue)';
    if (team.toLowerCase() === 'red') return 'var(--red)';
    if (team.toLowerCase() === 'green') return 'var(--green)';
    return 'var(--accent)';
  }

  getTeamIcon(team: string): string {
    const teamLower = team.toLowerCase();
    if (teamLower === 'blue') return '🔵';
    if (teamLower === 'red') return '🔴';
    if (teamLower === 'green') return '🟢';
    return '⭐';
  }

  getTeamEmoji(team: string): string {
    const teamLower = team.toLowerCase();
    if (teamLower === 'blue') return '💙';
    if (teamLower === 'red') return '❤️';
    if (teamLower === 'green') return '💚';
    return '✨';
  }

  getTeamBackground(team: string): string {
    const teamLower = team.toLowerCase();
    if (teamLower === 'blue') return 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(59, 130, 246, 0.05))';
    if (teamLower === 'red') return 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(239, 68, 68, 0.05))';
    if (teamLower === 'green') return 'linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(34, 197, 94, 0.05))';
    return 'linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(168, 85, 247, 0.05))';
  }

  getProgressPercentage(team: string): number {
    const score = this.scores[team] || 0;
    return Math.round((score / 120) * 100);
  }

  getProgressGradient(team: string): string {
    const teamLower = team.toLowerCase();
    if (teamLower === 'blue') return 'linear-gradient(90deg, #3B82F6, #60A5FA)';
    if (teamLower === 'red') return 'linear-gradient(90deg, #EF4444, #F87171)';
    if (teamLower === 'green') return 'linear-gradient(90deg, #22C55E, #4ADE80)';
    return 'linear-gradient(90deg, #A855F7, #C084FC)';
  }

  getScoreStatus(team: string): string {
    const score = this.scores[team] || 0;
    if (score === 0) return 'Not started';
    if (score < 40) return 'In progress';
    if (score < 80) return 'Good progress';
    if (score < 100) return 'Almost complete';
    return 'Completed';
  }

  getCompletedTeams(): number {
    return Object.values(this.scores).filter(score => score > 0).length;
  }

  getTotalScore(): number {
    return Object.values(this.scores).reduce((sum, score) => sum + score, 0);
  }

  getAverageScore(): number {
    const completed = this.getCompletedTeams();
    if (completed === 0) return 0;
    return Math.round(this.getTotalScore() / completed);
  }
}



