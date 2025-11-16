import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="display:flex; flex-direction:column; gap:16px;">
      
      <!-- Profile Header -->
      <div class="glass profile-header" style="padding:20px; text-align:center; background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(59, 130, 246, 0.1));">
        <div style="font-size:64px; margin-bottom:12px;">{{ isAdmin ? '👨‍💼' : '👨‍⚖️' }}</div>
        <div style="font-weight:700; font-size:24px; margin-bottom:4px;">{{ userName }}</div>
        <div style="font-size:12px; color:var(--muted); margin-bottom:8px;">User ID: {{ userId }}</div>
        <div style="font-size:14px; color:var(--muted); display:flex; align-items:center; justify-content:center; gap:6px;">
          <i class="fas fa-gavel"></i>
          {{ isAdmin ? 'Administrator' : 'Competition Judge' }}
        </div>
        <div style="margin-top:12px; display:flex; gap:8px; justify-content:center; flex-wrap:wrap;">
          <div style="padding:8px 16px; background:rgba(139, 92, 246, 0.2); border-radius:20px; display:inline-block;">
            <span style="font-size:12px; color:rgba(255,255,255,0.9);">🏆 Active Session</span>
          </div>
          <div *ngIf="isAdmin" style="padding:8px 16px; background:rgba(255, 215, 0, 0.2); border-radius:20px; display:inline-block;">
            <span style="font-size:12px; color:rgba(255,255,255,0.9);">👑 Admin</span>
          </div>
          <div *ngIf="submitted && !isAdmin" style="padding:8px 16px; background:rgba(34, 197, 94, 0.2); border-radius:20px; display:inline-block;">
            <span style="font-size:12px; color:rgba(255,255,255,0.9);">✓ Submitted</span>
          </div>
        </div>
      </div>

      <!-- Quick Stats -->
      <div class="glass" style="padding:16px;">
        <div style="font-weight:600; margin-bottom:12px; display:flex; align-items:center; gap:8px;">
          <i class="fas fa-chart-line" style="color:var(--accent);"></i>
          Session Overview
        </div>
        
        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); gap:12px;">
          <div class="stat-item glass" style="padding:12px; text-align:center; background:rgba(34, 197, 94, 0.1);">
            <div style="font-size:20px; margin-bottom:4px;">✅</div>
            <div style="font-size:12px; color:var(--muted);">Status</div>
            <div style="font-weight:600; color:#22C55E;">Active</div>
          </div>
          
          <div class="stat-item glass" style="padding:12px; text-align:center; background:rgba(59, 130, 246, 0.1);">
            <div style="font-size:20px; margin-bottom:4px;">{{ isAdmin ? '👑' : '🎯' }}</div>
            <div style="font-size:12px; color:var(--muted);">Role</div>
            <div style="font-weight:600; color:#3B82F6;">{{ isAdmin ? 'Admin' : 'Judge' }}</div>
          </div>
          
          <div class="stat-item glass" style="padding:12px; text-align:center; background:rgba(168, 85, 247, 0.1);">
            <div style="font-size:20px; margin-bottom:4px;">⏰</div>
            <div style="font-size:12px; color:var(--muted);">Session</div>
            <div style="font-weight:600; color:#A855F7;">Live</div>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="glass" style="padding:16px;">
        <div style="font-weight:600; margin-bottom:12px; display:flex; align-items:center; gap:8px;">
          <i class="fas fa-cog" style="color:var(--accent);"></i>
          Account Actions
        </div>
        
        <div style="display:flex; flex-direction:column; gap:12px;">
          <button class="action-btn glass card-animate" 
                  style="padding:14px; border-radius:12px; background:rgba(59, 130, 246, 0.1); border:2px solid rgba(59, 130, 246, 0.3); color:inherit; font-weight:600; display:flex; align-items:center; gap:12px; cursor:pointer; transition: all 0.3s ease;">
            <i class="fas fa-refresh" style="color:#3B82F6;"></i>
            <div style="flex:1; text-align:left;">
              <div style="font-size:14px;">Refresh Session</div>
              <div style="font-size:11px; color:var(--muted);">Reload evaluation data</div>
            </div>
            <i class="fas fa-chevron-right" style="color:var(--muted); font-size:12px;"></i>
          </button>
          
          <button class="action-btn glass card-animate" 
                  style="padding:14px; border-radius:12px; background:rgba(168, 85, 247, 0.1); border:2px solid rgba(168, 85, 247, 0.3); color:inherit; font-weight:600; display:flex; align-items:center; gap:12px; cursor:pointer; transition: all 0.3s ease;">
            <i class="fas fa-info-circle" style="color:#A855F7;"></i>
            <div style="flex:1; text-align:left;">
              <div style="font-size:14px;">App Information</div>
              <div style="font-size:11px; color:var(--muted);">Version & support details</div>
            </div>
            <i class="fas fa-chevron-right" style="color:var(--muted); font-size:12px;"></i>
          </button>
          
          <button (click)="logout()" 
                  class="logout-btn glass card-animate" 
                  style="padding:14px; border-radius:12px; background:rgba(239, 68, 68, 0.1); border:2px solid rgba(239, 68, 68, 0.3); color:inherit; font-weight:600; display:flex; align-items:center; gap:12px; cursor:pointer; transition: all 0.3s ease;">
            <i class="fas fa-sign-out-alt" style="color:#EF4444;"></i>
            <div style="flex:1; text-align:left;">
              <div style="font-size:14px; color:#EF4444;">Logout</div>
              <div style="font-size:11px; color:var(--muted);">End current session</div>
            </div>
            <i class="fas fa-chevron-right" style="color:var(--muted); font-size:12px;"></i>
          </button>
        </div>
      </div>

      <!-- App Info -->
      <div class="glass" style="padding:16px; text-align:center; background: linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02));">
        <div style="display:flex; align-items:center; justify-content:center; gap:8px; margin-bottom:8px;">
          <i class="fas fa-mobile-alt" style="color:var(--adrak-gold);"></i>
          <span style="font-weight:600;">الأدراك CGT Judge App</span>
        </div>
        <div style="font-size:12px; color:var(--muted); margin-bottom:8px;">
          منصة التحكيم المحمولة Mobile Judging Platform
        </div>
        <div style="font-size:10px; color:var(--muted);">
          © 2025 Al Adrak IT Department • Version 1.0.0
        </div>
      </div>
    </div>

    <style>
      /* Mobile-first responsive design */
      
      /* Base mobile styles */
      .profile-header {
        animation: profileGlow 3s ease-in-out infinite alternate;
      }
      
      .stat-item {
        min-height: 80px;
        display: flex;
        flex-direction: column;
        justify-content: center;
      }
      
      .action-btn {
        min-height: 60px;
        touch-action: manipulation;
      }
      
      .action-btn:active {
        transform: scale(0.98);
        background: rgba(255,255,255,0.1);
      }
      
      .logout-btn:active {
        background: rgba(239, 68, 68, 0.2);
      }
      
      /* Tablet styles */
      @media (min-width: 768px) {
        .profile-header {
          padding: 24px !important;
        }
        
        .stat-item {
          min-height: 90px;
        }
        
        .action-btn {
          min-height: 70px;
        }
        
        .action-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.15);
        }
        
        .logout-btn:hover {
          background: rgba(239, 68, 68, 0.15);
          box-shadow: 0 8px 25px rgba(239, 68, 68, 0.2);
        }
      }
      
      /* Touch-friendly interactions */
      @media (hover: none) and (pointer: coarse) {
        .action-btn:hover,
        .logout-btn:hover {
          transform: none;
          box-shadow: initial;
          background: initial;
        }
      }
      
      /* Animations */
      @keyframes profileGlow {
        0% { box-shadow: 0 4px 20px rgba(139, 92, 246, 0.2); }
        100% { box-shadow: 0 8px 30px rgba(59, 130, 246, 0.3); }
      }
      
      /* Accessibility improvements */
      @media (prefers-reduced-motion: reduce) {
        .profile-header,
        .card-animate,
        .action-btn {
          animation: none;
          transition: none;
        }
      }
      
      /* High contrast mode */
      @media (prefers-contrast: high) {
        .glass {
          border: 2px solid rgba(255,255,255,0.5);
        }
        
        .action-btn,
        .logout-btn {
          border-width: 3px;
        }
      }
    </style>
  `
})
export class ProfileComponent {
  userName = localStorage.getItem('userName') || localStorage.getItem('judgeName') || 'Unknown';
  userId = localStorage.getItem('userId') || '';
  isAdmin = localStorage.getItem('isAdmin') === 'true';
  submitted = localStorage.getItem('submitted') === 'true';
  
  constructor(private router: Router) { }
  
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('submitted');
    localStorage.removeItem('judgeName'); // For backward compatibility
    this.router.navigateByUrl('/');
  }
}



