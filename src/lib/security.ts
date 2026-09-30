/**
 * Security utilities for authentication and rate limiting
 */

import { supabase } from './supabase'

// Rate limiting configuration
export const SECURITY_CONFIG = {
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes
  ATTEMPT_WINDOW: 5 * 60 * 1000, // 5 minutes
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 128,
} as const

// In-memory rate limiting (for client-side protection)
const loginAttempts = new Map<string, { count: number; lockUntil?: number }>()

export interface RateLimitResult {
  isAllowed: boolean
  attemptsRemaining: number
  lockoutTimeRemaining?: number
}

/**
 * Check if user is rate limited (client-side check)
 */
export function checkClientRateLimit(email: string): RateLimitResult {
  const now = Date.now()
  const attempt = loginAttempts.get(email)

  // Check if user is locked out
  if (attempt?.lockUntil && attempt.lockUntil > now) {
    return {
      isAllowed: false,
      attemptsRemaining: 0,
      lockoutTimeRemaining: attempt.lockUntil - now,
    }
  }

  // Reset if lockout has expired
  if (attempt?.lockUntil && attempt.lockUntil <= now) {
    loginAttempts.delete(email)
    return {
      isAllowed: true,
      attemptsRemaining: SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS,
    }
  }

  const attemptsRemaining = SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS - (attempt?.count || 0)

  return {
    isAllowed: attemptsRemaining > 0,
    attemptsRemaining: Math.max(0, attemptsRemaining),
  }
}

/**
 * Record a failed login attempt
 */
export function recordFailedAttempt(email: string): RateLimitResult {
  const now = Date.now()
  const attempt = loginAttempts.get(email)

  if (!attempt) {
    loginAttempts.set(email, { count: 1 })
  } else {
    const newCount = attempt.count + 1

    if (newCount >= SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS) {
      const lockUntil = now + SECURITY_CONFIG.LOCKOUT_DURATION
      loginAttempts.set(email, { count: newCount, lockUntil })

      return {
        isAllowed: false,
        attemptsRemaining: 0,
        lockoutTimeRemaining: SECURITY_CONFIG.LOCKOUT_DURATION,
      }
    } else {
      loginAttempts.set(email, { count: newCount })
    }
  }

  // Clean up old attempts after window expires
  setTimeout(() => {
    const currentAttempt = loginAttempts.get(email)
    if (currentAttempt && !currentAttempt.lockUntil) {
      loginAttempts.delete(email)
    }
  }, SECURITY_CONFIG.ATTEMPT_WINDOW)

  return checkClientRateLimit(email)
}

/**
 * Clear login attempts for a user (on successful login)
 */
export function clearLoginAttempts(email: string): void {
  loginAttempts.delete(email)
}

/**
 * Format remaining lockout time as MM:SS
 */
export function formatLockoutTime(milliseconds: number): string {
  const totalSeconds = Math.ceil(milliseconds / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (password.length < SECURITY_CONFIG.PASSWORD_MIN_LENGTH) {
    errors.push(`Password minimal ${SECURITY_CONFIG.PASSWORD_MIN_LENGTH} karakter`)
  }

  if (password.length > SECURITY_CONFIG.PASSWORD_MAX_LENGTH) {
    errors.push(`Password maksimal ${SECURITY_CONFIG.PASSWORD_MAX_LENGTH} karakter`)
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Log login attempt to database (DISABLED by default for free tier)
 * To enable: Set NEXT_PUBLIC_ENABLE_DB_LOGGING=true and apply migration
 */
export async function logLoginAttempt(
  email: string,
  success: boolean,
  errorMessage?: string
): Promise<void> {
  // Check if database logging is enabled
  const isDbLoggingEnabled = process.env.NEXT_PUBLIC_ENABLE_DB_LOGGING === 'true'
  
  if (!isDbLoggingEnabled) {
    // Just log to console for debugging (can be removed in production)
    console.log(`[Security] Login attempt: ${email} - ${success ? 'SUCCESS' : 'FAILED'}`)
    return
  }

  try {
    const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown'

    await supabase.rpc('log_login_attempt', {
      user_email: email,
      ip_addr: null,
      user_ag: userAgent,
      is_success: success,
      err_msg: errorMessage || null,
    })
  } catch (error) {
    // Silently fail - don't break login flow
    console.debug('Database logging failed (expected if tables not created):', error)
  }
}

/**
 * Check rate limit from database (DISABLED by default for free tier)
 * For free tier, use client-side rate limiting only
 * To enable: Set NEXT_PUBLIC_ENABLE_DB_LOGGING=true and apply migration
 */
export async function checkDatabaseRateLimit(
  email: string
): Promise<RateLimitResult> {
  const isDbLoggingEnabled = process.env.NEXT_PUBLIC_ENABLE_DB_LOGGING === 'true'
  
  if (!isDbLoggingEnabled) {
    // Use client-side rate limiting for free tier
    return checkClientRateLimit(email)
  }

  try {
    const { data, error } = await supabase.rpc('check_login_rate_limit', {
      user_email: email,
      max_attempts: SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS,
      time_window_minutes: 15,
    })

    if (error) throw error

    if (data && data.length > 0) {
      const result = data[0]
      const lockoutTime = result.locked_until ? new Date(result.locked_until).getTime() : undefined
      const now = Date.now()

      return {
        isAllowed: result.is_allowed,
        attemptsRemaining: SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS - result.attempts_count,
        lockoutTimeRemaining: lockoutTime && lockoutTime > now ? lockoutTime - now : undefined,
      }
    }

    return {
      isAllowed: true,
      attemptsRemaining: SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS,
    }
  } catch (error) {
    // Fallback to client-side rate limiting
    console.debug('Database rate limit check failed, using client-side:', error)
    return checkClientRateLimit(email)
  }
}

/**
 * Sanitize error messages to avoid leaking sensitive information
 */
export function sanitizeErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    // Don't expose specific Supabase errors
    if (error.message.includes('Invalid login credentials')) {
      return 'Email atau password salah'
    }
    if (error.message.includes('Email not confirmed')) {
      return 'Email belum diverifikasi'
    }
    if (error.message.includes('rate limit')) {
      return 'Terlalu banyak percobaan login. Silakan coba lagi nanti'
    }
  }
  return 'Terjadi kesalahan saat login. Silakan coba lagi'
}
