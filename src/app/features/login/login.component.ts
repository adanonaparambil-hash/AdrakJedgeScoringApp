import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { ApiService } from '../../core/api.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  template: `
    <div class="login-container" style="min-height:100vh; display:flex; flex-direction:column; justify-content:center; padding:16px; background: radial-gradient(1200px 600px at 50% 0%, #1a223f 0%, var(--bg-dark-2) 40%, var(--bg-dark-1) 100%);">
      
      <!-- App Logo & Title -->
      <div class="login-header" style="text-align:center; margin-bottom:32px;">
        <div class="logo-animation" style="font-size:64px; margin-bottom:16px; animation: logoFloat 3s ease-in-out infinite alternate;">
          🏆
        </div>
        <div style="font-weight:700; font-size:28px; margin-bottom:8px; background: linear-gradient(45deg, var(--adrak-green), var(--adrak-gold)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">
          الأدراك Al Adrak CGT Judge
        </div>
        <div style="font-size:14px; color:var(--muted); display:flex; align-items:center; justify-content:center; gap:6px;">
          <i class="fas fa-gavel"></i>
          Competition Judging Platform
        </div>
      </div>

      <!-- Login Form -->
      <form class="login-form glass" [formGroup]="form" (ngSubmit)="onSubmit()" 
            style="padding:24px; display:flex; flex-direction:column; gap:20px; max-width:400px; margin:0 auto; width:100%; background: linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05));">
        
        <div style="text-align:center; margin-bottom:12px;">
          <div style="font-weight:700; font-size:20px; margin-bottom:4px;">Welcome Back</div>
          <div style="font-size:12px; color:var(--muted);">Sign in to start judging</div>
        </div>

        <!-- Username Field -->
        <div class="input-group">
          <label style="display:block;">
            <div style="font-size:13px; color:var(--muted); margin-bottom:8px; display:flex; align-items:center; gap:6px;">
              <i class="fas fa-user" style="width:14px;"></i>
              Username
            </div>
            <input formControlName="username" 
                   placeholder="Enter your username" 
                   class="login-input"
                   style="width:100%; padding:14px 16px; border-radius:12px; border:2px solid var(--glass-border); background:rgba(255,255,255,0.08); color:var(--text); font-size:16px; transition: all 0.3s ease;" />
          </label>
        </div>

        <!-- Password Field -->
        <div class="input-group">
          <label style="display:block;">
            <div style="font-size:13px; color:var(--muted); margin-bottom:8px; display:flex; align-items:center; gap:6px;">
              <i class="fas fa-lock" style="width:14px;"></i>
              Password
            </div>
            <input type="password" 
                   formControlName="password" 
                   placeholder="Enter your password" 
                   class="login-input"
                   style="width:100%; padding:14px 16px; border-radius:12px; border:2px solid var(--glass-border); background:rgba(255,255,255,0.08); color:var(--text); font-size:16px; transition: all 0.3s ease;" />
          </label>
        </div>

        <!-- Submit Button -->
        <button type="submit" 
                [disabled]="form.invalid || loading" 
                class="login-btn"
                style="padding:16px; border-radius:12px; border:none; background:linear-gradient(135deg, var(--adrak-green), var(--adrak-gold)); color:white; font-weight:700; font-size:16px; cursor:pointer; transition: all 0.3s ease; display:flex; align-items:center; justify-content:center; gap:8px; min-height:56px; box-shadow: 0 4px 15px rgba(45, 90, 61, 0.3);">
          <span *ngIf="loading" class="spinner" style="width:20px; height:20px; border:2px solid rgba(255,255,255,0.3); border-top:2px solid white; border-radius:50%; animation: spin 1s linear infinite;"></span>
          <i *ngIf="!loading" class="fas fa-sign-in-alt"></i>
          {{ loading ? 'Signing in...' : 'Sign In' }}
        </button>

        <!-- Error Message -->
        <div *ngIf="error" class="error-message" 
             style="padding:12px; background:rgba(239, 68, 68, 0.1); border:1px solid rgba(239, 68, 68, 0.3); border-radius:8px; color:#EF4444; font-size:14px; display:flex; align-items:center; gap:8px; animation: errorShake 0.5s ease;">
          <i class="fas fa-exclamation-triangle"></i>
          {{ error }}
        </div>
      </form>

      <!-- App Info Footer -->
      <div class="login-footer glass" style="padding:20px; text-align:center; margin-top:24px; max-width:400px; margin-left:auto; margin-right:auto; width:100%; background: linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02));">
        <div style="display:flex; align-items:center; justify-content:center; gap:8px; margin-bottom:8px;">
          <i class="fas fa-code" style="color:var(--adrak-gold);"></i>
          <span style="font-weight:600;">طُور بواسطة قسم تقنية المعلومات - الأدراك</span>
        </div>
        <div style="font-size:12px; color:var(--muted); margin-bottom:8px;">
          Developed by Al Adrak IT Department
        </div>
        <div style="font-size:10px; color:var(--muted);">
          © 2025 الأدراك • Mobile Judging Platform • Version 1.0.0
        </div>
      </div>
    </div>

    <style>
      /* Mobile-first responsive design */
      
      /* Base mobile styles */
      .login-container {
        padding: 12px;
      }
      
      .login-header {
        margin-bottom: 24px;
      }
      
      .logo-animation {
        font-size: 48px !important;
        margin-bottom: 12px !important;
      }
      
      .login-form {
        padding: 20px !important;
        gap: 16px !important;
      }
      
      .login-input {
        padding: 12px 14px !important;
        font-size: 16px !important; /* Prevents zoom on iOS */
      }
      
      .login-input:focus {
        outline: none;
        border-color: var(--primary);
        box-shadow: 0 0 0 3px rgba(6, 182, 212, 0.1);
      }
      
      .login-btn {
        min-height: 48px !important;
        padding: 14px !important;
        font-size: 16px !important;
        touch-action: manipulation;
      }
      
      .login-btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
      
      .login-btn:not(:disabled):active {
        transform: scale(0.98);
      }
      
      .login-footer {
        padding: 16px !important;
        margin-top: 20px !important;
      }
      
      /* Small mobile adjustments */
      @media (max-width: 374px) {
        .login-container {
          padding: 8px;
        }
        
        .login-form {
          padding: 16px !important;
        }
        
        .logo-animation {
          font-size: 40px !important;
        }
      }
      
      /* Tablet styles */
      @media (min-width: 768px) {
        .login-container {
          padding: 24px;
        }
        
        .login-header {
          margin-bottom: 32px;
        }
        
        .logo-animation {
          font-size: 64px !important;
          margin-bottom: 16px !important;
        }
        
        .login-form {
          padding: 24px !important;
          gap: 20px !important;
        }
        
        .login-input {
          padding: 14px 16px !important;
        }
        
        .login-btn {
          min-height: 56px !important;
          padding: 16px !important;
        }
        
        .login-btn:not(:disabled):hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(6, 182, 212, 0.3);
        }
        
        .login-footer {
          padding: 20px !important;
          margin-top: 24px !important;
        }
      }
      
      /* Touch-friendly interactions */
      @media (hover: none) and (pointer: coarse) {
        .login-btn:not(:disabled):hover {
          transform: none;
          box-shadow: initial;
        }
      }
      
      /* Animations */
      @keyframes logoFloat {
        0% { transform: translateY(0px); }
        100% { transform: translateY(-10px); }
      }
      
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      
      @keyframes errorShake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
      }
      
      /* Accessibility improvements */
      @media (prefers-reduced-motion: reduce) {
        .logo-animation,
        .spinner,
        .error-message {
          animation: none;
        }
        
        .login-btn {
          transition: none;
        }
      }
      
      /* High contrast mode */
      @media (prefers-contrast: high) {
        .login-input {
          border-width: 3px;
        }
        
        .login-input:focus {
          border-color: #fff;
          box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.3);
        }
        
        .glass {
          border: 2px solid rgba(255,255,255,0.5);
        }
      }
    </style>
  `
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private api = inject(ApiService);
  private router = inject(Router);

  loading = false;
  error = '';

  form = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required]
  });

  onSubmit() {
    if (this.form.invalid) return;
    const { username, password } = this.form.value as { username: string; password: string };
    this.loading = true;
    this.error = '';
    this.api.login(username, password).subscribe({
      next: (res) => {
        this.loading = false;
        localStorage.setItem('token', res.token);
        localStorage.setItem('judgeName', res.judgeName);
        this.router.navigateByUrl('/tabs/home');
      },
      error: (err) => {
        this.loading = false;
        // Show detailed error message from server
        const errorMessage = err?.error?.error || err?.message || 'Login failed. Please check your credentials and try again.';
        this.error = errorMessage;
        console.error('Login error:', err);
      }
    });
  }
}



