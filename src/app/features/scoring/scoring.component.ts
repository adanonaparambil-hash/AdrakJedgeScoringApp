import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { ApiService, EvaluationValues } from '../../core/api.service';
import { ScoringStateService } from './scoring-state.service';
import { Subject, debounceTime, takeUntil } from 'rxjs';

const LOGO_KEYS = [
  'Reflects Creativity and Innovation',
  'Demonstrates clear thought',
  'Clearly representation of the Concept',
  'Visually appealing',
  'Distinctive and Memorable'
];

const MUSIC_KEYS = [
  'Relevance to Theme',
  'Audience Appeal',
  'Creativity'
];

const PRESENTATION_KEYS = [
  'Overall Creativity',
  'Integration of Logo and Music',
  'How clearly the content is presented',
  'How synced the presentation with Logo and Theme Music'
];

@Component({
  selector: 'app-scoring',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  template: `
    <div style="display:flex; flex-direction:column; gap:16px;">
      
      <!-- Team Selection Header -->
      <div class="glass" style="padding:16px; background: linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(59, 130, 246, 0.1));">
        <div style="font-weight:700; font-size:20px; margin-bottom:12px; text-align:center; display:flex; align-items:center; justify-content:center; gap:8px;">
          <i class="fas fa-clipboard-list" style="color:var(--adrak-gold);"></i>
          Team Evaluation
        </div>
        
        <div style="display:flex; gap:10px;">
          <button *ngFor="let team of teams" 
                  (click)="selectTeam(team)" 
                  class="team-selector glass card-animate" 
                  [class.active-team]="activeTeam === team"
                  style="flex:1; padding:14px; border-radius:16px; border:2px solid; cursor:pointer; transition: all 0.3s ease; position:relative; overflow:hidden;"
                  [style.borderColor]="activeTeam === team ? color(team) : 'transparent'"
                  [style.background]="getTeamSelectorBackground(team)"
                  [style.color]="activeTeam === team ? 'white' : 'inherit'">
            
            <div style="display:flex; flex-direction:column; align-items:center; gap:6px;">
              <div style="font-size:24px;">{{ getTeamIcon(team) }}</div>
              <div style="font-weight:600; font-size:14px;">{{ team }}</div>
              <div style="font-size:10px; opacity:0.8;">{{ getTeamProgress(team) }}% Complete</div>
            </div>
            
            <!-- Active indicator -->
            <div *ngIf="activeTeam === team" 
                 style="position:absolute; top:0; left:0; right:0; height:3px; background:linear-gradient(90deg, #FFD700, #FFA500);"></div>
          </button>
        </div>
      </div>

      <!-- Loading Indicator -->
      <div *ngIf="isLoading" class="glass" style="padding:20px; text-align:center;">
        <div style="font-size:24px; margin-bottom:8px;">⏳</div>
        <div style="color:var(--muted);">Loading evaluation data...</div>
      </div>

      <!-- Scoring Sections -->
      <div *ngIf="activeTeam && !isLoading" [style.--team-color]="color(activeTeam)" style="display:flex; flex-direction:column; gap:16px;">
        
        <!-- Current Team Header -->
        <div class="glass team-header" 
             style="padding:16px; text-align:center; position:relative; overflow:hidden;"
             [style.background]="getActiveTeamBackground()">
          <div style="font-size:32px; margin-bottom:8px;">{{ getTeamIcon(activeTeam) }}</div>
          <div style="font-weight:700; font-size:24px; color:white; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">
            {{ activeTeam }} Team Evaluation
          </div>
          <div style="font-size:14px; color:rgba(255,255,255,0.9); margin-top:4px;">
            Judge: {{ userName }}
          </div>
          
          <!-- Animated background -->
          <div class="team-bg-animation" style="position:absolute; top:0; left:0; right:0; bottom:0; opacity:0.1; pointer-events:none;"></div>
        </div>

        <!-- A. Logo Evaluation -->
        <div class="evaluation-section glass" style="padding:20px; background: linear-gradient(135deg, rgba(255, 107, 107, 0.1), rgba(255, 255, 255, 0.05));">
          <div class="section-header" style="display:flex; align-items:center; gap:12px; margin-bottom:20px; padding-bottom:12px; border-bottom:2px solid rgba(255, 107, 107, 0.3);">
            <div class="section-icon" style="width:48px; height:48px; border-radius:50%; background:linear-gradient(135deg, #FF6B6B, #FF8E8E); display:flex; align-items:center; justify-content:center; font-size:20px; color:white; box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);">
              🎨
            </div>
            <div>
              <div style="font-weight:700; font-size:18px; color:#FF6B6B;">A. Logo Evaluation</div>
              <div style="font-size:12px; color:var(--muted);">Creativity, Design & Visual Impact</div>
            </div>
            <div style="margin-left:auto; font-size:14px; font-weight:600; color:#FF6B6B;">
              {{ getLogoScore() }}/50
            </div>
          </div>
          
          <ng-container *ngFor="let key of LOGO_KEYS; let i = index">
            <div class="criteria-item" style="margin:20px 0; padding:16px; background:rgba(255,255,255,0.05); border-radius:12px; border-left:4px solid #FF6B6B;">
              <div style="display:flex; align-items:center; gap:8px; margin-bottom:12px;">
                <span style="font-size:16px;">{{ getCriteriaIcon('logo', i) }}</span>
                <div style="font-size:15px; font-weight:500; line-height:1.4; flex:1;">{{ key }}</div>
                <div class="score-display" 
                     style="width:48px; height:48px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:16px; color:white; transition: all 0.3s ease;"
                     [style.background]="getScoreColor(values[key] || 0)">
                  {{ values[key] || 0 }}
                </div>
              </div>
              
              <div style="display:flex; align-items:center; gap:12px;">
                <input type="range" min="0" max="10" 
                       [(ngModel)]="values[key]" 
                       (ngModelChange)="onChanged()"
                       [disabled]="submitted"
                       class="custom-slider"
                       style="flex:1; height:8px; border-radius:4px; outline:none;"
                       [style.cursor]="submitted ? 'not-allowed' : 'pointer'"
                       [style.opacity]="submitted ? '0.6' : '1'"
                       [style.background]="getSliderBackground(values[key] || 0, '#FF6B6B')" />
                <div class="score-labels" style="display:flex; gap:4px; font-size:10px; color:var(--muted);">
                  <span>Poor</span>
                  <span style="margin-left:auto;">Excellent</span>
                </div>
              </div>
            </div>
          </ng-container>
        </div>

        <!-- B. Theme Music Evaluation -->
        <div class="evaluation-section glass" style="padding:20px; background: linear-gradient(135deg, rgba(74, 222, 128, 0.1), rgba(255, 255, 255, 0.05));">
          <div class="section-header" style="display:flex; align-items:center; gap:12px; margin-bottom:20px; padding-bottom:12px; border-bottom:2px solid rgba(74, 222, 128, 0.3);">
            <div class="section-icon" style="width:48px; height:48px; border-radius:50%; background:linear-gradient(135deg, #4ADE80, #6EE7B7); display:flex; align-items:center; justify-content:center; font-size:20px; color:white; box-shadow: 0 4px 15px rgba(74, 222, 128, 0.3);">
              🎵
            </div>
            <div>
              <div style="font-weight:700; font-size:18px; color:#4ADE80;">B. Theme Music Evaluation</div>
              <div style="font-size:12px; color:var(--muted);">Relevance, Appeal & Creativity</div>
            </div>
            <div style="margin-left:auto; font-size:14px; font-weight:600; color:#4ADE80;">
              {{ getMusicScore() }}/30
            </div>
          </div>
          
          <ng-container *ngFor="let key of MUSIC_KEYS; let i = index">
            <div class="criteria-item" style="margin:20px 0; padding:16px; background:rgba(255,255,255,0.05); border-radius:12px; border-left:4px solid #4ADE80;">
              <div style="display:flex; align-items:center; gap:8px; margin-bottom:12px;">
                <span style="font-size:16px;">{{ getCriteriaIcon('music', i) }}</span>
                <div style="font-size:15px; font-weight:500; line-height:1.4; flex:1;">{{ key }}</div>
                <div class="score-display" 
                     style="width:48px; height:48px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:16px; color:white; transition: all 0.3s ease;"
                     [style.background]="getScoreColor(values[key] || 0)">
                  {{ values[key] || 0 }}
                </div>
              </div>
              
              <div style="display:flex; align-items:center; gap:12px;">
                <input type="range" min="0" max="10" 
                       [(ngModel)]="values[key]" 
                       (ngModelChange)="onChanged()"
                       [disabled]="submitted"
                       class="custom-slider"
                       style="flex:1; height:8px; border-radius:4px; outline:none;"
                       [style.cursor]="submitted ? 'not-allowed' : 'pointer'"
                       [style.opacity]="submitted ? '0.6' : '1'"
                       [style.background]="getSliderBackground(values[key] || 0, '#4ADE80')" />
                <div class="score-labels" style="display:flex; gap:4px; font-size:10px; color:var(--muted);">
                  <span>Poor</span>
                  <span style="margin-left:auto;">Excellent</span>
                </div>
              </div>
            </div>
          </ng-container>
        </div>

        <!-- C. Presentation Evaluation -->
        <div class="evaluation-section glass" style="padding:20px; background: linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(255, 255, 255, 0.05));">
          <div class="section-header" style="display:flex; align-items:center; gap:12px; margin-bottom:20px; padding-bottom:12px; border-bottom:2px solid rgba(168, 85, 247, 0.3);">
            <div class="section-icon" style="width:48px; height:48px; border-radius:50%; background:linear-gradient(135deg, #A855F7, #C084FC); display:flex; align-items:center; justify-content:center; font-size:20px; color:white; box-shadow: 0 4px 15px rgba(168, 85, 247, 0.3);">
              🎭
            </div>
            <div>
              <div style="font-weight:700; font-size:18px; color:#A855F7;">C. Presentation Evaluation</div>
              <div style="font-size:12px; color:var(--muted);">Integration, Clarity & Synchronization</div>
            </div>
            <div style="margin-left:auto; font-size:14px; font-weight:600; color:#A855F7;">
              {{ getPresentationScore() }}/40
            </div>
          </div>
          
          <ng-container *ngFor="let key of PRESENTATION_KEYS; let i = index">
            <div class="criteria-item" style="margin:20px 0; padding:16px; background:rgba(255,255,255,0.05); border-radius:12px; border-left:4px solid #A855F7;">
              <div style="display:flex; align-items:center; gap:8px; margin-bottom:12px;">
                <span style="font-size:16px;">{{ getCriteriaIcon('presentation', i) }}</span>
                <div style="font-size:15px; font-weight:500; line-height:1.4; flex:1;">{{ key }}</div>
                <div class="score-display" 
                     style="width:48px; height:48px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:16px; color:white; transition: all 0.3s ease;"
                     [style.background]="getScoreColor(values[key] || 0)">
                  {{ values[key] || 0 }}
                </div>
              </div>
              
              <div style="display:flex; align-items:center; gap:12px;">
                <input type="range" min="0" max="10" 
                       [(ngModel)]="values[key]" 
                       (ngModelChange)="onChanged()"
                       [disabled]="submitted"
                       class="custom-slider"
                       style="flex:1; height:8px; border-radius:4px; outline:none;"
                       [style.cursor]="submitted ? 'not-allowed' : 'pointer'"
                       [style.opacity]="submitted ? '0.6' : '1'"
                       [style.background]="getSliderBackground(values[key] || 0, '#A855F7')" />
                <div class="score-labels" style="display:flex; gap:4px; font-size:10px; color:var(--muted);">
                  <span>Poor</span>
                  <span style="margin-left:auto;">Excellent</span>
                </div>
              </div>
            </div>
          </ng-container>
        </div>

        <!-- Total Score Summary -->
        <div class="glass total-score" 
             style="padding:24px; text-align:center; background: linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 255, 255, 0.1)); border: 2px solid rgba(255, 215, 0, 0.3); position:relative; overflow:hidden;">
          
          <div style="font-size:48px; margin-bottom:8px;">🏆</div>
          <div style="font-weight:700; font-size:24px; color:#FFD700; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">
            Total Score
          </div>
          <div style="font-size:36px; font-weight:800; margin:12px 0; color:white; text-shadow: 0 2px 4px rgba(0,0,0,0.5);">
            {{ total }}/120
          </div>
          
          <!-- Progress Ring -->
          <div style="margin:16px 0;">
            <div style="font-size:14px; color:var(--muted); margin-bottom:8px;">Completion Progress</div>
            <div style="width:100%; height:8px; background:rgba(255,255,255,0.2); border-radius:4px; overflow:hidden;">
              <div style="height:100%; border-radius:4px; transition: width 1s ease;" 
                   [style.width.%]="(total / 120) * 100"
                   [style.background]="'linear-gradient(90deg, #FFD700, #FFA500)'"></div>
            </div>
            <div style="font-size:12px; color:var(--muted); margin-top:4px;">
              {{ ((total / 120) * 100) | number:'1.0-0' }}% Complete
            </div>
          </div>

          <!-- Animated background -->
          <div style="position:absolute; top:0; left:0; right:0; bottom:0; background:radial-gradient(circle, rgba(255,215,0,0.1) 0%, transparent 70%); animation: pulse 3s ease-in-out infinite; pointer-events:none;"></div>
        </div>

        <!-- Save Status -->
        <div class="save-status" style="text-align:center; padding:12px;">
          <div *ngIf="saving" class="glass" style="padding:12px; background:rgba(59, 130, 246, 0.1); border:1px solid rgba(59, 130, 246, 0.3); border-radius:20px; display:inline-flex; align-items:center; gap:8px;">
            <div class="spinner" style="width:16px; height:16px; border:2px solid rgba(59, 130, 246, 0.3); border-top:2px solid #3B82F6; border-radius:50%; animation: spin 1s linear infinite;"></div>
            <span style="color:#3B82F6; font-weight:600;">Saving evaluation...</span>
          </div>
          
          <div *ngIf="savedAt && !saving" class="glass" style="padding:12px; background:rgba(34, 197, 94, 0.1); border:1px solid rgba(34, 197, 94, 0.3); border-radius:20px; display:inline-flex; align-items:center; gap:8px; animation: fadeIn 0.5s ease-in;">
            <i class="fas fa-check-circle" style="color:#22C55E;"></i>
            <span style="color:#22C55E; font-weight:600;">Evaluation saved successfully!</span>
          </div>
        </div>

        <!-- Submit Button (if not submitted) -->
        <div *ngIf="!submitted" class="glass" style="padding:20px; margin-top:16px; background: linear-gradient(135deg, rgba(255,215,0,0.1), rgba(255,255,255,0.05)); border:2px solid rgba(255,215,0,0.3);">
          <div style="text-align:center; margin-bottom:16px;">
            <div style="font-size:32px; margin-bottom:8px;">🏆</div>
            <div style="font-weight:700; font-size:20px; margin-bottom:8px;">Ready to Submit?</div>
            <div style="font-size:14px; color:var(--muted); margin-bottom:4px;">
              Make sure you've scored all teams before submitting.
            </div>
            <div style="font-size:12px; color:var(--muted);">
              After submission, you won't be able to edit your scores.
            </div>
          </div>
          
          <button (click)="submitAllEvaluations()" 
                  [disabled]="submitting"
                  class="submit-btn glass card-animate"
                  style="width:100%; padding:18px; border-radius:12px; background:linear-gradient(135deg, var(--adrak-green), var(--adrak-gold)); border:none; color:white; font-weight:700; font-size:18px; cursor:pointer; transition: all 0.3s ease; display:flex; align-items:center; justify-content:center; gap:10px; box-shadow: 0 4px 15px rgba(45, 90, 61, 0.3);">
            <span *ngIf="submitting" class="spinner" style="width:24px; height:24px; border:3px solid rgba(255,255,255,0.3); border-top:3px solid white; border-radius:50%; animation: spin 1s linear infinite;"></span>
            <i *ngIf="!submitting" class="fas fa-paper-plane" style="font-size:20px;"></i>
            {{ submitting ? 'Submitting All Evaluations...' : 'Submit All Evaluations' }}
          </button>
        </div>

        <!-- Submitted Confirmation -->
        <div *ngIf="submitted" class="glass" style="padding:24px; margin-top:16px; text-align:center; background: linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(255, 255, 255, 0.05)); border:2px solid rgba(34, 197, 94, 0.3);">
          <div style="font-size:64px; margin-bottom:12px;">✅</div>
          <div style="font-weight:700; font-size:24px; color:#22C55E; margin-bottom:8px;">
            Evaluation Submitted!
          </div>
          <div style="font-size:14px; color:var(--muted); margin-bottom:8px;">
            Your scores have been saved to Google Sheets.
          </div>
          <div style="font-size:12px; color:var(--muted);">
            You can view your scores but cannot edit them anymore.
          </div>
        </div>
      </div>
    </div>

    <style>
      /* Mobile-first responsive design */
      
      /* Base mobile styles */
      .team-selector {
        min-height: 80px;
        touch-action: manipulation;
      }
      
      .team-selector:active {
        transform: scale(0.98);
      }
      
      .active-team {
        transform: scale(1.02);
        box-shadow: 0 4px 20px rgba(0,0,0,0.2);
      }
      
      .evaluation-section {
        margin-bottom: 8px;
      }
      
      .section-header {
        flex-wrap: wrap;
        gap: 8px !important;
      }
      
      .section-icon {
        min-width: 40px !important;
        min-height: 40px !important;
        font-size: 18px !important;
      }
      
      .criteria-item {
        padding: 12px !important;
        margin: 12px 0 !important;
      }
      
      .score-display {
        min-width: 40px !important;
        min-height: 40px !important;
        font-size: 14px !important;
      }
      
      .custom-slider {
        height: 12px !important;
        -webkit-appearance: none;
        appearance: none;
        background: transparent;
        outline: none;
      }
      
      .custom-slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background: white;
        cursor: pointer;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        transition: all 0.3s ease;
        border: 2px solid #fff;
      }
      
      .custom-slider::-moz-range-thumb {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background: white;
        cursor: pointer;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        border: 2px solid #fff;
      }
      
      .score-labels {
        min-width: 80px;
        justify-content: space-between !important;
      }
      
      .total-score {
        padding: 16px !important;
      }
      
      .save-status .glass {
        padding: 8px 12px !important;
        font-size: 14px;
      }
      
      /* Tablet styles */
      @media (min-width: 768px) {
        .team-selector:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.15);
        }
        
        .active-team {
          transform: scale(1.05);
          box-shadow: 0 8px 30px rgba(0,0,0,0.2);
        }
        
        .evaluation-section:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 30px rgba(0,0,0,0.15);
        }
        
        .criteria-item:hover {
          background: rgba(255,255,255,0.1) !important;
          transform: translateX(4px);
        }
        
        .score-display:hover {
          transform: scale(1.1);
        }
        
        .custom-slider::-webkit-slider-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 4px 12px rgba(0,0,0,0.4);
        }
        
        .section-icon {
          min-width: 48px !important;
          min-height: 48px !important;
          font-size: 20px !important;
        }
        
        .score-display {
          min-width: 48px !important;
          min-height: 48px !important;
          font-size: 16px !important;
        }
        
        .criteria-item {
          padding: 16px !important;
          margin: 20px 0 !important;
        }
        
        .total-score {
          padding: 24px !important;
        }
      }
      
      /* Desktop styles */
      @media (min-width: 1024px) {
        .section-header {
          flex-wrap: nowrap;
        }
      }
      
      /* Touch-friendly interactions */
      @media (hover: none) and (pointer: coarse) {
        .team-selector:hover,
        .evaluation-section:hover,
        .criteria-item:hover,
        .score-display:hover,
        .custom-slider::-webkit-slider-thumb:hover {
          transform: none;
          box-shadow: initial;
          background: initial;
        }
        
        .team-selector:active {
          transform: scale(0.95);
          background: rgba(255,255,255,0.1);
        }
        
        .criteria-item:active {
          background: rgba(255,255,255,0.1) !important;
        }
      }
      
      /* Animations */
      .team-header {
        animation: teamGlow 3s ease-in-out infinite alternate;
      }
      
      @keyframes teamGlow {
        0% { box-shadow: 0 4px 20px rgba(0,0,0,0.2); }
        100% { box-shadow: 0 8px 30px rgba(0,0,0,0.4); }
      }
      
      @keyframes pulse {
        0%, 100% { opacity: 0.1; }
        50% { opacity: 0.2; }
      }
      
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      
      @keyframes fadeIn {
        0% { opacity: 0; transform: translateY(10px); }
        100% { opacity: 1; transform: translateY(0); }
      }
      
      .card-animate {
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }
      
      /* Accessibility improvements */
      @media (prefers-reduced-motion: reduce) {
        .team-header,
        .card-animate,
        .custom-slider::-webkit-slider-thumb,
        .score-display {
          animation: none;
          transition: none;
        }
      }
      
      /* High contrast mode */
      @media (prefers-contrast: high) {
        .glass {
          border: 2px solid rgba(255,255,255,0.5);
        }
        
        .custom-slider::-webkit-slider-thumb {
          border: 3px solid #000;
        }
      }
    </style>
  `
})
export class ScoringComponent implements OnInit, OnDestroy {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  private state = inject(ScoringStateService);
  private destroy$ = new Subject<void>();
  private triggerSave$ = new Subject<void>();

