'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { apiFetch } from '@/lib/api-client'

const FF = { fontFamily: "'Inter', sans-serif", fontFeatureSettings: "'ss01' 1, 'cv01' 1, 'cv11' 1" } as const
const font = (size: number, weight = 400, color = '#1c1c1c', extra: React.CSSProperties = {}) =>
  ({ ...FF, fontSize: `${size}px`, fontWeight: weight, color, ...extra } as React.CSSProperties)

const STATUS_MAP: Record<string, { label: string; dot: string; bg: string }> = {
  PENDING:     { label: 'Pending',     dot: '#9291a5', bg: '#f3f2fa' },
  IN_PROGRESS: { label: 'In Progress', dot: '#95b5ff', bg: '#eff4ff' },
  COMPLETED:   { label: 'Complete',    dot: '#7bc67e', bg: '#f0faf0' },
  CANCELLED:   { label: 'Cancelled',   dot: '#9ca3af', bg: '#f3f4f6' },
  OVERDUE:     { label: 'Overdue',     dot: '#f87171', bg: '#fff1f1' },
}

const PRIORITY_MAP: Record<string, { label: string; color: string; bg: string }> = {
  HIGH:   { label: 'High',   color: '#dc2626', bg: '#fff1f1' },
  MEDIUM: { label: 'Medium', color: '#d97706', bg: '#fffbeb' },
  LOW:    { label: 'Low',    color: '#16a34a', bg: '#f0fdf4' },
}

interface Task {
  _id: string
  title: string
  description?: string
  status: string
  priority: string
  assignedTo?: string | { _id: string; firstName: string; lastName: string; email: string }
  createdBy?: string | { _id: string; firstName: string; lastName: string; email: string }
  dueDate?: string
  createdAt?: string
  updatedAt?: string
}

const STATUS_OPTIONS = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']

function formatDate(dt?: string) {
  if (!dt) return '—'
  const d = new Date(dt)
  if (isNaN(d.getTime())) return dt
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) +
    ' · ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

