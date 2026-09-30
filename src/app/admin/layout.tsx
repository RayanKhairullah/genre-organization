'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'
import { ThemeToggle } from '@/components/ThemeToggle'
import { AdminLogo } from '@/components/admin/AdminLogo'
import { Eye, EyeOff } from 'lucide-react'
import {
  checkClientRateLimit,
  recordFailedAttempt,
  clearLoginAttempts,
  formatLockoutTime,
  isValidEmail,
  sanitizeErrorMessage,
  logLoginAttempt,
  SECURITY_CONFIG,
  type RateLimitResult,
} from '@/lib/security'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900 transition-colors">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 dark:border-blue-900 border-t-blue-600 dark:border-t-blue-500" />
      </div>
    )
  }

  if (!user) {
    return <AdminLogin />
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Admin Header - Mobile Optimized */}
      <header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-white/70 dark:supports-[backdrop-filter]:bg-gray-900/60 bg-white/90 dark:bg-gray-900/80 border-b border-gray-200/70 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center py-2.5 sm:py-3">
            {/* Left side - Logo & Title */}
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <div className="flex-shrink-0">
                <AdminLogo size="sm" withLink />
              </div>
              <div className="space-y-0.5 min-w-0 flex-1">
                <h1 className="text-sm sm:text-xl lg:text-2xl font-semibold text-gray-900 dark:text-gray-100 tracking-tight truncate">
                  Admin Dashboard Genre
                </h1>
                <p className="text-[10px] sm:text-xs lg:text-sm text-gray-600 dark:text-gray-400 truncate">
                  {user.email}
                </p>
              </div>
            </div>
            
            {/* Right side - Actions */}
            <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-3 flex-shrink-0">
              <ThemeToggle />
              <Link
                href="/"
                className="hidden lg:inline-flex px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title="Lihat Situs Publik"
              >
                Lihat Situs Publik
              </Link>
              <Link
                href="/"
                className="lg:hidden inline-flex p-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title="Lihat Situs Publik"
                aria-label="Lihat Situs Publik"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </Link>
              <button
                onClick={handleSignOut}
                className="inline-flex items-center px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-lg bg-red-600 hover:bg-red-700 text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
              >
                <span className="hidden sm:inline">Logout</span>
                <span className="sm:hidden">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Admin Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        {children}
      </main>
    </div>
  )
}

function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [rateLimit, setRateLimit] = useState<RateLimitResult>({
    isAllowed: true,
    attemptsRemaining: SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS,
  })

  // Update lockout timer
  useEffect(() => {
    if (rateLimit.lockoutTimeRemaining && rateLimit.lockoutTimeRemaining > 0) {
      const timer = setInterval(() => {
        const newRateLimit = checkClientRateLimit(email)
        setRateLimit(newRateLimit)
        
        if (newRateLimit.isAllowed) {
          setError(null)
        }
      }, 1000)
      
      return () => clearInterval(timer)
    }
  }, [rateLimit.lockoutTimeRemaining, email])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Basic input validation
    if (!email || !password) {
      setError('Email dan password harus diisi')
      setLoading(false)
      return
    }

    // Email format validation
    if (!isValidEmail(email)) {
      setError('Format email tidak valid')
      setLoading(false)
      return
    }

    // Check client-side rate limiting
    const rateLimitCheck = checkClientRateLimit(email)
    if (!rateLimitCheck.isAllowed) {
      setRateLimit(rateLimitCheck)
      if (rateLimitCheck.lockoutTimeRemaining) {
        setError(`Terlalu banyak percobaan login gagal. Akun dikunci selama ${formatLockoutTime(rateLimitCheck.lockoutTimeRemaining)}`)
      }
      setLoading(false)
      return
    }

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(), // Add trim() to prevent trailing space errors
        password,
      })

      if (authError) {
        // Record failed attempt
        const newRateLimit = recordFailedAttempt(email)
        setRateLimit(newRateLimit)

        // Log to database (optional)
        await logLoginAttempt(email, false, sanitizeErrorMessage(authError))

        // Show user-friendly error
        if (newRateLimit.lockoutTimeRemaining) {
          setError(`Terlalu banyak percobaan login gagal. Akun dikunci selama 15 menit.`)
        } else {
          setError(`Email atau password salah. Sisa ${newRateLimit.attemptsRemaining} percobaan.`)
        }
        
        // Return instead of throwing to prevent the Next.js console/crash overlay
        return 
      }

      // Success - clear attempts and log
      clearLoginAttempts(email)
      await logLoginAttempt(email, true)
      
      // Reset state
      setRateLimit({
        isAllowed: true,
        attemptsRemaining: SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS,
      })
      
    } catch (error) {
      // This will now only catch genuine code/network exceptions
      console.error('Unexpected login error:', error)
      setError('Terjadi kesalahan pada sistem. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="max-w-md w-full space-y-6 p-6">
        <div>
          <h2 className="mt-2 text-center text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-white">GenRe Kota Bengkulu</h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">Masuk ke dashboard admin</p>
        </div>
        
        <form className="mt-6 space-y-4" onSubmit={handleLogin}>
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Password
              </label>
              <div className="relative mt-1">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || !rateLimit.isAllowed}
              className="group relative w-full flex justify-center py-2.5 px-4 text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </>
              ) : rateLimit.lockoutTimeRemaining ? (
                `Dikunci (${formatLockoutTime(rateLimit.lockoutTimeRemaining)})`
              ) : (
                'Sign in'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
