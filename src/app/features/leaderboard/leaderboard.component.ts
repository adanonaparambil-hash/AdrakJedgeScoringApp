import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ApiService } from '../../core/api.service';
import { interval, Subject, switchMap, takeUntil, startWith } from 'rxjs';

@Component({
  selector: 'app-leaderboard',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  template: `
    <div style="display:flex; flex-direction:column; gap:16px;">
      
      <!-- Access Denied for Non-Admin -->
      <div *ngIf="!isAdmin" class="glass" style="padding:24px; text-align:center; background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(255, 255, 255, 0.05)); border:2px solid rgba(239, 68, 68, 0.3);">
        <div style="font-size:48px; margin-bottom:12px;">🔒</div>
        <div style="font-weight:700; font-size:20px; color:#EF4444; margin-bottom:8px;">
          Admin Access Required
        </div>
        <div style="font-size:14px; color:var(--muted); margin-bottom:16px;">
          The leaderboard is only visible to administrators.
        </div>
        <div style="font-size:12px; color:var(--muted);">
          You can view your own scores on the Home and Profile pages.
        </div>
      </div>

      <!-- Admin Leaderboard View -->
      <ng-container *ngIf="isAdmin">
        <!-- Header -->
        <div class="glass" style="padding:16px; text-align:center; background: linear-gradient(135deg, rgba(255,215,0,0.1), rgba(255,255,255,0.05));">
          <div style="font-weight:700; font-size:24px; margin-bottom:8px; background: linear-gradient(45deg, var(--adrak-gold), var(--adrak-gold-light)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">
            🏆 لوحة المتصدرين Leaderboard 🏆
          </div>
          <div style="font-size:12px; color:var(--muted);">Live Rankings • Updates every 3 seconds</div>
          <div style="font-size:11px; color:var(--muted); margin-top:4px;">
            Admin View • Viewing as {{ userName }}
          </div>
        </div>

      <!-- Podium for top 3 -->
      <div *ngIf="data.length >= 3" class="glass" style="padding:20px; background: linear-gradient(135deg, rgba(255,215,0,0.05), rgba(255,255,255,0.02));">
        <div style="display:flex; align-items:end; justify-content:center; gap:16px; margin-bottom:20px;">
          
          <!-- 2nd Place -->
          <div class="podium-item" [class.winner-pop]="animate && data[1].team === lastWinner" 
               style="display:flex; flex-direction:column; align-items:center; transform: translateY(20px);">
            <div style="font-size:32px; margin-bottom:8px;">🥈</div>
            <div class="glass" style="padding:12px; min-width:80px; text-align:center; background: linear-gradient(135deg, rgba(192,192,192,0.2), rgba(255,255,255,0.05));"
                 [style.borderTop]="'3px solid ' + color(data[1].team || '')">
              <div style="font-weight:600; font-size:14px;">{{ data[1].team }}</div>
              <div style="font-size:12px; color:var(--muted); margin-top:4px;">{{ data[1].average | number:'1.0-0' }}/120</div>
            </div>
            <div style="width:60px; height:40px; background: linear-gradient(135deg, #C0C0C0, #A8A8A8); margin-top:8px; border-radius:4px 4px 0 0; display:flex; align-items:center; justify-content:center; color:white; font-weight:700; font-size:18px;">2</div>
          </div>

          <!-- 1st Place -->
          <div class="podium-item" [class.winner-pop]="animate && data[0].team === lastWinner" 
               style="display:flex; flex-direction:column; align-items:center;">
            <div style="font-size:40px; margin-bottom:8px; animation: bounce 2s infinite;">🥇</div>
            <div class="glass" style="padding:16px; min-width:90px; text-align:center; background: linear-gradient(135deg, rgba(255,215,0,0.3), rgba(255,255,255,0.1)); box-shadow: 0 0 20px rgba(255,215,0,0.3);"
                 [style.borderTop]="'4px solid ' + color(data[0].team || '')">
              <div style="font-weight:700; font-size:16px;">{{ data[0].team }}</div>
              <div style="font-size:14px; color:var(--muted); margin-top:4px; font-weight:600;">{{ data[0].average | number:'1.0-0' }}/120</div>
            </div>
            <div style="width:70px; height:60px; background: linear-gradient(135deg, #FFD700, #FFA500); margin-top:8px; border-radius:4px 4px 0 0; display:flex; align-items:center; justify-content:center; color:white; font-weight:700; font-size:24px; box-shadow: 0 4px 15px rgba(255,215,0,0.4);">1</div>
          </div>

          <!-- 3rd Place -->
          <div class="podium-item" [class.winner-pop]="animate && data[2].team === lastWinner" 
               style="display:flex; flex-direction:column; align-items:center; transform: translateY(40px);">
            <div style="font-size:28px; margin-bottom:8px;">🥉</div>
            <div class="glass" style="padding:10px; min-width:70px; text-align:center; background: linear-gradient(135deg, rgba(205,127,50,0.2), rgba(255,255,255,0.05));"
                 [style.borderTop]="'3px solid ' + color(data[2].team || '')">
              <div style="font-weight:600; font-size:13px;">{{ data[2].team }}</div>
              <div style="font-size:11px; color:var(--muted); margin-top:4px;">{{ data[2].average | number:'1.0-0' }}/120</div>
            </div>
            <div style="width:50px; height:30px; background: linear-gradient(135deg, #CD7F32, #B8860B); margin-top:8px; border-radius:4px 4px 0 0; display:flex; align-items:center; justify-content:center; color:white; font-weight:700; font-size:16px;">3</div>
          </div>
        </div>
      </div>

      <!-- Detailed Rankings -->
      <div class="glass" style="padding:16px;">
        <div style="font-weight:600; margin-bottom:12px; display:flex; align-items:center; gap:8px;">
          <i class="fas fa-list-ol" style="color:var(--accent);"></i>
          Detailed Rankings
        </div>
        
        <div *ngFor="let row of data; let i = index" 
             class="ranking-item card-animate" 
             [class.winner-pop]="animate && row.team === lastWinner"
             [class.first-place]="i === 0"
             [class.second-place]="i === 1" 
             [class.third-place]="i === 2"
             style="padding:14px; display:flex; justify-content:space-between; align-items:center; margin:8px 0; border-radius:12px; transition: all 0.3s ease; position: relative; overflow: hidden;"
             [style.background]="getRankingBackground(i)"
             [style.borderLeft]="'4px solid ' + color(row.team)">
          
          <!-- Rank Icon -->
          <div style="display:flex; align-items:center; gap:12px;">
            <div class="rank-badge" [style.background]="getRankBadgeColor(i)" 
                 style="width:36px; height:36px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:700; color:white; font-size:16px;">
              <span *ngIf="i < 3">{{ getRankIcon(i) }}</span>
              <span *ngIf="i >= 3">{{ i+1 }}</span>
            </div>
            
            <!-- Team Info -->
            <div>
              <div style="font-weight:600; font-size:16px; display:flex; align-items:center; gap:8px;">
                {{ row.team }} Team
                <span *ngIf="i === 0" style="font-size:12px;">👑</span>
              </div>
              <div style="font-size:12px; color:var(--muted);">
                Position {{ i + 1 }}
                <span *ngIf="row.submittedJudges !== undefined"> • {{ row.submittedJudges }}/{{ row.totalJudges }} submitted</span>
              </div>
            </div>
          </div>

          <!-- Score -->
          <div style="text-align:right;">
            <div style="font-weight:700; font-size:18px; font-variant-numeric: tabular-nums;" [style.color]="getScoreColor(i)">
              {{ row.average | number:'1.0-0' }}
            </div>
            <div style="font-size:12px; color:var(--muted);">out of 120</div>
          </div>

          <!-- Progress Bar -->
          <div style="position:absolute; bottom:0; left:0; height:3px; background:rgba(255,255,255,0.1); width:100%;">
            <div style="height:100%; transition: width 1s ease;" 
                 [style.width.%]="(row.average / 120) * 100"
                 [style.background]="color(row.team)"></div>
          </div>
        </div>
        
        <div *ngIf="data.length === 0" style="color:var(--muted); font-size:14px; text-align:center; padding:20px;">
          <i class="fas fa-hourglass-half" style="margin-right:8px;"></i>
          No scores yet. Judging in progress...
        </div>
      </div>

      <!-- Celebration Animation -->
      <div *ngIf="animate && isAdmin" style="text-align:center; font-size:32px; animation: celebration 1.2s ease-in-out;">
        🎉 🏆 🎊 🥇 🎉
      </div>
      </ng-container>
    </div>

    <style>
      @keyframes bounce {
        0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
        40% { transform: translateY(-10px); }
        60% { transform: translateY(-5px); }
      }
      
      @keyframes celebration {
        0% { transform: scale(0.5); opacity: 0; }
        50% { transform: scale(1.2); opacity: 1; }
        100% { transform: scale(1); opacity: 0.8; }
      }
      
      .winner-pop {
        animation: winnerPop 1.2s ease-in-out;
      }
      
      @keyframes winnerPop {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); box-shadow: 0 0 25px rgba(255,215,0,0.6); }
        100% { transform: scale(1); }
      }
      
      .ranking-item:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(0,0,0,0.15);
      }
      
      .first-place {
        box-shadow: 0 4px 20px rgba(255,215,0,0.3);
      }
      
      .second-place {
        box-shadow: 0 4px 15px rgba(192,192,192,0.3);
      }
      
      .third-place {
        box-shadow: 0 4px 15px rgba(205,127,50,0.3);
      }
      
      /* Mobile-first responsive design */
      
      /* Base mobile styles */
      .podium-item {
        min-width: 70px;
      }
      
      .podium-item .glass {
        padding: 8px !important;
        min-width: 60px !important;
        font-size: 12px;
      }
      
      .podium-item div[style*="width:70px"] {
        width: 50px !important;
        height: 40px !important;
        font-size: 18px !important;
      }
      
      .podium-item div[style*="width:60px"] {
        width: 45px !important;
        height: 30px !important;
        font-size: 14px !important;
      }
      
      .podium-item div[style*="width:50px"] {
        width: 40px !important;
        height: 25px !important;
        font-size: 12px !important;
      }
      
      .ranking-item {
        padding: 12px !important;
        margin: 6px 0 !important;
      }
      
      .rank-badge {
        width: 32px !important;
        height: 32px !important;
        font-size: 14px !important;
      }
      
      .ranking-item div[style*="font-size:16px"] {
        font-size: 14px !important;
      }
      
      .ranking-item div[style*="font-size:18px"] {
        font-size: 16px !important;
      }
      
      /* Tablet styles */
      @media (min-width: 768px) {
        .podium-item .glass {
          padding: 12px !important;
          min-width: 80px !important;
          font-size: 14px;
        }
        
        .podium-item div[style*="width:70px"] {
          width: 70px !important;
          height: 60px !important;
          font-size: 24px !important;
        }
        
        .podium-item div[style*="width:60px"] {
          width: 60px !important;
          height: 40px !important;
          font-size: 18px !important;
        }
        
        .podium-item div[style*="width:50px"] {
          width: 50px !important;
          height: 30px !important;
          font-size: 16px !important;
        }
        
        .ranking-item {
          padding: 14px !important;
          margin: 8px 0 !important;
        }
        
        .rank-badge {
          width: 36px !important;
          height: 36px !important;
          font-size: 16px !important;
        }
        
        .ranking-item div[style*="font-size:16px"] {
          font-size: 16px !important;
        }
        
        .ranking-item div[style*="font-size:18px"] {
          font-size: 18px !important;
        }
        
        .ranking-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.15);
        }
      }
      
      /* Touch-friendly interactions */
      @media (hover: none) and (pointer: coarse) {
        .ranking-item:hover {
          transform: none;
          box-shadow: initial;
        }
        
        .ranking-item:active {
          transform: scale(0.98);
          background: rgba(255,255,255,0.1);
        }
      }
      
      /* Accessibility improvements */
      @media (prefers-reduced-motion: reduce) {
        .winner-pop,
        .podium-item,
        .ranking-item {
          animation: none;
          transition: none;
        }
      }
      
      /* High contrast mode */
      @media (prefers-contrast: high) {
        .glass {
          border: 2px solid rgba(255,255,255,0.5);
        }
        
        .ranking-item {
          border: 2px solid rgba(255,255,255,0.3);
        }
      }
    </style>
  `
})
export class LeaderboardComponent implements OnInit, OnDestroy {
  private api = inject(ApiService);
  private destroy$ = new Subject<void>();

