interface BadgeProps {
  label: string
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral'
}

const VARIANT_STYLES: Record<NonNullable<BadgeProps['variant']>, { bg: string; color: string }> = {
  primary: { bg: '#eef2ff', color: '#4f46e5' },
  success: { bg: '#f0fdf4', color: '#16a34a' },
  warning: { bg: '#fffbeb', color: '#d97706' },
  danger:  { bg: '#fff1f2', color: '#e11d48' },
  info:    { bg: '#eff6ff', color: '#2563eb' },
  neutral: { bg: '#f1f5f9', color: '#475569' },
}

export default function Badge({ label, variant = 'neutral' }: BadgeProps) {
  const { bg, color } = VARIANT_STYLES[variant]
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '3px 10px', borderRadius: '20px',
      backgroundColor: bg, color,
      fontFamily: "'Inter', sans-serif",
      fontSize: '12px', fontWeight: 600,
      letterSpacing: '-0.03px', whiteSpace: 'nowrap',
    }}>
      {label}
    </span>
  )
}