  readonly LOGO_KEYS = LOGO_KEYS;
  readonly MUSIC_KEYS = MUSIC_KEYS;
  readonly PRESENTATION_KEYS = PRESENTATION_KEYS;

  userName = localStorage.getItem('userName') || localStorage.getItem('judgeName') || '';
  userId = localStorage.getItem('userId') || '';
  judgeName = localStorage.getItem('judgeName') || localStorage.getItem('userName') || ''; // For API compatibility
  submitted = localStorage.getItem('submitted') === 'true';
  teams: string[] = ['Blue', 'Red', 'Green'];
  activeTeam = 'Blue';
  values: EvaluationValues = {};
  private valuesByTeam: Record<string, EvaluationValues> = {};
  isLoading = false;
  saving = false;
  savedAt = false;
  submitting = false;

  ngOnInit(): void {
    const qp$ = this.route.queryParamMap as unknown as import('rxjs').Observable<ParamMap>;
    qp$.subscribe((p: ParamMap) => {
      const t = p.get('team');
      if (t && this.teams.includes(t)) {
        this.activeTeam = t;
        this.loadValues(); // Reload values when team changes via URL
      }
    });
    
    // Load initial values
    this.loadValues();
    
    // Prefetch all teams data in background
    this.prefetchAll();
    
    // Setup auto-save
    this.triggerSave$.pipe(debounceTime(400), takeUntil(this.destroy$)).subscribe(() => this.save());
  }