  isAdmin = localStorage.getItem('isAdmin') === 'true';
  userName = localStorage.getItem('userName') || localStorage.getItem('judgeName') || '';
  data: Array<{ team: string; average: number; totalJudges?: number; submittedJudges?: number }> = [];
  lastTop = '';
  lastWinner = '';
  animate = false;

  ngOnInit(): void {
    interval(3000).pipe(
      startWith(0),
      switchMap(() => this.api.getLeaderboard()),
      takeUntil(this.destroy$)
    ).subscribe(rows => {
      const top = rows[0]?.team || '';
      if (this.lastTop && top && top !== this.lastTop) {
        this.animate = true;
        this.lastWinner = top;
        setTimeout(() => this.animate = false, 1200);
      }
      this.lastTop = top;
      this.data = rows;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  color(team: string) {
    if (team.toLowerCase() === 'blue') return 'var(--blue)';
    if (team.toLowerCase() === 'red') return 'var(--red)';
    if (team.toLowerCase() === 'green') return 'var(--green)';
    return 'var(--accent)';
  }

  getRankIcon(index: number): string {
    const icons = ['🥇', '🥈', '🥉'];
    return icons[index] || '';
  }

  getRankBadgeColor(index: number): string {
    if (index === 0) return 'linear-gradient(135deg, #FFD700, #FFA500)';
    if (index === 1) return 'linear-gradient(135deg, #C0C0C0, #A8A8A8)';
    if (index === 2) return 'linear-gradient(135deg, #CD7F32, #B8860B)';
    return 'linear-gradient(135deg, #6B7280, #4B5563)';
  }

  getRankingBackground(index: number): string {
    if (index === 0) return 'linear-gradient(135deg, rgba(255,215,0,0.1), rgba(255,255,255,0.05))';
    if (index === 1) return 'linear-gradient(135deg, rgba(192,192,192,0.1), rgba(255,255,255,0.05))';
    if (index === 2) return 'linear-gradient(135deg, rgba(205,127,50,0.1), rgba(255,255,255,0.05))';
    return 'rgba(255,255,255,0.03)';
  }

  getScoreColor(index: number): string {
    if (index === 0) return '#FFD700';
    if (index === 1) return '#C0C0C0';
    if (index === 2) return '#CD7F32';
    return 'inherit';
  }
}