function formatDateShort(dt?: string) {
  if (!dt) return '—'
  const d = new Date(dt)
  if (isNaN(d.getTime())) return dt
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

function getUserName(u?: string | { firstName: string; lastName: string; email: string }) {
  if (!u) return '—'
  if (typeof u === 'string') return u
  return `${u.firstName} ${u.lastName}`.trim() || u.email
}

function getUserEmail(u?: string | { email: string }) {
  if (!u || typeof u === 'string') return ''
  return u.email
}

// ── Status Update Confirmation Modal ────────────────────────────────────────
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
        backgroundColor: '#fff',
        borderRadius: '12px',
        width: '420px',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
      }}>
        {/* Header */}
        <div style={{
          backgroundColor: '#f4f4f4',
          height: '45px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
        }}>
          <span style={font(16, 700, '#000', { letterSpacing: '-0.32px' })}>Update Task Status</span>
          <button
            onClick={onClose}
            style={{
              width: '32px', height: '32px', borderRadius: '50%',
              border: 'none', backgroundColor: 'rgba(0,0,0,0.08)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M1 1l10 10M11 1L1 11" stroke="#1c1c1c" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Options */}
        <div style={{ padding: '20px 16px' }}>
          <p style={font(13, 400, 'rgba(28,28,28,0.6)', { marginBottom: '14px' })}>
            Select the new status for this task:
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {STATUS_OPTIONS.map(s => {
              const info = STATUS_MAP[s] ?? { label: s, dot: '#9291a5', bg: '#f3f2fa' }
              const isChosen = selected === s
              return (
                <button
                  key={s}
                  onClick={() => setSelected(s)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: isChosen ? '2px solid #1c1c1c' : '1.5px solid rgba(28,28,28,0.12)',
                    backgroundColor: isChosen ? '#f8f8f8' : '#fff',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <span style={{
                    width: '10px', height: '10px', borderRadius: '50%',
                    backgroundColor: info.dot, flexShrink: 0,
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

        {/* Footer */}
        <div style={{
          display: 'flex', gap: '8px', justifyContent: 'flex-end',
          padding: '12px 16px', borderTop: '1px solid rgba(28,28,28,0.08)',
        }}>
          <button
            onClick={onClose}
            disabled={saving}
            style={{
              ...font(13, 500),
              background: 'none', border: '1.5px solid rgba(28,28,28,0.2)',
              borderRadius: '16px', padding: '0 16px', height: '32px',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(selected)}
            disabled={saving || selected === currentStatus}
            style={{
              ...font(13, 500, '#fff'),
              backgroundColor: saving || selected === currentStatus ? '#888' : '#1c1c1c',
              border: 'none',
              borderRadius: '16px', padding: '0 16px', height: '32px',
              cursor: saving || selected === currentStatus ? 'default' : 'pointer',
            }}
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Info Row ─────────────────────────────────────────────────────────────────
function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <span style={font(12, 400, 'rgba(28,28,28,0.5)', { textTransform: 'uppercase', letterSpacing: '0.5px' })}>
        {label}
      </span>
      <span style={font(14, 400)}>{value}</span>
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
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [savingStatus, setSavingStatus] = useState(false)
  const [statusMsg, setStatusMsg] = useState('')

  const isAdmin = ['TRAINER', 'ORG_ADMIN', 'SUPER_ADMIN'].includes((session?.user as any)?.role)

  const loadTask = async () => {
    if (!token || !id) return
    setLoading(true)
    setError('')
    try {
      const res = await apiFetch<any>(`/tasks/${id}`, token)
      setTask(res?.data ?? res)
    } catch (err: any) {
      setError(err?.message ?? 'Failed to load task')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (token && id) loadTask()
  }, [token, id])

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
      setStatusMsg('Status updated successfully.')
      setTimeout(() => setStatusMsg(''), 3000)
    } catch (err: any) {
      setStatusMsg(err?.message ?? 'Failed to update status')
    } finally {
      setSavingStatus(false)
    }
  }

  const st = task ? (STATUS_MAP[task.status] ?? { label: task.status, dot: '#9291a5', bg: '#f3f2fa' }) : null
  const pr = task ? (PRIORITY_MAP[task.priority] ?? { label: task.priority, color: '#1c1c1c', bg: '#f3f4f6' }) : null

  return (
    <div>
      {/* Back + Title row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <button
          onClick={() => router.push('/tasks')}
          style={{
            ...font(13, 400, 'rgba(28,28,28,0.6)'),
            background: 'none', border: '1px solid rgba(28,28,28,0.15)',
            borderRadius: '8px', padding: '5px 12px', height: '30px',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back to Tasks
        </button>
        <h1 style={{ ...font(22, 700, '#1c1c1c', { letterSpacing: '-0.44px', lineHeight: '28px' }), margin: 0 }}>
          Task Details
        </h1>
      </div>

      {loading ? (
        <div style={{ padding: '80px', textAlign: 'center', ...font(14, 400, 'rgba(28,28,28,0.4)') }}>
          Loading task…
        </div>
      ) : error ? (
        <div style={{ padding: '60px', textAlign: 'center' }}>
          <div style={font(14, 400, '#dc2626', { marginBottom: '14px' })}>{error}</div>
          <button
            onClick={loadTask}
            style={{ ...font(13, 500, '#fff'), backgroundColor: '#1c1c1c', border: 'none', borderRadius: '8px', padding: '6px 16px', cursor: 'pointer' }}
          >
            Retry
          </button>
        </div>
      ) : task ? (
        <>
          {/* Status toast */}
          {statusMsg && (
            <div style={{
              marginBottom: '14px',
              padding: '10px 16px',
              backgroundColor: statusMsg.includes('success') ? '#f0faf0' : '#fff1f1',
              border: `1px solid ${statusMsg.includes('success') ? '#7bc67e' : '#f87171'}`,
              borderRadius: '8px',
              ...font(13, 400, statusMsg.includes('success') ? '#166534' : '#dc2626'),
            }}>
              {statusMsg}
            </div>
          )}

          {/* Main card */}
          <div style={{ backgroundColor: '#fff', borderRadius: '16px', boxShadow: '0 2px 6px rgba(13,10,44,0.08)', overflow: 'hidden' }}>
            {/* Card header */}
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid rgba(28,28,28,0.08)',
              display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px',
            }}>
              <div style={{ flex: 1 }}>
                <h2 style={{ ...font(18, 600, '#1c1c1c', { letterSpacing: '-0.36px', lineHeight: '24px' }), margin: '0 0 10px 0' }}>
                  {task.title}
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  {/* Status pill */}
                  {st && (
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '5px',
                      padding: '4px 10px', borderRadius: '20px',
                      backgroundColor: st.bg,
                      ...font(12, 500, st.dot),
                    }}>
                      <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: st.dot }} />
                      {st.label}
                    </span>
                  )}
                  {/* Priority pill */}
                  {pr && (
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '5px',
                      padding: '4px 10px', borderRadius: '20px',
                      backgroundColor: pr.bg,
                      ...font(12, 500, pr.color),
                    }}>
                      {pr.label} Priority
                    </span>
                  )}
                </div>
              </div>

              {/* Update Status button */}
              {isAdmin && (
                <button
                  onClick={() => setShowStatusModal(true)}
                  style={{
                    ...font(13, 500, '#fff'),
                    backgroundColor: '#1c1c1c',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '6px 16px',
                    height: '34px',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                  }}
                >
                  Update Status
                </button>
              )}
            </div>

            {/* Task description */}
            {task.description && (
              <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(28,28,28,0.08)' }}>
                <p style={font(12, 500, 'rgba(28,28,28,0.5)', { textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' })}>
                  Description
                </p>
                <p style={font(14, 400, '#1c1c1c', { lineHeight: '22px', margin: 0 })}>
                  {task.description}
                </p>
              </div>
            )}

            {/* Details grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '24px',
              padding: '24px',
            }}>
              <InfoRow label="Date Set" value={formatDate(task.createdAt)} />
              <InfoRow label="Due Date" value={
                task.dueDate ? (
                  <span style={{ color: new Date(task.dueDate) < new Date() && task.status !== 'COMPLETED' ? '#dc2626' : '#1c1c1c' }}>
                    {formatDateShort(task.dueDate)}
                  </span>
                ) : '—'
              } />
              <InfoRow label="Date Completed" value={
                task.status === 'COMPLETED' ? formatDateShort(task.updatedAt) : '—'
              } />
              <InfoRow label="Assigned To" value={
                <span>
                  <span style={{ fontWeight: 500 }}>{getUserName(task.assignedTo as any)}</span>
                  {getUserEmail(task.assignedTo as any) && (
                    <span style={{ display: 'block', ...font(12, 400, 'rgba(28,28,28,0.5)') }}>
                      {getUserEmail(task.assignedTo as any)}
                    </span>
                  )}
                </span>
              } />
              <InfoRow label="Assigned By" value={
                <span>
                  <span style={{ fontWeight: 500 }}>{getUserName(task.createdBy as any)}</span>
                  {getUserEmail(task.createdBy as any) && (
                    <span style={{ display: 'block', ...font(12, 400, 'rgba(28,28,28,0.5)') }}>
                      {getUserEmail(task.createdBy as any)}
                    </span>
                  )}
                </span>
              } />
              <InfoRow label="Last Updated" value={formatDate(task.updatedAt)} />
            </div>
          </div>

          {/* Bottom action bar */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '20px', justifyContent: 'flex-end' }}>
            <button
              onClick={() => router.push('/tasks')}
              style={{
                ...font(13, 500),
                background: 'none', border: '1.5px solid rgba(28,28,28,0.2)',
                borderRadius: '8px', padding: '6px 20px', height: '36px',
                cursor: 'pointer',
              }}
            >
              ← Back to Tasks
            </button>
            {isAdmin && (
              <button
                onClick={() => setShowStatusModal(true)}
                style={{
                  ...font(13, 500, '#fff'),
                  backgroundColor: '#1c1c1c',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '6px 20px',
                  height: '36px',
                  cursor: 'pointer',
                }}
              >
                Update Status
              </button>
            )}
          </div>
        </>
      ) : (
        <div style={{ padding: '60px', textAlign: 'center', ...font(14, 400, 'rgba(28,28,28,0.4)') }}>
          Task not found.
        </div>
      )}

      {/* Status update modal */}
      {showStatusModal && task && (
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