  ngOnDestroy(): void {
    // Save current values before component is destroyed
    if (this.activeTeam && this.judgeName && this.values) {
      this.valuesByTeam[this.activeTeam] = { ...this.values };
      this.state.set(this.judgeName, this.activeTeam, this.valuesByTeam[this.activeTeam]);
    }
    
    this.destroy$.next();
    this.destroy$.complete();
  }

  selectTeam(team: string) {
    // Save current values before switching
    if (this.activeTeam && this.judgeName) {
      this.valuesByTeam[this.activeTeam] = { ...this.values };
      this.state.set(this.judgeName, this.activeTeam, this.valuesByTeam[this.activeTeam]);
    }
    
    this.activeTeam = team;
    this.loadValues();
  }

  onChanged() {
    this.savedAt = false;
    this.triggerSave$.next();
  }

  get total(): number {
    return [
      ...LOGO_KEYS,
      ...MUSIC_KEYS,
      ...PRESENTATION_KEYS
    ].reduce((acc, k) => acc + (Number(this.values[k]) || 0), 0);
  }

  private loadValues() {
    const init: EvaluationValues = {};
    [...LOGO_KEYS, ...MUSIC_KEYS, ...PRESENTATION_KEYS].forEach(k => init[k] = 0);
    
    // First try to get from memory cache
    let cached = this.valuesByTeam[this.activeTeam];
    
    // If not in memory, try localStorage cache
    if (!cached && this.judgeName) {
      const storedCache = this.state.get(this.judgeName, this.activeTeam);
      if (storedCache) {
        cached = storedCache;
      }
    }
    
    // Set initial values from cache if available
    if (cached) {
      this.values = { ...init, ...cached };
    } else {
      this.values = init;
    }
    
    // Always fetch from server to ensure we have latest data
    if (!this.judgeName || !this.activeTeam) return;
    
    this.isLoading = true;
    this.api.getEvaluation(this.activeTeam, this.judgeName).subscribe({
      next: (serverValues) => {
        const merged = { ...init, ...serverValues };
        
        // Only update if server has different values than what we're showing
        const hasChanges = Object.keys(merged).some(key => 
          (merged[key] || 0) !== (this.values[key] || 0)
        );
        
        if (hasChanges || !cached) {
          this.values = merged;
          this.valuesByTeam[this.activeTeam] = merged;
          this.state.set(this.judgeName, this.activeTeam, merged);
        }
        
        this.isLoading = false;
      },
      error: (error) => {
        console.warn('Failed to load evaluation from server:', error);
        this.isLoading = false;
        // Keep the cached values if server fails
      }
    });
  }

