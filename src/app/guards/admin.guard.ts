import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { CanActivateFn } from '@angular/router';

// Guard to redirect admins away from judge-only pages
export const judgeOnlyGuard: CanActivateFn = () => {
  const router = inject(Router);
  const isAdmin = localStorage.getItem('isAdmin') === 'true';
  
  if (isAdmin) {
    // Admins should not access judge pages, redirect to leaderboard
    router.navigate(['/tabs/leaderboard']);
    return false;
  }
  
  return true;
};

// Guard to allow only admins to access admin pages
export const adminOnlyGuard: CanActivateFn = () => {
  const router = inject(Router);
  const isAdmin = localStorage.getItem('isAdmin') === 'true';
  
  console.log('🛡️ adminOnlyGuard check:', {
    isAdmin,
    rawValue: localStorage.getItem('isAdmin')
  });
  
  if (!isAdmin) {
    // Non-admins should not access admin pages, redirect to home
    console.log('❌ Access denied - redirecting to home');
    router.navigate(['/tabs/home']);
    return false;
  }
  
  console.log('✅ Access granted to leaderboard');
  return true;
};
