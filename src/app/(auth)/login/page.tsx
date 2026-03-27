'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { useForm } from 'react-hook-form'

// ── Form types ────────────────────────────────────────────────────────────────
type LoginForm = {
  email: string
  password: string
}

const FF = "'Inter', sans-serif"
const font = (size: number, weight = 400, color = '#1c1c1c') => ({
  fontFamily: FF, fontSize: `${size}px`, fontWeight: weight, color,
  fontFeatureSettings: "'ss01' 1, 'cv01' 1, 'cv11' 1",
} as React.CSSProperties)

function UserIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M10 10a4.167 4.167 0 1 0 0-8.333A4.167 4.167 0 0 0 10 10zM3.333 17.5c0-3.682 2.985-6.667 6.667-6.667s6.667 2.985 6.667 6.667" stroke="rgba(28,28,28,0.5)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}
function KeyIcon({ color = 'rgba(28,28,28,0.5)' }: { color?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="7.5" cy="7.5" r="4.167" stroke={color} strokeWidth="1.5"/>
      <path d="M10.5 10.5L17.5 17.5M15 15.5l2 2M13.5 17l2-2" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}
function EyeSlashIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M2.5 2.5l15 15M8.5 8.578A2.5 2.5 0 0 0 11.41 11.5M4.167 5.057A9.19 9.19 0 0 0 1.667 10c1.5 4 5 6.667 8.333 6.667a9.036 9.036 0 0 0 4.5-1.19M7.5 3.57A9.287 9.287 0 0 1 10 3.333C13.333 3.333 16.833 6 18.333 10a9.88 9.88 0 0 1-1.083 2.22" stroke="rgba(28,28,28,0.5)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}
function EyeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M1.667 10C3.167 6 6.667 3.333 10 3.333c3.333 0 6.833 2.667 8.333 6.667-1.5 4-5 6.667-8.333 6.667C6.667 16.667 3.167 14 1.667 10z" stroke="rgba(28,28,28,0.5)" strokeWidth="1.5"/>
      <circle cx="10" cy="10" r="2.5" stroke="rgba(28,28,28,0.5)" strokeWidth="1.5"/>
    </svg>
  )
}
function LoginIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <path d="M12 6H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h5M21 11l5 5-5 5M26 16H14" stroke="#1c1c1c" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}
function Spinner() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ animation: 'spin 0.8s linear infinite' }}>
      <circle cx="9" cy="9" r="7" stroke="rgba(255,255,255,0.3)" strokeWidth="2.2"/>
      <path d="M9 2a7 7 0 0 1 7 7" stroke="#fff" strokeWidth="2.2" strokeLinecap="round"/>
    </svg>
  )
}

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword]   = useState(false)
  const [serverError, setServerError]     = useState('')
  const [isSubmitting, setIsSubmitting]   = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>()

  const onSubmit = async (data: LoginForm) => {
    setServerError('')
    setIsSubmitting(true)

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'https://gateway.primecollege.org/api/v1'

      // ── Step 1: Pre-validate against backend to get a real error message ──
      // We call the backend first so we can surface specific messages like
      // "Invalid credentials" or "Account blocked" directly to the user.
      const res = await fetch(`${apiUrl}/auth/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email, password: data.password }),
      })

      if (!res.ok) {
        // Parse backend error message (handles both string and array forms)
        const body = await res.json().catch(() => ({}))
        const msg = body?.message
        const errorText = Array.isArray(msg)
          ? msg[0]
          : msg || 'Invalid email or password'
        setServerError(errorText)
        setIsSubmitting(false)
        return
      }

      // ── Step 2: Grab the role from the successful response ────────────────
      const responseBody = await res.json().catch(() => ({}))
      const userRole: string = responseBody?.data?.user?.role ?? ''
      const isAdmin = userRole === 'SUPER_ADMIN' || userRole === 'ORG_ADMIN'

      // ── Step 3: Credentials are valid — create the NextAuth session ────────
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (!result?.ok) {
        // This path is hit when the backend is unreachable from the server
        // side (different host in SSR context). Fall back gracefully.
        setServerError('Login failed. Please try again.')
        setIsSubmitting(false)
        return
      }

      // Success → route to role-appropriate home
      router.push(isAdmin ? '/admin' : '/dashboard')
      router.refresh()
    } catch {
      // Network error (backend not running)
      setServerError('Cannot reach the server. Please check your connection.')
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      <div style={{
        width: '590px',
        background: 'linear-gradient(180deg, #c9f2fb 0%, #d8f6fd 20%, #fff 55%)',
        borderRadius: '24px',
        boxShadow: '0px 4px 20px 0px rgba(173,217,242,0.5)',
        padding: '48px 61px 56px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        {/* Icon */}
        <div style={{ width: 56, height: 56, borderRadius: 14, backgroundColor: '#fff', boxShadow: '0px 2px 8px rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
          <LoginIcon />
        </div>

        {/* Title */}
        <h1 style={{ ...font(36, 700, '#000'), letterSpacing: '-0.72px', lineHeight: '46px', margin: '0 0 32px', textAlign: 'center', whiteSpace: 'nowrap' as const }}>
          Sign in with email
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>

          {/* Email */}
          <div style={{ backgroundColor: 'rgba(28,28,28,0.05)', borderRadius: 8, padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 6, border: errors.email ? '1px solid #f43f5e' : '1px solid transparent', marginBottom: 2 }}>
            <UserIcon />
            <input
              {...register('email', {
                required: 'Please enter a valid email',
                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Please enter a valid email' },
              })}
              type="email"
              placeholder="Email address"
              autoComplete="email"
              style={{ flex: 1, border: 'none', background: 'none', outline: 'none', ...font(16, 400, 'rgba(28,28,28,0.6)'), lineHeight: '18px' }}
            />
          </div>
          {errors.email && <p style={{ ...font(12, 400, '#f43f5e'), margin: '0 0 4px 14px' }}>{errors.email.message}</p>}

          {/* Password */}
          <div style={{ backgroundColor: 'rgba(28,28,28,0.05)', borderRadius: 8, padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 6, border: errors.password ? '1px solid #f43f5e' : '1px solid transparent' }}>
            <KeyIcon />
            <input
              {...register('password', {
                required: 'Password must be at least 8 characters',
                minLength: { value: 8, message: 'Password must be at least 8 characters' },
              })}
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              autoComplete="current-password"
              style={{ flex: 1, border: 'none', background: 'none', outline: 'none', ...font(16, 400, 'rgba(28,28,28,0.6)'), lineHeight: '18px' }}
            />
            <button type="button" onClick={() => setShowPassword(s => !s)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, display: 'flex', alignItems: 'center' }}>
              {showPassword ? <EyeIcon /> : <EyeSlashIcon />}
            </button>
          </div>
          {errors.password && <p style={{ ...font(12, 400, '#f43f5e'), margin: '0 0 4px 14px' }}>{errors.password.message}</p>}

          {/* Forgot password */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 2, marginBottom: 6 }}>
            <a href="#" style={{ ...font(16, 400, '#1c1c1c'), textDecoration: 'none', lineHeight: '18px' }}>
              Forgot password?
            </a>
          </div>

          {/* Server error */}
          {serverError && (
            <div style={{ padding: '10px 14px', backgroundColor: '#fff1f2', border: '1px solid #fecdd3', borderRadius: 8, marginBottom: 4 }}>
              <p style={{ ...font(13, 400, '#e11d48'), margin: 0 }}>{serverError}</p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            style={{ width: '100%', height: 44, borderRadius: 8, backgroundColor: '#000', border: 'none', ...font(18, 600, '#fff'), cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? 0.8 : 1, marginTop: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          >
            {isSubmitting ? (
              <><Spinner />Signing in…</>
            ) : 'Login'}
          </button>
        </form>

        {/* Divider */}
        <div style={{ width: '100%', height: 1, backgroundColor: 'rgba(28,28,28,0.12)', margin: '24px 0' }} />

        {/* SSO + Microsoft */}
        <div style={{ display: 'flex', gap: 16, width: '100%' }}>
          {['Sign in with SSO', 'Sign in with Microsoft'].map(label => (
            <button key={label} type="button" style={{ flex: 1, height: 44, borderRadius: 8, border: '1px solid #1c1c1c', backgroundColor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer', ...font(18, 600, '#1c1c1c') }}>
              <KeyIcon color="#1c1c1c" />
              {label}
            </button>
          ))}
        </div>

        {/* Sign up link */}
        <p style={{ ...font(15, 400, 'rgba(28,28,28,0.55)'), margin: '20px 0 0', textAlign: 'center' as const }}>
          Don&apos;t have an account?{' '}
          <a href="/signup" style={{ ...font(15, 600, '#1c1c1c'), textDecoration: 'underline', textUnderlineOffset: '2px' }}>
            Sign up
          </a>
        </p>
      </div>
    </>
  )
}