  private save() {
    if (!this.judgeName || !this.activeTeam) return;
    this.saving = true;
    this.api.saveEvaluation(this.activeTeam, this.judgeName, this.values).subscribe({
      next: () => { this.saving = false; this.savedAt = true; },
      error: () => { this.saving = false; }
    });
    // Update cache immediately for snappy UX
    this.valuesByTeam[this.activeTeam] = { ...this.values };
    if (this.judgeName) this.state.set(this.judgeName, this.activeTeam, this.valuesByTeam[this.activeTeam]);
  }

  color(team: string) {
    const t = (team || '').toLowerCase();
    if (t === 'blue') return 'var(--blue)';
    if (t === 'red') return 'var(--red)';
    if (t === 'green') return 'var(--green)';
    return 'var(--accent)';
  }

  getTeamIcon(team: string): string {
    const teamLower = team.toLowerCase();
    if (teamLower === 'blue') return '🔵';
    if (teamLower === 'red') return '🔴';
    if (teamLower === 'green') return '🟢';
    return '⭐';
  }

  getTeamSelectorBackground(team: string): string {
    const isActive = this.activeTeam === team;
    const teamLower = team.toLowerCase();
    
    if (isActive) {
      if (teamLower === 'blue') return 'linear-gradient(135deg, #3B82F6, #1D4ED8)';
      if (teamLower === 'red') return 'linear-gradient(135deg, #EF4444, #DC2626)';
      if (teamLower === 'green') return 'linear-gradient(135deg, #22C55E, #16A34A)';
      return 'linear-gradient(135deg, #A855F7, #7C3AED)';
    }
    
    return 'rgba(255,255,255,0.05)';
  }

