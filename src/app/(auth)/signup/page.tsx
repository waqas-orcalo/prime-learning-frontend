'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

// ─── Validation schema ────────────────────────────────────────────────────────
const signupSchema = z
  .object({
    firstName: z.string().min(2, 'First name must be at least 2 characters'),
    lastName: z.string().min(2, 'Last name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    role: z.enum(['LEARNER', 'TRAINER', 'ORG_ADMIN'], {
      required_error: 'Please select a role',
    }),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Must contain at least one number'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type SignupForm = z.infer<typeof signupSchema>

// ─── Helpers ─────────────────────────────────────────────────────────────────
const FF = "'Inter', sans-serif"
const font = (size: number, weight = 400, color = '#1c1c1c') => ({
  fontFamily: FF,
  fontSize: `${size}px`,
  fontWeight: weight,
  color,
  fontFeatureSettings: "'ss01' 1, 'cv01' 1, 'cv11' 1",
})

const inputRow: React.CSSProperties = {
  backgroundColor: 'rgba(28,28,28,0.05)',
  borderRadius: '8px',
  padding: '8px 14px',
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  border: '1px solid transparent',
}

// ─── Icons ───────────────────────────────────────────────────────────────────
function UserIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M10 10a4.167 4.167 0 1 0 0-8.333A4.167 4.167 0 0 0 10 10zM3.333 17.5c0-3.682 2.985-6.667 6.667-6.667s6.667 2.985 6.667 6.667" stroke="rgba(28,28,28,0.5)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function MailIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="2.5" y="4.5" width="15" height="11" rx="2" stroke="rgba(28,28,28,0.5)" strokeWidth="1.5"/>
      <path d="M2.5 7.5l7.5 5 7.5-5" stroke="rgba(28,28,28,0.5)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
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

function ShieldIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M10 2.5L3.333 5v5c0 4.167 2.917 7.083 6.667 7.5C13.75 17.083 16.667 14.167 16.667 10V5L10 2.5z" stroke="rgba(28,28,28,0.5)" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M7.5 10l2 2 3-3" stroke="rgba(28,28,28,0.5)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function RoleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M2.5 17.5c0-3.682 2.985-6.667 6.667-6.667h1.666c3.682 0 6.667 2.985 6.667 6.667" stroke="rgba(28,28,28,0.5)" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="10" cy="6.667" r="3.333" stroke="rgba(28,28,28,0.5)" strokeWidth="1.5"/>
      <path d="M13.333 3.333c1.334.5 2.5 1.667 2.5 3.334" stroke="rgba(28,28,28,0.5)" strokeWidth="1.5" strokeLinecap="round"/>
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

function RegisterIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <circle cx="13" cy="11" r="5" stroke="#1c1c1c" strokeWidth="1.8"/>
      <path d="M3 27c0-5.523 4.477-10 10-10h4" stroke="#1c1c1c" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M24 18v8M20 22h8" stroke="#1c1c1c" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  )
}

function CaretDownIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M4 6l4 4 4-4" stroke="rgba(28,28,28,0.5)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

// ─── Reusable field row ───────────────────────────────────────────────────────
function FieldRow({
  icon,
  error,
  children,
}: {
  icon: React.ReactNode
  error?: string
  children: React.ReactNode
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <div style={{ ...inputRow, border: error ? '1px solid #f43f5e' : '1px solid transparent' }}>
        {icon}
        {children}
      </div>
      {error && (
        <p style={{ ...font(12, 400, '#f43f5e'), margin: '0 0 0 14px' }}>{error}</p>
      )}
    </div>
  )
}

