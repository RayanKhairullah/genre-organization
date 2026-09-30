# 🔒 Security Documentation - GenRe Bengkulu Admin Panel

## Overview

Sistem admin GenRe Bengkulu dilengkapi dengan berbagai fitur keamanan untuk melindungi dari serangan umum seperti brute force, credential stuffing, dan unauthorized access.

## Security Features

### 1. 👁️ Password Visibility Toggle

- Eye icon untuk toggle visibility password
- Menggunakan icon dari `lucide-react` (Eye/EyeOff)
- Input type toggle antara `password` dan `text`
- Attribute `autocomplete="current-password"` untuk browser security

### 2. 🚫 Rate Limiting & Brute Force Protection

#### Client-Side Protection
- **Maksimal percobaan**: 5 attempts per 15 menit
- **Auto-lockout**: Setelah 5 percobaan gagal, akun dikunci selama 15 menit
- **Real-time counter**: Menampilkan sisa percobaan yang tersisa
- **Countdown timer**: Menampilkan waktu tersisa saat akun dikunci

#### Features:
```typescript
// Konfigurasi keamanan
MAX_LOGIN_ATTEMPTS: 5
LOCKOUT_DURATION: 15 minutes
ATTEMPT_WINDOW: 5 minutes
```

**Visual Feedback:**
- ⚠️ Warning saat sisa percobaan < 5
- 🔒 Button disabled saat dikunci dengan countdown
- ❌ Error message yang user-friendly

### 3. 📝 Login Attempt Logging (Database) - OPTIONAL, PRO PLAN ONLY

⚠️ **NOT recommended for FREE tier** - Save your 500 MB database quota!

#### Why Skip Database Logging for Free Tier?

**Supabase Free Tier:**
- 💾 Database limit: 500 MB per project
- 📊 Login attempts bisa ratusan/hari (spam bots)
- ⚠️ 30,000 attempts/month = 30 MB (6% quota!)
- 🎯 Priority: Data PIK-R > Security logs

**Current Setup (Client-Side Only):**
- ✅ Rate limiting tetap aktif
- ✅ Zero database impact
- ✅ Perfect untuk free tier
- ✅ Proteksi brute force efektif

#### Optional: Enable for Pro Plan ($25/month)

If you need compliance/audit trail:

**Step 1:** Set environment variable:
```env
NEXT_PUBLIC_ENABLE_DB_LOGGING=true
```

**Step 2:** Apply migration (see below)

File migration: `supabase-security-migration.sql`

**Tables:**
1. `login_attempts` - Track semua login attempts
2. `admin_activity_logs` - Audit trail untuk admin activities

**Features:**
- Log setiap percobaan login (success/failed)
- Simpan IP address, user agent, timestamp
- Automatic cleanup untuk data lama (30 hari untuk login attempts, 90 hari untuk activity logs)
- Row Level Security (RLS) enabled

#### Database Functions

```sql
-- Check rate limit dari database
SELECT * FROM check_login_rate_limit('user@example.com', 5, 15);

-- Log login attempt
SELECT log_login_attempt('user@example.com', '192.168.1.1', 'Mozilla/5.0...', false, 'Invalid password');

-- Cleanup old records
SELECT cleanup_old_login_attempts();
```

### 4. 🛡️ Input Validation

#### Email Validation
- Format validation dengan regex
- Case-insensitive
- Prevents SQL injection melalui prepared statements

#### Password Validation
- Minimum length: 8 characters
- Maximum length: 128 characters
- Prevents buffer overflow attacks

### 5. 🔐 Error Message Sanitization

**Masalah:** Error messages yang terlalu spesifik bisa membantu attacker
**Solusi:** Sanitize semua error messages

```typescript
// ❌ Bad - Terlalu spesifik
"User not found" vs "Invalid password"

// ✅ Good - Generic
"Email atau password salah"
```

**Benefits:**
- Tidak expose informasi tentang user existence
- Consistent error messages
- Proteksi dari user enumeration attacks

### 6. 🎯 Session Management

- Menggunakan Supabase Auth dengan JWT
- Auto session refresh
- Secure cookie dengan httpOnly flag (handled by Supabase)
- Session timeout handling

## Implementation

### File Structure

```
src/
├── app/admin/
│   ├── layout.tsx          # Login UI dengan security features
│   └── page.tsx            # Admin dashboard
├── lib/
│   ├── security.ts         # Security utilities
│   └── supabase.ts         # Supabase client
└── components/
    └── admin/              # Admin components
```

### Key Files

**1. `/src/lib/security.ts`**
- Rate limiting logic
- Input validation
- Error sanitization
- Login attempt logging

**2. `/src/app/admin/layout.tsx`**
- Login form dengan eye icon
- Rate limiting UI
- Session management

**3. `/supabase-security-migration.sql`**
- Database tables untuk logging
- RLS policies
- Helper functions

## Setup Instructions

### ⚡ Zero Setup Required (FREE Tier)

**All security features work out of the box!**

1. ✅ Eye icon toggle - Already working
2. ✅ Rate limiting - Client-side, in-memory
3. ✅ Auto lockout - 15 minutes
4. ✅ Input validation - Built-in
5. ✅ Error sanitization - Automatic

**No database tables needed!** Perfect for Supabase free tier. 🎉

### 🏢 Optional Setup (PRO Plan Only)

### 1. Install Dependencies (Already Done)

Dependencies already included:
- `lucide-react` - Icons untuk eye toggle
- `@supabase/supabase-js` - Supabase client

### 2. Apply Database Migration (ONLY if Pro Plan + Need Audit Trail)

⚠️ **Skip this for FREE tier!**