  getTeamProgress(team: string): number {
    const teamValues = this.valuesByTeam[team];
    if (!teamValues) return 0;
    
    const totalCriteria = [...LOGO_KEYS, ...MUSIC_KEYS, ...PRESENTATION_KEYS].length;
    const completedCriteria = Object.values(teamValues).filter(v => v > 0).length;
    return Math.round((completedCriteria / totalCriteria) * 100);
  }

  getActiveTeamBackground(): string {
    const teamLower = this.activeTeam.toLowerCase();
    if (teamLower === 'blue') return 'linear-gradient(135deg, #3B82F6, #1E40AF)';
    if (teamLower === 'red') return 'linear-gradient(135deg, #EF4444, #DC2626)';
    if (teamLower === 'green') return 'linear-gradient(135deg, #22C55E, #15803D)';
    return 'linear-gradient(135deg, #A855F7, #7C3AED)';
  }

  getCriteriaIcon(section: string, index: number): string {
    if (section === 'logo') {
      const icons = ['💡', '🧠', '🎯', '👁️', '⭐'];
      return icons[index] || '📝';
    }
    if (section === 'music') {
      const icons = ['🎪', '👥', '🎨'];
      return icons[index] || '🎵';
    }
    if (section === 'presentation') {
      const icons = ['✨', '🔗', '📢', '⚡'];
      return icons[index] || '🎭';
    }
    return '📝';
  }

