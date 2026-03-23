'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { apiFetch } from '@/lib/api-client'

const FF = { fontFamily: "'Inter', sans-serif", fontFeatureSettings: "'ss01' 1, 'cv01' 1, 'cv11' 1" } as const
const font = (size: number, weight = 400, color = '#1c1c1c', extra: React.CSSProperties = {}) =>
  ({ ...FF, fontSize: `${size}px`, fontWeight: weight, color, ...extra } as React.CSSProperties)

// ── Exact Figma status colors ──────────────────────────────────────────────
const STATUS_MAP: Record<string, { label: string; color: string }> = {
  // Backend enums
  PENDING:     { label: 'Pending',     color: '#59a8d4' },
  IN_PROGRESS: { label: 'In Progress', color: '#8a8cd9' },
  COMPLETED:   { label: 'Complete',    color: '#4aa785' },
  CANCELLED:   { label: 'Cancelled',   color: 'rgba(28,28,28,0.4)' },
  OVERDUE:     { label: 'Overdue',     color: '#f87171' },
  // Figma display values (legacy)
  Pending:     { label: 'Pending',     color: '#59a8d4' },
  'In Progress': { label: 'In Progress', color: '#8a8cd9' },
  Complete:    { label: 'Complete',    color: '#4aa785' },
  Approved:    { label: 'Approved',    color: '#ffc555' },
  Rejected:    { label: 'Rejected',    color: 'rgba(28,28,28,0.4)' },
}

const PERIOD_OPTIONS = ['Show All', 'Today', 'This Week', 'This Month', 'Last Month']
const STATUS_FILTER_OPTIONS = ['All Statuses', 'Pending task', 'In Progress', 'Complete', 'Overdue', 'Cancelled']

// map dropdown label → backend status values to filter on
const STATUS_FILTER_MAP: Record<string, string[]> = {
  'All Statuses': [],
  'Pending task': ['PENDING', 'Pending'],
  'In Progress':  ['IN_PROGRESS', 'In Progress'],
  'Complete':     ['COMPLETED', 'Complete'],
  'Overdue':      ['OVERDUE'],
  'Cancelled':    ['CANCELLED'],
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
  assignedTo?: string
  createdBy?: string
  dueDate?: string
  createdAt?: string
  updatedAt?: string
}

// ── Arrow icon for dropdown buttons ────────────────────────────────────────
function ArrowDown() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
      <path d="M4 6l4 4 4-4" stroke="#1c1c1c" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