```bash
# Only if you have Pro Plan and need database logging
# 1. Set NEXT_PUBLIC_ENABLE_DB_LOGGING=true in .env
# 2. Apply migration via Supabase Dashboard
```

### 3. Environment Variables

Pastikan `.env` sudah configure:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## Usage

### For Users

1. **Login Normal:**
   - Masukkan email dan password
   - Click eye icon untuk toggle visibility password
   - Click "Sign in"

2. **Rate Limited:**
   - Setelah 5 percobaan gagal, akun dikunci 15 menit
   - Countdown timer akan muncul
   - Button disabled selama lockout period

3. **Security Indicators:**
   - Sisa percobaan ditampilkan setelah login gagal
   - Warning muncul saat sisa percobaan < 5
   - Status lockout dengan countdown realtime

### For Developers

```typescript
// Check rate limit
import { checkClientRateLimit } from '@/lib/security'

const result = checkClientRateLimit('user@example.com')
console.log(result.isAllowed) // true/false
console.log(result.attemptsRemaining) // 0-5
console.log(result.lockoutTimeRemaining) // milliseconds

// Record failed attempt
import { recordFailedAttempt } from '@/lib/security'

const result = recordFailedAttempt('user@example.com')
// Auto lockout after 5 attempts

// Clear attempts on success
import { clearLoginAttempts } from '@/lib/security'

clearLoginAttempts('user@example.com')

// Log to database (optional)
import { logLoginAttempt } from '@/lib/security'

await logLoginAttempt('user@example.com', true) // success
await logLoginAttempt('user@example.com', false, 'Invalid password') // failed
```

## Security Best Practices

### ✅ Implemented (FREE Tier Ready)

1. **Rate Limiting** - Client-side, zero database impact
2. **Account Lockout** - Temporary ban dengan countdown
3. **Error Sanitization** - Tidak expose sensitive info
4. **Input Validation** - Email format, password length
5. **Session Management** - Secure JWT dengan auto-refresh
6. **Password Visibility Toggle** - UX improvement
7. **Zero Database Tables** - Hemat quota untuk data penting

### 🚀 Recommended Improvements (Future)

1. **Two-Factor Authentication (2FA)**
   - TOTP-based (Google Authenticator)
   - SMS/Email verification

2. **IP-based Rate Limiting**
   - Track per IP address bukan hanya email
   - Prevent distributed brute force

3. **CAPTCHA**
   - Google reCAPTCHA v3
   - Setelah 2-3 failed attempts

4. **Password Strength Meter**
   - Visual indicator saat set/change password
   - Enforce strong password policy

5. **Session Device Management**
   - List active sessions
   - Logout from other devices

6. **Anomaly Detection**
   - Login dari lokasi berbeda
   - Unusual activity patterns
   - Email notifications

7. **Rate Limit dengan Redis**
   - Untuk production scalability
   - Shared state across instances

## Monitoring & Alerts

### View Login Attempts (if migration applied)

```sql
-- Recent failed attempts
SELECT 
  email, 
  attempted_at, 
  error_message,
  ip_address
FROM login_attempts 
WHERE success = false 
ORDER BY attempted_at DESC 
LIMIT 20;

-- Suspicious activity (multiple failed attempts)
SELECT 
  email, 
  COUNT(*) as attempt_count,
  MAX(attempted_at) as last_attempt
FROM login_attempts 
WHERE success = false 
  AND attempted_at > NOW() - INTERVAL '1 hour'
GROUP BY email
HAVING COUNT(*) >= 3
ORDER BY attempt_count DESC;

-- Success rate by email
SELECT 
  email,
  COUNT(*) FILTER (WHERE success = true) as successful,
  COUNT(*) FILTER (WHERE success = false) as failed,
  COUNT(*) as total
FROM login_attempts
WHERE attempted_at > NOW() - INTERVAL '24 hours'
GROUP BY email
ORDER BY failed DESC;
```

### Automated Cleanup

```sql
-- Run cleanup manually
SELECT cleanup_old_login_attempts();

-- Or setup cron job (requires pg_cron extension)
SELECT cron.schedule(
  'cleanup-old-login-attempts',
  '0 2 * * *', -- Daily at 2 AM
  'SELECT cleanup_old_login_attempts()'
);
```

## Testing

### Test Rate Limiting

1. Try login dengan password salah 5 kali
2. Verify account dikunci setelah attempt ke-5
3. Verify countdown timer berjalan
4. Wait atau refresh setelah 15 menit
5. Verify account unlocked

### Test Eye Icon

1. Ketik password di input field
2. Click eye icon
3. Verify password visible
4. Click eye icon lagi
5. Verify password hidden

### Test Error Messages

1. Login dengan email tidak terdaftar
2. Verify generic error: "Email atau password salah"
3. Login dengan password salah
4. Verify sama: "Email atau password salah"

## Security Checklist

- [x] Password visibility toggle dengan eye icon
- [x] Rate limiting (5 attempts per 15 minutes)
- [x] Account lockout dengan countdown timer
- [x] Email format validation
- [x] Password length validation
- [x] Error message sanitization
- [x] Login attempt logging (optional, database)
- [x] Session management dengan JWT
- [x] Row Level Security (RLS) pada tables
- [x] Automatic cleanup untuk old logs
- [x] Visual feedback (warnings, counters, timers)
- [x] Accessible (ARIA labels, keyboard navigation)

## Support

Jika ada pertanyaan atau menemukan security vulnerability:

1. **Jangan** buat public issue di GitHub
2. Report via email ke security team
3. Tunggu response sebelum disclose

---

**Last Updated:** September 2026  
**Version:** 1.0.0  
**Maintained by:** GenRe Bengkulu Development Team