  getScoreColor(score: number): string {
    if (score >= 9) return 'linear-gradient(135deg, #10B981, #059669)'; // Excellent - Green
    if (score >= 7) return 'linear-gradient(135deg, #3B82F6, #1D4ED8)'; // Good - Blue
    if (score >= 5) return 'linear-gradient(135deg, #F59E0B, #D97706)'; // Average - Orange
    if (score >= 3) return 'linear-gradient(135deg, #EF4444, #DC2626)'; // Poor - Red
    return 'linear-gradient(135deg, #6B7280, #4B5563)'; // Not scored - Gray
  }

  getSliderBackground(value: number, color: string): string {
    const percentage = (value / 10) * 100;
    return `linear-gradient(90deg, ${color} ${percentage}%, rgba(255,255,255,0.2) ${percentage}%)`;
  }

  getLogoScore(): number {
    return LOGO_KEYS.reduce((sum, key) => sum + (Number(this.values[key]) || 0), 0);
  }

  getMusicScore(): number {
    return MUSIC_KEYS.reduce((sum, key) => sum + (Number(this.values[key]) || 0), 0);
  }

  getPresentationScore(): number {
    return PRESENTATION_KEYS.reduce((sum, key) => sum + (Number(this.values[key]) || 0), 0);
  }

  private prefetchAll() {
    if (!this.judgeName) return;
    
    for (const t of this.teams) {
      // Skip if we already have cached data for this team
      if (this.valuesByTeam[t] || this.state.get(this.judgeName, t)) {
        continue;
      }
      
      this.api.getEvaluation(t, this.judgeName).subscribe({
        next: (v) => {
          const init: EvaluationValues = {};
          [...LOGO_KEYS, ...MUSIC_KEYS, ...PRESENTATION_KEYS].forEach(k => init[k] = 0);
          const merged = { ...init, ...v };
          this.valuesByTeam[t] = merged;
          this.state.set(this.judgeName!, t, merged);
        },
        error: (error) => {
          console.warn(`Failed to prefetch data for team ${t}:`, error);
        }
      });
    }
  }

