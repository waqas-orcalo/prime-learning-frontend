'use client'

import { useEffect } from 'react'
import { useAppStore, type Toast } from '@/store'

const COLORS: Record<Toast['type'], { bg: string; border: string; icon: string }> = {
  success: { bg: '#f0fdf4', border: '#22c55e', icon: '✓' },
  error:   { bg: '#fff1f2', border: '#f43f5e', icon: '✕' },
  warning: { bg: '#fffbeb', border: '#f59e0b', icon: '!' },
  info:    { bg: '#eff6ff', border: '#3b82f6', icon: 'i' },
}

function ToastItem({ toast }: { toast: Toast }) {
  const { removeToast } = useAppStore()
  const colors = COLORS[toast.type]

  useEffect(() => {
    const timer = setTimeout(() => removeToast(toast.id), toast.duration ?? 4000)
    return () => clearTimeout(timer)
  }, [toast.id, toast.duration, removeToast])

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '10px',
      padding: '12px 16px', borderRadius: '10px',
      backgroundColor: colors.bg,
      border: `1px solid ${colors.border}`,
      boxShadow: '0px 4px 12px rgba(0,0,0,0.1)',
      minWidth: '280px', maxWidth: '400px',
      fontFamily: "'Inter', sans-serif",
    }}>
      <span style={{ fontSize: '14px', fontWeight: 700, color: colors.border }}>{colors.icon}</span>
      <span style={{ flex: 1, fontSize: '14px', color: '#1e293b' }}>{toast.message}</span>
      <button
        onClick={() => removeToast(toast.id)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: '#94a3b8', padding: '0 2px' }}
      >×</button>
    </div>
  )
}

export default function ToastContainer() {
  const { toasts } = useAppStore()
  if (!toasts.length) return null

  return (
    <div style={{
      position: 'fixed', bottom: '24px', right: '24px',
      zIndex: 9999,
      display: 'flex', flexDirection: 'column', gap: '8px',
    }}>
      {toasts.map((t) => <ToastItem key={t.id} toast={t} />)}
    </div>
  )
}
