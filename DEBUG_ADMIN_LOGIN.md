# Debug Admin Login Issue

## 🔍 Changes Made for Debugging

### 1. Removed Duplicate Access Check
**File**: `src/app/features/leaderboard/leaderboard.component.ts`

- Removed the `*ngIf="!isAdmin"` access denied message
- Removed the `*ngIf="isAdmin"` wrapper around leaderboard content
- **Reason**: Route guard already protects the page, no need for duplicate check

### 2. Added Console Logging

#### Login Component
```typescript
console.log('✅ Login successful:', { userId, name, isAdmin, submitted });
console.log('📦 Stored in localStorage:', { isAdmin, userName });
console.log('🔄 Redirecting admin to leaderboard');
```

#### Admin Guard
```typescript
console.log('🛡️ adminOnlyGuard check:', { isAdmin, rawValue });
console.log('✅ Access granted to leaderboard');
```

#### Leaderboard Component
```typescript
console.log('🏆 Leaderboard component initialized');
console.log('👤 User info:', { isAdmin, userName, rawIsAdmin });
console.log('📊 Leaderboard data received:', rows);
```

## 🧪 How to Debug

### Step 1: Open Browser Console
1. Press F12 to open Developer Tools
2. Go to Console tab
3. Clear the console (click 🚫 icon)

### Step 2: Login as Admin
1. Enter admin user credentials (ISADMIN = Y)
2. Click "Sign In"

### Step 3: Check Console Output

You should see this sequence:

```
✅ Login successful: { userId: "admin1", name: "Admin User", isAdmin: true, submitted: false }
📦 Stored in localStorage: { isAdmin: "true", userName: "Admin User" }
🔄 Redirecting admin to leaderboard
🛡️ adminOnlyGuard check: { isAdmin: true, rawValue: "true" }
✅ Access granted to leaderboard
🏆 Leaderboard component initialized
👤 User info: { isAdmin: true, userName: "Admin User", rawIsAdmin: "true" }
📊 Leaderboard data received: [...]
```

## 🐛 Possible Issues and Solutions

### Issue 1: isAdmin is false or "false"
**Symptoms**:
```
📦 Stored in localStorage: { isAdmin: "false", ... }
```

**Cause**: User in Google Sheets has ISADMIN = N

**Solution**: 
1. Open Users Sheet
2. Find the user row
3. Change ISADMIN column to "Y"
4. Try logging in again

### Issue 2: Guard blocks access
**Symptoms**:
```
🛡️ adminOnlyGuard check: { isAdmin: false, rawValue: "false" }
❌ Access denied - redirecting to home
```

**Cause**: localStorage has wrong value

**Solution**:
1. Clear browser cache/localStorage
2. Login again
3. Or manually check Users Sheet

### Issue 3: No leaderboard data
**Symptoms**:
```
📊 Leaderboard data received: []
```

**Cause**: No evaluations in sheet or API error

**Solution**:
1. Check browser console for API errors
2. Verify Evaluations Sheet has data
3. Check service account has access to sheet

### Issue 4: Redirect loop
**Symptoms**: Page keeps redirecting

**Cause**: Guard and component fighting

**Solution**: Already fixed by removing duplicate check

## 📋 Checklist

Before reporting an issue, verify:

- [ ] User exists in Users Sheet
- [ ] ISADMIN column is exactly "Y" (uppercase)
- [ ] Browser console shows login success
- [ ] localStorage has isAdmin = "true"
- [ ] Guard allows access
- [ ] Leaderboard component initializes
- [ ] API returns data

## 🔧 Manual Testing

### Test 1: Check localStorage
After login, in console run:
```javascript
console.log({
  isAdmin: localStorage.getItem('isAdmin'),
  userName: localStorage.getItem('userName'),
  userId: localStorage.getItem('userId')
});
```

Should show:
```
{ isAdmin: "true", userName: "Admin User", userId: "admin1" }
```

### Test 2: Check Users Sheet
1. Open: https://docs.google.com/spreadsheets/d/1jLyGbkHE_fopA1QwYHsvezRZeNBu4ylXTiVQol0QNDQ/edit
2. Find your user row
3. Verify ISADMIN column = "Y"

### Test 3: Force Navigate
After login, in console run:
```javascript
window.location.href = '/tabs/leaderboard';
```

If this works but normal login doesn't, there's a routing issue.

## 🎯 Expected Behavior

### Admin Login Flow
```
1. Enter credentials
2. Click Sign In
3. API validates user
4. Response: { isAdmin: true, ... }
5. Store in localStorage
6. Redirect to /tabs/leaderboard
7. Guard checks isAdmin = true
8. Allow access
9. Leaderboard loads
10. Show data
```

### What You Should See
- URL: `http://localhost:4200/tabs/leaderboard`
- Bottom tabs: Only Leaderboard + Profile
- Page content: Team rankings with podium
- Console: Success messages

### What You Should NOT See
- Home or Scoring tabs
- "Access Denied" message
- Redirect to home page
- Empty leaderboard (unless no data)

## 📞 Next Steps

1. **Try logging in** with admin user
2. **Check console** for the log messages
3. **Copy the console output** if there's an issue
4. **Check Users Sheet** to verify ISADMIN = Y
5. **Clear cache** and try again if needed

The console logs will tell us exactly where the problem is!