  submitAllEvaluations() {
    if (!this.userId || !this.userName || this.submitting) return;

    // Save current team values before submitting
    if (this.activeTeam && this.values) {
      this.valuesByTeam[this.activeTeam] = { ...this.values };
      this.state.set(this.judgeName, this.activeTeam, this.valuesByTeam[this.activeTeam]);
    }

    // Check if all teams have been scored
    const allTeamsScored = this.teams.every(team => {
      const teamValues = this.valuesByTeam[team];
      if (!teamValues) return false;
      
      // Check if at least some scores are entered
      const hasScores = Object.values(teamValues).some(v => v > 0);
      return hasScores;
    });

    if (!allTeamsScored) {
      const confirm = window.confirm(
        'Not all teams have been scored. Do you want to submit anyway?'
      );
      if (!confirm) return;
    }

    this.submitting = true;

    // Convert valuesByTeam to Map for API
    const scoresMap = new Map<string, EvaluationValues>();
    Object.keys(this.valuesByTeam).forEach(team => {
      scoresMap.set(team, this.valuesByTeam[team]);
    });

    this.api.submitEvaluation(this.userId, this.userName, scoresMap).subscribe({
      next: (res) => {
        this.submitting = false;
        if (res.ok) {
          this.submitted = true;
          localStorage.setItem('submitted', 'true');
          alert('✅ All evaluations submitted successfully!\n\nYour scores have been saved to Google Sheets and you are now marked as submitted.');
        } else {
          alert('❌ ' + res.message);
        }
      },
      error: (err) => {
        this.submitting = false;
        console.error('Submit error:', err);
        alert('❌ Failed to submit evaluations. Please make sure the server is running on http://localhost:3000');
      }
    });
  }
}


