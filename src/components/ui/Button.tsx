import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  children: ReactNode
}

const VARIANTS = {
  primary:   { bg: '#4f46e5', color: '#fff', border: 'none' },
  secondary: { bg: '#f1f5f9', color: '#475569', border: 'none' },
  outline:   { bg: 'transparent', color: '#4f46e5', border: '1px solid #4f46e5' },
  ghost:     { bg: 'transparent', color: '#475569', border: 'none' },
  danger:    { bg: '#fff1f2', color: '#e11d48', border: '1px solid #fecdd3' },
}

const SIZES = {
  sm: { padding: '6px 12px', fontSize: '12px', borderRadius: '8px', height: '32px' },
  md: { padding: '8px 16px', fontSize: '14px', borderRadius: '10px', height: '40px' },
  lg: { padding: '12px 24px', fontSize: '15px', borderRadius: '12px', height: '48px' },
}

export default function Button({
  variant = 'primary', size = 'md', loading, children, style, disabled, ...props
}: ButtonProps) {
  const v = VARIANTS[variant]
  const s = SIZES[size]

  return (
    <button
      disabled={disabled || loading}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        gap: '6px', cursor: disabled || loading ? 'not-allowed' : 'pointer',
        fontFamily: "'Inter', sans-serif", fontWeight: 600,
        letterSpacing: '-0.03px', transition: 'all 0.15s',
        opacity: disabled ? 0.5 : 1,
        backgroundColor: v.bg, color: v.color, border: v.border,
        ...s,
        ...style,
      }}
      {...props}
    >
      {loading ? 'Loading…' : children}
    </button>
  )
}