// ─── API helper ──────────────────────────────────────────────────────────────
async function callSignup(payload: {
  firstName: string
  lastName: string
  email: string
  password: string
  role: string
}): Promise<void> {
  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL ?? 'https://gateway.primecollege.org/api/v1'

  const res = await fetch(`${apiUrl}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    // Backend sends { statusCode, message, data: null, error }
    const message =
      body?.message ??
      body?.error ??
      `Registration failed (HTTP ${res.status})`
    throw new Error(Array.isArray(message) ? message[0] : message)
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function SignupPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [serverError, setServerError] = useState('')
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupForm>({ resolver: zodResolver(signupSchema) })

  const onSubmit = async (data: SignupForm) => {
    setServerError('')
    try {
      await callSignup({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        role: data.role,
      })
      setSuccess(true)
      setTimeout(() => router.push('/login'), 1800)
    } catch (err: unknown) {
      setServerError(
        err instanceof Error ? err.message : 'Registration failed. Please try again.',
      )
    }
  }

  // ── Success state ────────────────────────────────────────────────────────
  if (success) {
    return (
      <div style={{
        width: '590px',
        background: 'linear-gradient(180deg, #c9f2fb 0%, #d8f6fd 20%, #fff 55%)',
        borderRadius: '24px',
        boxShadow: '0px 4px 20px 0px rgba(173,217,242,0.5)',
        padding: '64px 61px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
      }}>
        <div style={{
          width: '64px', height: '64px', borderRadius: '50%',
          backgroundColor: '#dcfce7',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path d="M6 16l7 7 13-13" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h2 style={{ ...font(24, 700, '#000'), margin: 0, textAlign: 'center' }}>
          Account created!
        </h2>
        <p style={{ ...font(15, 400, 'rgba(28,28,28,0.55)'), margin: 0, textAlign: 'center' }}>
          Redirecting you to the login page…
        </p>
      </div>
    )
  }

  // ── Main form ────────────────────────────────────────────────────────────
  return (
    <div style={{
      width: '590px',
      background: 'linear-gradient(180deg, #c9f2fb 0%, #d8f6fd 20%, #fff 55%)',
      borderRadius: '24px',
      boxShadow: '0px 4px 20px 0px rgba(173,217,242,0.5)',
      padding: '48px 61px 52px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}>
      {/* Icon */}
      <div style={{
        width: '56px', height: '56px', borderRadius: '14px',
        backgroundColor: '#fff',
        boxShadow: '0px 2px 8px rgba(0,0,0,0.08)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: '20px',
        flexShrink: 0,
      }}>
        <RegisterIcon />
      </div>

      {/* Title */}
      <h1 style={{
        ...font(34, 700, '#000'),
        letterSpacing: '-0.68px',
        lineHeight: '44px',
        margin: '0 0 28px',
        textAlign: 'center',
        whiteSpace: 'nowrap',
      }}>
        Create your account
      </h1>

      <form
        onSubmit={handleSubmit(onSubmit)}
        style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}
      >
        {/* First + Last name — side by side */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {/* First name */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{
              ...inputRow,
              border: errors.firstName ? '1px solid #f43f5e' : '1px solid transparent',
            }}>
              <UserIcon />
              <input
                {...register('firstName')}
                type="text"
                placeholder="First name"
                style={{
                  flex: 1, border: 'none', background: 'none', outline: 'none',
                  ...font(16, 400, 'rgba(28,28,28,0.6)'),
                  lineHeight: '18px', minWidth: 0,
                }}
              />
            </div>
            {errors.firstName && (
              <p style={{ ...font(11, 400, '#f43f5e'), margin: '0 0 0 14px' }}>
                {errors.firstName.message}
              </p>
            )}
          </div>

          {/* Last name */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{
              ...inputRow,
              border: errors.lastName ? '1px solid #f43f5e' : '1px solid transparent',
            }}>
              <UserIcon />
              <input
                {...register('lastName')}
                type="text"
                placeholder="Last name"
                style={{
                  flex: 1, border: 'none', background: 'none', outline: 'none',
                  ...font(16, 400, 'rgba(28,28,28,0.6)'),
                  lineHeight: '18px', minWidth: 0,
                }}
              />
            </div>
            {errors.lastName && (
              <p style={{ ...font(11, 400, '#f43f5e'), margin: '0 0 0 14px' }}>
                {errors.lastName.message}
              </p>
            )}
          </div>
        </div>

        {/* Email */}
        <FieldRow icon={<MailIcon />} error={errors.email?.message}>
          <input
            {...register('email')}
            type="email"
            placeholder="Email address"
            style={{
              flex: 1, border: 'none', background: 'none', outline: 'none',
              ...font(16, 400, 'rgba(28,28,28,0.6)'),
              lineHeight: '18px',
            }}
          />
        </FieldRow>

        {/* Role selector */}
        <FieldRow icon={<RoleIcon />} error={errors.role?.message}>
          <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
            <select
              {...register('role')}
              defaultValue=""
              style={{
                flex: 1, border: 'none', background: 'none', outline: 'none',
                appearance: 'none', WebkitAppearance: 'none',
                ...font(16, 400, 'rgba(28,28,28,0.6)'),
                lineHeight: '18px',
                cursor: 'pointer',
                paddingRight: '20px',
                width: '100%',
              }}
            >
              <option value="" disabled>Select your role</option>
              <option value="LEARNER">Learner</option>
              <option value="TRAINER">Trainer</option>
              <option value="ORG_ADMIN">Organisation Admin</option>
            </select>
            <div style={{ position: 'absolute', right: 0, pointerEvents: 'none' }}>
              <CaretDownIcon />
            </div>
          </div>
        </FieldRow>

        {/* Password */}
        <FieldRow icon={<KeyIcon />} error={errors.password?.message}>
          <input
            {...register('password')}
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            style={{
              flex: 1, border: 'none', background: 'none', outline: 'none',
              ...font(16, 400, 'rgba(28,28,28,0.6)'),
              lineHeight: '18px',
            }}
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center' }}
          >
            {showPassword ? <EyeIcon /> : <EyeSlashIcon />}
          </button>
        </FieldRow>

        {/* Confirm password */}
        <FieldRow icon={<ShieldIcon />} error={errors.confirmPassword?.message}>
          <input
            {...register('confirmPassword')}
            type={showConfirm ? 'text' : 'password'}
            placeholder="Confirm password"
            style={{
              flex: 1, border: 'none', background: 'none', outline: 'none',
              ...font(16, 400, 'rgba(28,28,28,0.6)'),
              lineHeight: '18px',
            }}
          />
          <button
            type="button"
            onClick={() => setShowConfirm((s) => !s)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center' }}
          >
            {showConfirm ? <EyeIcon /> : <EyeSlashIcon />}
          </button>
        </FieldRow>

        {/* Password hint */}
        <p style={{ ...font(12, 400, 'rgba(28,28,28,0.4)'), margin: '0 0 4px 14px' }}>
          Min. 8 characters — at least one uppercase letter and one number
        </p>

        {/* Server error */}
        {serverError && (
          <div style={{
            padding: '10px 14px',
            backgroundColor: '#fff1f2',
            border: '1px solid #fecdd3',
            borderRadius: '8px',
          }}>
            <p style={{ ...font(13, 400, '#e11d48'), margin: 0 }}>{serverError}</p>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            width: '100%', height: '44px', borderRadius: '8px',
            backgroundColor: '#000', border: 'none',
            ...font(18, 600, '#fff'),
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            opacity: isSubmitting ? 0.7 : 1,
            marginTop: '4px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          }}
        >
          {isSubmitting ? (
            <>
              <svg
                width="18" height="18" viewBox="0 0 18 18" fill="none"
                style={{ animation: 'spin 0.8s linear infinite' }}
              >
                <circle cx="9" cy="9" r="7" stroke="rgba(255,255,255,0.35)" strokeWidth="2"/>
                <path d="M9 2a7 7 0 0 1 7 7" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Creating account…
            </>
          ) : (
            'Create Account'
          )}
        </button>
      </form>

      {/* Divider */}
      <div style={{
        width: '100%', height: '1px',
        backgroundColor: 'rgba(28,28,28,0.12)',
        margin: '20px 0',
      }} />

      {/* Back to login */}
      <p style={{ ...font(15, 400, 'rgba(28,28,28,0.55)'), margin: 0, textAlign: 'center' }}>
        Already have an account?{' '}
        <a
          href="/login"
          style={{
            ...font(15, 600, '#1c1c1c'),
            textDecoration: 'underline',
            textUnderlineOffset: '2px',
          }}
        >
          Log in
        </a>
      </p>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
