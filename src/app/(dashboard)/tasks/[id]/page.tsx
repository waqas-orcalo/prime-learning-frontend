'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { apiFetch } from '@/lib/api-client'

// ── Style helpers ─────────────────────────────────────────────────────────────
const FF = {
  fontFamily: "'Inter', sans-serif",
  fontFeatureSettings: "'ss01' 1, 'cv01' 1, 'cv11' 1",
} as const

const font = (
  size: number,
  weight = 400,
  color = '#1c1c1c',
  extra: React.CSSProperties = {},
) => ({ ...FF, fontSize: `${size}px`, fontWeight: weight, color, ...extra } as React.CSSProperties)

const CARD_SHADOW = '0px 2px 6px 0px rgba(13,10,44,0.08)'

// ── Types ────────────────────────────────────────────────────────────────────
interface UserRef {
  _id: string
  firstName: string
  lastName: string
  email: string
}

interface Task {
  _id: string
  title: string
  description?: string
  status: string
  priority: string
  reference?: string
  primaryMethod?: string
  secondaryMethods?: string[]
  evidence?: string
  assignedTo?: string | UserRef
  createdBy?: string | UserRef
  dueDate?: string
  createdAt?: string
  updatedAt?: string
}

// ── Constants ────────────────────────────────────────────────────────────────
const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  PENDING:     { label: 'Pending',     color: '#59a8d4', bg: 'rgba(89,168,212,0.1)' },
  IN_PROGRESS: { label: 'In Progress', color: '#8a8cd9', bg: 'rgba(138,140,217,0.1)' },
  COMPLETED:   { label: 'Completed',   color: '#4aa785', bg: 'rgba(74,167,133,0.1)' },
  CANCELLED:   { label: 'Cancelled',   color: 'rgba(28,28,28,0.4)', bg: 'rgba(28,28,28,0.06)' },
  OVERDUE:     { label: 'Overdue',     color: '#ff4747', bg: 'rgba(255,71,71,0.1)' },
}

const STATUS_OPTIONS = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']

const SECONDARY_METHOD_OPTIONS = [
  'Assignment', 'FS Prep', 'Gateway', 'Observation',
  'Project', 'Questions', 'SLC Observation', 'Teaching and Learning',
]

const INFO_TABS = [
  { key: 'evidence',    label: 'Evidence' },
  { key: 'feedback',    label: 'Feedback & Comments' },
  { key: 'timesheet',   label: 'Timesheet' },
  { key: 'declaration', label: 'Declaration & Signatures' },
]

// ── Helpers ──────────────────────────────────────────────────────────────────
function formatDate(dt?: string) {
  if (!dt) return '—'
  const d = new Date(dt)
  if (isNaN(d.getTime())) return dt
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function getUserName(u?: string | UserRef) {
  if (!u) return '—'
  if (typeof u === 'string') return u
  return `${u.firstName} ${u.lastName}`.trim() || u.email
}

// ── SVG Icons ────────────────────────────────────────────────────────────────
function ArrowCircleRightIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9" stroke="#1c1c1c" strokeWidth="1.5"/>
      <path d="M10.5 8.5L14 12l-3.5 3.5" stroke="#1c1c1c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function ArrowRightIcon({ color = '#fff' }: { color?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M3 8h10M9 4l4 4-4 4" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function ArrowLineRightIcon({ color = 'rgba(28,28,28,0.4)' }: { color?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M6 3.5L10.5 8 6 12.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="2.5" y="4" width="15" height="13" rx="2" stroke="#1c1c1c" strokeWidth="1.25"/>
      <path d="M6.5 2.5v3M13.5 2.5v3M2.5 8h15" stroke="#1c1c1c" strokeWidth="1.25" strokeLinecap="round"/>
    </svg>
  )
}

function PaperclipIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M13.5 7.5l-6 6a4.5 4.5 0 01-6.364-6.364l6-6a3 3 0 014.243 4.243l-6.007 6.007a1.5 1.5 0 01-2.122-2.122l5.657-5.656" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function CheckboxIcon({ checked }: { checked: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="1" y="1" width="14" height="14" rx="3" stroke="rgba(28,28,28,0.3)" strokeWidth="1.2" fill={checked ? '#1c1c1c' : 'transparent'}/>
      {checked && <path d="M4.5 8l2.5 2.5 4.5-4.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>}
    </svg>
  )
}

function ArrowUpDownIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 3v10M4.5 6.5L8 3l3.5 3.5M4.5 9.5L8 13l3.5-3.5" stroke="rgba(28,28,28,0.35)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function PDFIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M9.5 1.5H4a1 1 0 00-1 1v11a1 1 0 001 1h8a1 1 0 001-1V5.5L9.5 1.5z" stroke="#5689f5" strokeWidth="1.2" strokeLinejoin="round"/>
      <path d="M9.5 1.5V5.5H13.5" stroke="#5689f5" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M5 9h6M5 11h4" stroke="#5689f5" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  )
}

// ── Status Update Modal ────────────────────────────────────────────────────────
function StatusModal({
  currentStatus,
  onClose,
  onConfirm,
  saving,
}: {
  currentStatus: string
  onClose: () => void
  onConfirm: (s: string) => void
  saving: boolean
}) {
  const [selected, setSelected] = useState(currentStatus)

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        backgroundColor: 'rgba(0,0,0,0.35)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{
        backgroundColor: '#fff', borderRadius: '12px',
        width: '420px', overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
      }}>
        <div style={{
          backgroundColor: 'rgba(28,28,28,0.05)', height: '45px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 16px',
        }}>
          <span style={font(18, 700, '#000', { letterSpacing: '-0.36px' })}>Update Task Status</span>
          <button onClick={onClose} style={{
            width: '28px', height: '28px', borderRadius: '50%',
            border: 'none', backgroundColor: 'rgba(0,0,0,0.08)',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M1 1l8 8M9 1L1 9" stroke="#1c1c1c" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
        <div style={{ padding: '20px 16px' }}>
          <p style={font(13, 400, 'rgba(28,28,28,0.6)', { marginBottom: '14px' })}>
            Select the new status for this task:
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {STATUS_OPTIONS.map(s => {
              const info = STATUS_MAP[s] ?? { label: s, color: '#9291a5', bg: '#f3f2fa' }
              const isChosen = selected === s
              return (
                <button
                  key={s}
                  onClick={() => setSelected(s)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '10px 14px', borderRadius: '8px',
                    border: isChosen ? '2px solid #1c1c1c' : '1.5px solid rgba(28,28,28,0.12)',
                    backgroundColor: isChosen ? '#f8f8f8' : '#fff',
                    cursor: 'pointer', textAlign: 'left',
                  }}
                >
                  <span style={{
                    width: '10px', height: '10px', borderRadius: '50%',
                    backgroundColor: info.color, flexShrink: 0,
                  }} />
                  <span style={font(14, isChosen ? 600 : 400)}>{info.label}</span>
                  {isChosen && (
                    <span style={{ marginLeft: 'auto' }}>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <circle cx="8" cy="8" r="8" fill="#1c1c1c"/>
                        <path d="M4.5 8l2.5 2.5 4.5-5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
        <div style={{
          display: 'flex', gap: '8px', justifyContent: 'flex-end',
          padding: '12px 16px', borderTop: '1px solid rgba(28,28,28,0.08)',
        }}>
          <button onClick={onClose} disabled={saving} style={{
            ...font(13, 500),
            background: 'none', border: '1.5px solid rgba(28,28,28,0.2)',
            borderRadius: '8px', padding: '0 16px', height: '32px', cursor: 'pointer',
          }}>Cancel</button>
          <button
            onClick={() => onConfirm(selected)}
            disabled={saving || selected === currentStatus}
            style={{
              ...font(13, 500, '#fff'),
              backgroundColor: saving || selected === currentStatus ? '#888' : '#1c1c1c',
              border: 'none', borderRadius: '8px', padding: '0 16px', height: '32px',
              cursor: saving || selected === currentStatus ? 'default' : 'pointer',
            }}
          >
            {saving ? 'Saving…' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Form Field (grey bg) ──────────────────────────────────────────────────────
function FormField({
  label,
  children,
  style,
  showSortIcon,
  showCalendar,
}: {
  label: string
  children: React.ReactNode
  style?: React.CSSProperties
  showSortIcon?: boolean
  showCalendar?: boolean
}) {
  return (
    <div style={{
      position: 'relative',
      backgroundColor: 'rgba(28,28,28,0.05)',
      border: '1px solid rgba(28,28,28,0.1)',
      borderRadius: '8px',
      padding: '16px 20px',
      display: 'flex', flexDirection: 'column', gap: '4px',
      ...style,
    }}>
      <span style={font(12, 400, '#1c1c1c')}>{label}</span>
      {showCalendar ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <CalendarIcon />
          <span style={font(14, 400, '#1c1c1c')}>{children}</span>
        </div>
      ) : (
        <span style={font(14, 400, '#1c1c1c', { minWidth: '100%', wordBreak: 'break-word' })}>{children}</span>
      )}
      {showSortIcon && (
        <div style={{ position: 'absolute', right: '15px', top: '39px' }}>
          <ArrowUpDownIcon />
        </div>
      )}
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function TaskDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string
  const { data: session } = useSession()
  const token = (session?.user as any)?.accessToken as string | undefined

  const [task, setTask] = useState<Task | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Status modal
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [savingStatus, setSavingStatus] = useState(false)

  // Evidence editor
  const [evidenceText, setEvidenceText] = useState('')
  const [savingEvidence, setSavingEvidence] = useState(false)
  const [evidenceMsg, setEvidenceMsg] = useState('')

  // Information & Options tab
  const [activeTab, setActiveTab] = useState('evidence')

  // Toast
  const [toast, setToast] = useState('')

  const isAdmin = ['TRAINER', 'ORG_ADMIN', 'SUPER_ADMIN'].includes((session?.user as any)?.role)

  const loadTask = useCallback(async () => {
    if (!token || !id) return
    setLoading(true)
    setError('')
    try {
      const res = await apiFetch<any>(`/tasks/${id}`, token)
      const t = res?.data ?? res
      setTask(t)
      setEvidenceText(t?.evidence ?? '')
    } catch (err: any) {
      setError(err?.message ?? 'Failed to load task')
    } finally {
      setLoading(false)
    }
  }, [token, id])

  useEffect(() => {
    if (token && id) loadTask()
  }, [loadTask])

  const handleStatusSave = async (newStatus: string) => {
    if (!token || !task) return
    setSavingStatus(true)
    try {
      await apiFetch(`/tasks/${task._id}/status`, token, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      })
      setTask(prev => prev ? { ...prev, status: newStatus } : prev)
      setShowStatusModal(false)
      setToast('Status updated successfully.')
      setTimeout(() => setToast(''), 3000)
    } catch (err: any) {
      setToast(err?.message ?? 'Failed to update status')
    } finally {
      setSavingStatus(false)
    }
  }

  const handleSaveEvidence = async (quit = false) => {
    if (!token || !task) return
    setSavingEvidence(true)
    setEvidenceMsg('')
    try {
      await apiFetch(`/tasks/${task._id}`, token, {
        method: 'PATCH',
        body: JSON.stringify({ evidence: evidenceText }),
      })
      setTask(prev => prev ? { ...prev, evidence: evidenceText } : prev)
      setEvidenceMsg('Evidence saved.')
      setTimeout(() => setEvidenceMsg(''), 3000)
      if (quit) router.push('/tasks')
    } catch (err: any) {
      setEvidenceMsg(err?.message ?? 'Failed to save evidence')
    } finally {
      setSavingEvidence(false)
    }
  }

  const st = task ? (STATUS_MAP[task.status] ?? { label: task.status, color: '#9291a5', bg: '#f3f2fa' }) : null
  const secondaryMethods = task?.secondaryMethods ?? []

  // ── Loading / error ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ padding: '80px', textAlign: 'center', ...font(14, 400, 'rgba(28,28,28,0.4)') }}>
        Loading task…
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ padding: '60px', textAlign: 'center' }}>
        <div style={font(14, 400, '#dc2626', { marginBottom: '14px' })}>{error}</div>
        <button
          onClick={loadTask}
          style={{ ...font(13, 500, '#fff'), backgroundColor: '#1c1c1c', border: 'none', borderRadius: '8px', padding: '6px 16px', cursor: 'pointer' }}
        >
          Retry
        </button>
      </div>
    )
  }

  if (!task) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', ...font(14, 400, 'rgba(28,28,28,0.4)') }}>
        Task not found.
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '27px' }}>

      {/* ── Toast ─────────────────────────────────────────────────────────── */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: '24px', right: '24px', zIndex: 999,
          backgroundColor: toast.toLowerCase().includes('fail') || toast.toLowerCase().includes('error') ? '#fff1f1' : '#f0faf5',
          border: `1px solid ${toast.toLowerCase().includes('fail') || toast.toLowerCase().includes('error') ? '#ff4747' : '#4aa785'}`,
          borderRadius: '8px', padding: '10px 16px',
          ...font(13, 400, toast.toLowerCase().includes('fail') ? '#dc2626' : '#166534'),
          boxShadow: CARD_SHADOW,
        }}>
          {toast}
        </div>
      )}

      {/* ── Back row + Activity title ──────────────────────────────────────── */}
      <button
        onClick={() => router.push('/tasks')}
        style={{
          display: 'flex', alignItems: 'center', gap: '15px',
          background: 'none', border: 'none', cursor: 'pointer', padding: 0,
          alignSelf: 'flex-start',
        }}
      >
        <ArrowCircleRightIcon />
        <span style={font(24, 700, '#000', { letterSpacing: '-0.48px', lineHeight: '1.2' })}>
          {task.title}
        </span>
      </button>

      {/* ── Task Overview card ─────────────────────────────────────────────── */}
      <div style={{
        backgroundColor: '#fff', borderRadius: '12px',
        boxShadow: CARD_SHADOW, overflow: 'hidden',
      }}>
        {/* Card header */}
        <div style={{
          backgroundColor: 'rgba(28,28,28,0.05)',
          height: '45px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 16px',
          borderRadius: '12px 12px 0 0',
        }}>
          {/* Left: title + alert badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, minWidth: 0 }}>
            <span style={font(18, 700, '#000', { letterSpacing: '-0.36px', whiteSpace: 'nowrap' })}>
              Task Overview
            </span>
            {/* Status badge */}
            {st && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '5px',
                backgroundColor: st.bg, borderRadius: '4px',
                padding: '1px 8px', height: '20px', flexShrink: 0,
              }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: st.color, flexShrink: 0 }} />
                <span style={font(12, 600, st.color)}>{st.label}</span>
              </span>
            )}
            {/* Red info badge for learners */}
            {!isAdmin && (
              <span style={{
                display: 'inline-flex', alignItems: 'center',
                backgroundColor: 'rgba(255,71,71,0.1)', borderRadius: '4px',
                padding: '1px 4px', height: '20px', maxWidth: '520px',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                flexShrink: 1,
              }}>
                <span style={font(12, 600, '#ff4747')}>
                  This learning activity is assigned by your trainer so you can only send feedback and comments
                </span>
              </span>
            )}
          </div>
          {/* Right: action button */}
          {isAdmin && (
            <button
              onClick={() => setShowStatusModal(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: '4px',
                backgroundColor: '#000', border: 'none', borderRadius: '8px',
                height: '28px', padding: '0 8px', cursor: 'pointer', flexShrink: 0,
              }}
            >
              <span style={font(14, 400, '#fff')}>Update Status</span>
              <ArrowRightIcon />
            </button>
          )}
          {!isAdmin && (
            <button
              style={{
                display: 'flex', alignItems: 'center', gap: '4px',
                backgroundColor: '#000', border: 'none', borderRadius: '8px',
                height: '28px', padding: '0 8px', cursor: 'pointer', flexShrink: 0,
              }}
            >
              <span style={font(14, 400, '#fff')}>View Plan Of Activity/action</span>
              <ArrowRightIcon />
            </button>
          )}
        </div>

        {/* Card body */}
        <div style={{ padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

          {/* Row 1: Details of Planned Assessment + Learning Resources */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            {/* Left: details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '262px', flexShrink: 0 }}>
              <span style={font(12, 400, '#000')}>Details of Planned Assessment</span>
              <span style={font(14, 400, 'rgba(28,28,28,0.6)', { lineHeight: '20px' })}>
                {task.description || '—'}
              </span>
            </div>

            {/* Right: learning resources */}
            <div style={{ flex: 1, paddingLeft: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span style={font(12, 400, '#000')}>Learning Resources:</span>
                <span style={font(14, 400, 'rgba(28,28,28,0.4)', { lineHeight: '20px' })}>
                  No attachments added.
                </span>
              </div>
            </div>
          </div>

          {/* Row 2: Form fields */}
          <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
            <FormField label="Title" style={{ flex: 1 }}>
              {task.title || '—'}
            </FormField>
            <FormField label="Primary Method:" style={{ width: '254px' }} showSortIcon>
              {task.primaryMethod || 'Assignment'}
            </FormField>
            <FormField label="Date" style={{ width: '254px' }} showCalendar showSortIcon>
              {formatDate(task.dueDate) || '—'}
            </FormField>
            <FormField label="Reference" style={{ width: '169px' }}>
              {task.reference || '—'}
            </FormField>
          </div>

          {/* Row 3: Secondary Methods */}
          <div style={{
            backgroundColor: '#fff',
            border: '1px solid rgba(28,28,28,0.1)',
            borderRadius: '8px',
            padding: '16px',
            display: 'flex', flexDirection: 'column', gap: '10px',
          }}>
            <span style={font(14, 600, '#1c1c1c')}>Secondary Methods</span>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
              {SECONDARY_METHOD_OPTIONS.map(method => (
                <div
                  key={method}
                  style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <CheckboxIcon checked={secondaryMethods.includes(method)} />
                  <span style={font(14, 400, '#1c1c1c', { whiteSpace: 'nowrap' })}>
                    {method}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Row 4: Assessment Criteria */}
          <div style={{
            backgroundColor: '#fff',
            border: '1px solid rgba(28,28,28,0.1)',
            borderRadius: '8px',
            padding: '16px',
            display: 'flex', flexDirection: 'column', gap: '10px',
          }}>
            <span style={font(14, 600, '#1c1c1c')}>Assessment Criteria</span>
            {task.reference ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={font(13, 400, '#5689f5', { lineHeight: '18px' })}>
                  Ref: {task.reference}
                </span>
                {task.description && (
                  <span style={font(13, 400, 'rgba(28,28,28,0.6)', { lineHeight: '18px' })}>
                    {task.description}
                  </span>
                )}
              </div>
            ) : (
              <span style={font(13, 400, 'rgba(28,28,28,0.4)', { lineHeight: '18px' })}>
                No assessment criteria specified for this task.
              </span>
            )}
          </div>

        </div>
      </div>

      {/* ── Bottom row: Information & Options + Evidence ───────────────────── */}
      <div style={{ display: 'flex', gap: '41px', alignItems: 'flex-start' }}>

        {/* Information & Options card */}
        <div style={{
          width: '345px', flexShrink: 0,
          backgroundColor: '#fff', borderRadius: '16px',
          boxShadow: CARD_SHADOW, overflow: 'hidden',
          minHeight: '290px',
        }}>
          {/* Card header */}
          <div style={{
            backgroundColor: 'rgba(28,28,28,0.05)',
            borderRadius: '16px 16px 0 0',
            height: '45px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={font(18, 700, '#000', { letterSpacing: '-0.36px' })}>
              Information &amp; Options
            </span>
          </div>

          {/* Nav items */}
          <div style={{ padding: '8px', display: 'flex', flexDirection: 'column', gap: '0' }}>
            {INFO_TABS.map(tab => {
              const isActive = activeTab === tab.key
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '16px 12px', borderRadius: '12px',
                    border: 'none', cursor: 'pointer', textAlign: 'left',
                    backgroundColor: isActive ? '#1c1c1c' : 'transparent',
                    width: '100%',
                  }}
                >
                  {/* Arrow icon */}
                  <div style={{ width: '24px', height: '24px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="9" stroke={isActive ? 'white' : 'rgba(28,28,28,0.6)'} strokeWidth="1.5"/>
                      <path d="M10.5 8.5L14 12l-3.5 3.5" stroke={isActive ? 'white' : 'rgba(28,28,28,0.6)'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <span style={font(14, 400, isActive ? '#fff' : '#1c1c1c')}>
                    {tab.label}
                  </span>
                  {!isActive && (
                    <div style={{ marginLeft: 'auto' }}>
                      <ArrowLineRightIcon />
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Evidence / active tab card */}
        <div style={{
          flex: 1,
          backgroundColor: '#fff', borderRadius: '12px',
          boxShadow: CARD_SHADOW, overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
        }}>
          {/* Card header */}
          <div style={{
            backgroundColor: 'rgba(28,28,28,0.05)',
            height: '45px', borderRadius: '12px 12px 0 0',
            display: 'flex', alignItems: 'center', padding: '0 16px',
          }}>
            <span style={font(18, 700, '#000', { letterSpacing: '-0.36px' })}>
              {INFO_TABS.find(t => t.key === activeTab)?.label ?? 'Evidence'}
            </span>
          </div>

          {/* Card body */}
          <div style={{ padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>

            {activeTab === 'evidence' ? (
              <>
                {/* Evidence textarea */}
                <div style={{
                  position: 'relative', flex: 1, minHeight: '220px',
                  backgroundColor: 'rgba(28,28,28,0.05)',
                  border: '1px solid rgba(28,28,28,0.1)',
                  borderRadius: '8px', padding: '16px 20px',
                  display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                }}>
                  <textarea
                    value={evidenceText}
                    onChange={e => setEvidenceText(e.target.value)}
                    placeholder="Write here"
                    style={{
                      ...font(14, 400, '#1c1c1c'),
                      flex: 1, border: 'none', outline: 'none', resize: 'none',
                      backgroundColor: 'transparent', lineHeight: '20px',
                      minHeight: '160px', width: '100%',
                    }}
                  />
                  {/* Rich text toolbar row */}
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    height: '40px', padding: '0 16px', marginTop: '8px',
                    borderTop: '1px solid rgba(28,28,28,0.08)',
                  }}>
                    {/* Font size mock */}
                    <span style={font(14, 400, '#334155', { ...{ fontFamily: "'Roboto', sans-serif" } })}>14</span>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M4 6l4 4 4-4" stroke="#334155" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {/* Divider */}
                    <div style={{ width: '1px', height: '24px', backgroundColor: 'rgba(28,28,28,0.12)', margin: '0 2px' }} />
                    {/* Bold */}
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', borderRadius: '2px', display: 'flex' }}>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M5 3h4a2.5 2.5 0 010 5H5V3zM5 8h4.5a2.5 2.5 0 010 5H5V8z" stroke="#334155" strokeWidth="1.2" strokeLinejoin="round"/>
                      </svg>
                    </button>
                    {/* Italic */}
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', borderRadius: '2px', display: 'flex' }}>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M10 3H7M9 13H6M8 3L6 13" stroke="#334155" strokeWidth="1.2" strokeLinecap="round"/>
                      </svg>
                    </button>
                    {/* Underline */}
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', borderRadius: '2px', display: 'flex' }}>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M5 3v5a3 3 0 006 0V3M3 13h10" stroke="#334155" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                    <div style={{ width: '1px', height: '24px', backgroundColor: 'rgba(28,28,28,0.12)', margin: '0 2px' }} />
                    {/* List */}
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', borderRadius: '2px', display: 'flex' }}>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M6 4h7M6 8h7M6 12h7M3 4h.01M3 8h.01M3 12h.01" stroke="#334155" strokeWidth="1.2" strokeLinecap="round"/>
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Evidence message */}
                {evidenceMsg && (
                  <div style={{
                    padding: '8px 12px', borderRadius: '6px',
                    backgroundColor: evidenceMsg.includes('Failed') ? '#fff1f1' : '#f0faf5',
                    border: `1px solid ${evidenceMsg.includes('Failed') ? '#ff4747' : '#4aa785'}`,
                    ...font(13, 400, evidenceMsg.includes('Failed') ? '#dc2626' : '#166534'),
                  }}>
                    {evidenceMsg}
                  </div>
                )}

                {/* Action row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  {/* Add Attachments */}
                  <button style={{
                    display: 'flex', alignItems: 'center', gap: '4px',
                    backgroundColor: '#000', border: 'none', borderRadius: '8px',
                    height: '28px', padding: '0 8px', cursor: 'pointer',
                  }}>
                    <span style={font(14, 400, '#fff')}>Add Attachments</span>
                    <PaperclipIcon />
                  </button>

                  {/* Save buttons */}
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <button
                      onClick={() => handleSaveEvidence(true)}
                      disabled={savingEvidence}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        backgroundColor: savingEvidence ? '#555' : '#000',
                        border: 'none', borderRadius: '8px',
                        height: '28px', padding: '0 8px', cursor: savingEvidence ? 'default' : 'pointer',
                      }}
                    >
                      <span style={font(14, 400, '#fff')}>Save &amp; Quit</span>
                    </button>
                    <button
                      onClick={() => handleSaveEvidence(false)}
                      disabled={savingEvidence}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        backgroundColor: savingEvidence ? '#555' : '#000',
                        border: 'none', borderRadius: '8px',
                        height: '28px', padding: '0 8px', cursor: savingEvidence ? 'default' : 'pointer',
                      }}
                    >
                      <span style={font(14, 400, '#fff')}>{savingEvidence ? 'Saving…' : 'Save'}</span>
                    </button>
                    <button
                      onClick={() => {
                        setEvidenceText(task.evidence ?? '')
                        setEvidenceMsg('')
                      }}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        backgroundColor: 'transparent',
                        border: '1px solid rgba(28,28,28,0.1)',
                        borderRadius: '8px',
                        height: '28px', padding: '0 8px', cursor: 'pointer',
                      }}
                    >
                      <span style={font(14, 400, '#1c1c1c')}>Cancel</span>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              /* Other tabs: coming soon */
              <div style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                padding: '60px 20px', gap: '8px',
              }}>
                <span style={font(16, 600, 'rgba(28,28,28,0.3)')}>
                  {INFO_TABS.find(t => t.key === activeTab)?.label}
                </span>
                <span style={font(14, 400, 'rgba(28,28,28,0.35)', { textAlign: 'center' })}>
                  This section is coming soon.
                </span>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Status modal */}
      {showStatusModal && (
        <StatusModal
          currentStatus={task.status}
          onClose={() => setShowStatusModal(false)}
          onConfirm={handleStatusSave}
          saving={savingStatus}
        />
      )}

    </div>
  )
}