// ── Custom Dropdown Button (matches Figma Function Bar style) ──────────────
function DropdownButton({
  value,
  options,
  onChange,
}: {
  value: string
  options: string[]
  onChange: (v: string) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          ...font(14, 400),
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          padding: '4px 8px',
          height: '28px',
          border: '1px solid rgba(28,28,28,0.1)',
          borderRadius: '8px',
          backgroundColor: '#fff',
          cursor: 'pointer',
          outline: 'none',
          whiteSpace: 'nowrap',
        }}
      >
        {value}
        <ArrowDown />
      </button>
      {open && (
        <div style={{
          position: 'absolute',
          top: '32px',
          left: 0,
          zIndex: 100,
          backgroundColor: '#fff',
          border: '1px solid rgba(28,28,28,0.1)',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          minWidth: '140px',
          overflow: 'hidden',
        }}>
          {options.map(o => (
            <button
              key={o}
              onClick={() => { onChange(o); setOpen(false) }}
              style={{
                ...font(14, value === o ? 500 : 400, value === o ? '#1c1c1c' : 'rgba(28,28,28,0.7)'),
                display: 'block',
                width: '100%',
                padding: '8px 12px',
                background: value === o ? 'rgba(28,28,28,0.04)' : 'transparent',
                border: 'none',
                textAlign: 'left',
                cursor: 'pointer',
              }}
            >
              {o}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Status dot + label (exact Figma structure: 16×16 wrapper + inner circle) ─
function StatusLabel({ status }: { status: string }) {
  const st = STATUS_MAP[status] ?? { label: status, color: 'rgba(28,28,28,0.4)' }
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {/* 16×16 wrapper with 31.25% inset = 5px each side = 6×6 circle */}
      <div style={{ width: '16px', height: '16px', position: 'relative', flexShrink: 0 }}>
        <div style={{
          position: 'absolute',
          inset: '31.25%',
          borderRadius: '50%',
          backgroundColor: st.color,
        }} />
      </div>
      <span style={font(14, 400, st.color, { whiteSpace: 'nowrap' })}>{st.label}</span>
    </div>
  )
}

function formatDate(dt?: string) {
  if (!dt) return ''
  const d = new Date(dt)
  if (isNaN(d.getTime())) return dt
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) +
    ' ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

// ── Table header cell ─────────────────────────────────────────────────────
function TH({ children, width, align = 'left' }: { children: React.ReactNode; width?: number | string; align?: 'left' | 'center' }) {
  return (
    <th style={{
      ...font(14, 400, 'rgba(28,28,28,0.6)', { lineHeight: '18px' }),
      width: width ? (typeof width === 'number' ? `${width}px` : width) : undefined,
      padding: '11px 16px',
      textAlign: align,
      fontWeight: 400,
      borderLeft: '1px solid transparent',
      whiteSpace: 'nowrap',
    }}>
      {children}
    </th>
  )
}

// ── Table data cell ───────────────────────────────────────────────────────
function TD({ children, align = 'left', style: extraStyle }: { children: React.ReactNode; align?: 'left' | 'center'; style?: React.CSSProperties }) {
  return (
    <td style={{
      padding: '8px 16px',
      verticalAlign: 'middle',
      textAlign: align,
      ...extraStyle,
    }}>
      {children}
    </td>
  )
}

export default function TasksPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const token = (session?.user as any)?.accessToken as string | undefined

  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [period, setPeriod] = useState('Show All')
  const [statusFilter, setStatusFilter] = useState('All Statuses')

  const isAdmin = ['TRAINER', 'ORG_ADMIN', 'SUPER_ADMIN'].includes((session?.user as any)?.role)

  const loadTasks = async () => {
    if (!token) return
    setLoading(true)
    setError('')
    try {
      const res = await apiFetch<any>('/tasks?page=1&limit=200', token)
      const raw: Task[] = res?.data ?? res?.tasks ?? []
      setTasks(raw)
    } catch (err: any) {
      setError(err?.message ?? 'Failed to load tasks')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (token) loadTasks()
  }, [token])

  // Filter tasks by period + status
  const filtered = tasks.filter(t => {
    const statusAllowed = STATUS_FILTER_MAP[statusFilter]
    if (statusAllowed && statusAllowed.length > 0) {
      if (!statusAllowed.includes(t.status)) return false
    }
    if (period !== 'Show All' && t.createdAt) {
      const d = new Date(t.createdAt)
      const now = new Date()
      if (period === 'Today') {
        if (d.toDateString() !== now.toDateString()) return false
      } else if (period === 'This Week') {
        const cutoff = new Date(now); cutoff.setDate(now.getDate() - 7)
        if (d < cutoff) return false
      } else if (period === 'This Month') {
        if (d.getMonth() !== now.getMonth() || d.getFullYear() !== now.getFullYear()) return false
      } else if (period === 'Last Month') {
        const lastMonth = new Date(now); lastMonth.setMonth(now.getMonth() - 1)
        if (d.getMonth() !== lastMonth.getMonth() || d.getFullYear() !== lastMonth.getFullYear()) return false
      }
    }
    return true
  })

  const pendingCount = tasks.filter(t =>
    ['PENDING', 'IN_PROGRESS', 'Pending', 'In Progress'].includes(t.status)
  ).length

  return (
    <div>
      {/* Admin-only: Assign New Task button above card */}
      {isAdmin && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
          <button
            onClick={() => router.push('/tasks/assign')}
            style={{
              ...font(14, 500, '#fff'),
              backgroundColor: '#1c1c1c',
              border: 'none',
              borderRadius: '8px',
              padding: '0 16px',
              height: '34px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 2v10M2 7h10" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
            Assign New Task
          </button>
        </div>
      )}

      {/* ── Main card (matches Figma: 12px radius, white, shadow) ── */}
      <div style={{
        backgroundColor: '#fff',
        borderRadius: '12px',
        boxShadow: '0px 2px 6px 0px rgba(13,10,44,0.08)',
        overflow: 'hidden',
      }}>

        {/* Card grey header — "Tasks" title */}
        <div style={{
          backgroundColor: 'rgba(28,28,28,0.05)',
          height: '45px',
          display: 'flex',
          alignItems: 'center',
          padding: '0 16px',
          borderRadius: '12px 12px 0 0',
        }}>
          <span style={font(18, 700, '#000', { letterSpacing: '-0.36px', lineHeight: 'normal' })}>
            Tasks
          </span>
        </div>

        {/* Card content */}
        <div style={{ padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

          {/* ── Function Bar ── */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderRadius: '8px',
          }}>
            {/* Left group: Period + Status dropdowns */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {/* Period label */}
              <span style={font(14, 400, '#1c1c1c', { lineHeight: '20px', padding: '4px 2px' })}>
                Period:
              </span>
              {/* Period dropdown button */}
              <DropdownButton
                value={period}
                options={PERIOD_OPTIONS}
                onChange={setPeriod}
              />
              {/* Status label */}
              <span style={font(14, 400, '#1c1c1c', { lineHeight: '20px', padding: '4px 2px', marginLeft: '4px' })}>
                Status:
              </span>
              {/* Status dropdown button */}
              <DropdownButton
                value={statusFilter}
                options={STATUS_FILTER_OPTIONS}
                onChange={setStatusFilter}
              />
              {/* Refresh */}
              <button
                onClick={loadTasks}
                title="Refresh tasks"
                style={{
                  ...font(12, 400, 'rgba(28,28,28,0.5)'),
                  background: 'none',
                  border: '1px solid rgba(28,28,28,0.1)',
                  borderRadius: '8px',
                  padding: '4px 8px',
                  height: '28px',
                  cursor: 'pointer',
                  marginLeft: '4px',
                }}
              >
                ↻
              </button>
            </div>

            {/* Right: pending tasks badge — Figma: #ffe999 bg, rgba(28,28,28,0.1) border, #1c1c1c 12px text */}
            {pendingCount > 0 && (
              <div style={{
                backgroundColor: '#ffe999',
                border: '1px solid rgba(28,28,28,0.1)',
                borderRadius: '8px',
                height: '28px',
                display: 'flex',
                alignItems: 'center',
                padding: '0 8px',
              }}>
                <span style={font(12, 400, '#1c1c1c', { lineHeight: '18px', whiteSpace: 'nowrap' })}>
                  There are {pendingCount} pending tasks!
                </span>
              </div>
            )}
          </div>

          {/* ── Table ── */}
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', ...font(14, 400, 'rgba(28,28,28,0.4)') }}>
              Loading tasks…
            </div>
          ) : error ? (
            <div style={{ padding: '32px', textAlign: 'center' }}>
              <div style={font(14, 400, '#dc2626', { marginBottom: '12px' })}>{error}</div>
              <button
                onClick={loadTasks}
                style={{ ...font(13, 500, '#fff'), backgroundColor: '#1c1c1c', border: 'none', borderRadius: '8px', padding: '6px 16px', cursor: 'pointer' }}
              >
                Retry
              </button>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
              <colgroup>
                <col style={{ width: '172px' }} />
                <col />  {/* Task: flex */}
                <col style={{ width: '152px' }} />
                <col style={{ width: '152px' }} />
                <col style={{ width: '152px' }} />
                <col style={{ width: '119px' }} />
              </colgroup>

              {/* Header row — 40px height, border-bottom rgba(28,28,28,0.1) */}
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(28,28,28,0.1)' }}>
                  <TH>Date Set</TH>
                  <TH align="center">Task (click to open)</TH>
                  <TH align="center">Date Due</TH>
                  <TH align="center">Date Completed</TH>
                  <TH align="center">Status</TH>
                  <TH>Action</TH>
                </tr>
              </thead>

              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '40px', textAlign: 'center', ...font(14, 400, 'rgba(28,28,28,0.4)') }}>
                      {tasks.length === 0 ? 'No tasks assigned yet.' : 'No tasks match the selected filters.'}
                    </td>
                  </tr>
                ) : (
                  filtered.map((t, idx) => {
                    const isComplete = ['COMPLETED', 'Complete'].includes(t.status)
                    return (
                      <tr
                        key={t._id}
                        style={{ borderBottom: '1px solid rgba(28,28,28,0.1)' }}
                      >
                        {/* Date Set */}
                        <TD>
                          <span style={font(14, 400, '#1c1c1c', { lineHeight: '18px' })}>
                            {formatDate(t.createdAt)}
                          </span>
                        </TD>

                        {/* Task title — center aligned, clickable */}
                        <TD align="center">
                          <span
                            onClick={() => router.push(`/tasks/${t._id}`)}
                            style={font(14, 400, '#1c1c1c', {
                              lineHeight: '18px',
                              cursor: 'pointer',
                              display: 'block',
                            })}
                          >
                            {t.title}
                          </span>
                        </TD>

                        {/* Date Due */}
                        <TD align="center">
                          <span style={font(14, 400, '#1c1c1c', { lineHeight: '18px' })}>
                            {t.dueDate ? formatDate(t.dueDate) : ''}
                          </span>
                        </TD>

                        {/* Date Completed */}
                        <TD align="center">
                          <span style={font(14, 400, '#1c1c1c', { lineHeight: '18px' })}>
                            {isComplete && t.updatedAt ? formatDate(t.updatedAt) : ''}
                          </span>
                        </TD>

                        {/* Status — dot + label, center column */}
                        <td style={{
                          padding: '8px 12px 8px 16px',
                          verticalAlign: 'middle',
                          height: '40px',
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <StatusLabel status={t.status} />
                          </div>
                        </td>

                        {/* Action — "More Details" button */}
                        <TD>
                          {/* Figma: bg black, border-radius 16px, padding 0 8px, height 24px, white 14px text */}
                          <button
                            onClick={() => router.push(`/tasks/${t._id}`)}
                            style={{
                              ...font(14, 400, '#fff', { lineHeight: '20px' }),
                              backgroundColor: '#000',
                              border: 'none',
                              borderRadius: '16px',
                              padding: '0 8px',
                              height: '24px',
                              cursor: 'pointer',
                              whiteSpace: 'nowrap',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            More Details
                          </button>
                        </TD>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
