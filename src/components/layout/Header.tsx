'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { BREADCRUMB_MAP } from '@/constants/nav'
import { apiFetch } from '@/lib/api-client'

const FF = "'Inter', sans-serif"
const font = (size: number, weight = 400, color = '#1c1c1c') => ({
  fontFamily: FF, fontSize: `${size}px`, fontWeight: weight, color,
  fontFeatureSettings: "'ss01' 1, 'cv01' 1, 'cv11' 1",
})

// ── Small icon components ─────────────────────────────────────────────────────
function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="7" cy="7" r="4.5" stroke="rgba(28,28,28,0.4)" strokeWidth="1.3"/>
      <path d="M11 11l2.5 2.5" stroke="rgba(28,28,28,0.4)" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  )
}
function CaretDownIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M5 7.5l5 5 5-5" stroke="#1c1c1c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}
function ClipboardIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M13 3h2a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h2" stroke="#1c1c1c" strokeWidth="1.4" strokeLinecap="round"/>
      <rect x="7" y="2" width="6" height="3" rx="1" stroke="#1c1c1c" strokeWidth="1.4"/>
      <path d="M7 10h6M7 13h4" stroke="#1c1c1c" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  )
}
function BellIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M10 2.5a5.5 5.5 0 0 0-5.5 5.5v3L3 13h14l-1.5-2V8A5.5 5.5 0 0 0 10 2.5z" stroke="#1c1c1c" strokeWidth="1.4" strokeLinejoin="round"/>
      <path d="M8.5 17a1.5 1.5 0 0 0 3 0" stroke="#1c1c1c" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  )
}

// ── Figma-accurate checkbox (32×32 → rendered small) ─────────────────────────
function FigmaCheckbox({ checked, onClick }: { checked: boolean; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      style={{
        width: '20px', height: '20px', borderRadius: '4px', flexShrink: 0,
        border: checked ? 'none' : '1.5px solid rgba(28,28,28,0.35)',
        backgroundColor: checked ? '#1c1c1c' : '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', transition: 'all 0.1s',
      }}
    >
      {checked && (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M1.5 6l3 3 6-6" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )}
    </div>
  )
}

// ── Toggle switch matching Figma (28×16px) ────────────────────────────────────
function ToggleSwitch({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      style={{
        width: '30px', height: '17px', borderRadius: '9px',
        backgroundColor: on ? '#4caf50' : 'rgba(28,28,28,0.2)',
        position: 'relative', cursor: 'pointer',
        transition: 'background-color 0.2s', flexShrink: 0,
      }}
    >
      <div style={{
        position: 'absolute',
        top: '2px',
        left: on ? '14px' : '2px',
        width: '13px', height: '13px', borderRadius: '50%',
        backgroundColor: '#fff',
        boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
        transition: 'left 0.2s',
      }} />
    </div>
  )
}

// ── Presence / status types ────────────────────────────────────────────────
const STATUS_OPTS = ['Online', 'Available', 'Busy', 'Out of office'] as const
type StatusOpt = typeof STATUS_OPTS[number]

const STATUS_DOT: Record<string, string> = {
  Online: '#22c55e',
  Available: '#22c55e',
  Busy: '#ef4444',
  'Out of office': '#f59e0b',
}

interface PresenceData {
  presenceStatus: StatusOpt
  showOnlineStatus: boolean
  oooMessage: string
}

// ── Avatar (initials fallback) ─────────────────────────────────────────────
function Avatar({ url, name, size = 32 }: { url?: string | null; name?: string; size?: number }) {
  const initials = name
    ? name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : '?'
  return (
    <div style={{
      width: `${size}px`, height: `${size}px`, borderRadius: '80px',
      backgroundColor: 'rgba(28,28,28,0.08)',
      overflow: 'hidden',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      {url ? (
        <img src={url} alt={name ?? 'avatar'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        <span style={{ fontFamily: FF, fontSize: `${Math.round(size * 0.38)}px`, fontWeight: 600, color: '#1c1c1c' }}>
          {initials}
        </span>
      )}
    </div>
  )
}

function roleLabel(role?: string) {
  const map: Record<string, string> = {
    LEARNER: 'Learner', TRAINER: 'Trainer', ORG_ADMIN: 'Admin', SUPER_ADMIN: 'Super Admin',
  }
  return role ? (map[role] ?? role) : 'Learner'
}

// ── Set a Status modal — pixel-perfect to Figma node 40000068:39453 ───────────
function SetStatusModal({
  initial,
  saving,
  onClose,
  onSave,
}: {
  initial: PresenceData
  saving: boolean
  onClose: () => void
  onSave: (data: PresenceData) => void
}) {
  const [selected, setSelected] = useState<StatusOpt>(initial.presenceStatus)
  const [showOnline, setShowOnline] = useState(initial.showOnlineStatus)
  const [oooMessage, setOooMessage] = useState(initial.oooMessage)

  return (
    /* Backdrop */
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        backgroundColor: 'rgba(0,0,0,0.35)',
        zIndex: 9999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      {/* Modal card — stop click propagation */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '508px',
          borderRadius: '12px',
          boxShadow: '0px 2px 6px rgba(13,10,44,0.08)',
          overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
        }}
      >
        {/* ── Header bar ── */}
        <div style={{
          backgroundColor: '#f4f4f4',
          height: '45px',
          padding: '0 16px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <span style={{
            fontFamily: FF, fontSize: '18px', fontWeight: 700,
            color: '#000', letterSpacing: '-0.36px',
            fontFeatureSettings: "'ss01' 1, 'cv01' 1, 'cv11' 1",
          }}>
            Set a Status
          </span>
          {/* Close button — circle X matching Figma PlusCircle icon */}
          <button
            onClick={onClose}
            style={{
              width: '32px', height: '32px', borderRadius: '50%',
              border: '1.5px solid rgba(28,28,28,0.3)',
              backgroundColor: 'transparent', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: 0,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 2l10 10M12 2L2 12" stroke="#1c1c1c" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* ── Body ── */}
        <div style={{
          backgroundColor: '#fff',
          padding: '24px 16px',
          borderRadius: '0 0 12px 12px',
          display: 'flex', flexDirection: 'column', gap: '16px',
        }}>
          {/* Inner content column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

            {/* Show my online status row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{
                fontFamily: FF, fontSize: '12px', fontWeight: 400,
                color: 'rgba(28,28,28,0.8)', lineHeight: '18px',
                fontFeatureSettings: "'ss01' 1, 'cv01' 1, 'cv11' 1",
              }}>
                Show my online status:
              </span>
              <ToggleSwitch on={showOnline} onClick={() => setShowOnline(v => !v)} />
            </div>

            {/* Status checkboxes */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {STATUS_OPTS.map(opt => (
                <div
                  key={opt}
                  onClick={() => setSelected(opt)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    cursor: 'pointer',
                  }}
                >
                  <FigmaCheckbox checked={selected === opt} onClick={() => setSelected(opt)} />
                  <span style={{
                    fontFamily: FF, fontSize: '14px', fontWeight: 400,
                    color: '#1c1c1c', lineHeight: '20px',
                    fontFeatureSettings: "'ss01' 1, 'cv01' 1, 'cv11' 1",
                    userSelect: 'none',
                  }}>
                    {opt}
                  </span>
                </div>
              ))}
            </div>

            {/* Out of office message */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{
                fontFamily: FF, fontSize: '12px', fontWeight: 400,
                color: 'rgba(28,28,28,0.8)', lineHeight: '18px',
                fontFeatureSettings: "'ss01' 1, 'cv01' 1, 'cv11' 1",
              }}>
                Out of office message:
              </span>
              <textarea
                value={oooMessage}
                onChange={e => setOooMessage(e.target.value)}
                placeholder=""
                style={{
                  width: '100%', boxSizing: 'border-box' as const,
                  height: '50px',
                  border: '1px solid rgba(28,28,28,0.4)',
                  borderRadius: '4px',
                  resize: 'none' as const,
                  padding: '6px 8px',
                  fontFamily: FF, fontSize: '14px', color: '#1c1c1c',
                  outline: 'none',
                  backgroundColor: selected === 'Out of office' ? '#fff' : 'rgba(28,28,28,0.02)',
                }}
              />
            </div>
          </div>

          {/* ── Footer buttons ── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {/* Save */}
            <button
              onClick={() => onSave({ presenceStatus: selected, showOnlineStatus: showOnline, oooMessage })}
              disabled={saving}
              style={{
                backgroundColor: saving ? '#888' : '#000',
                color: '#fff',
                border: 'none',
                borderRadius: '16px',
                padding: '0 9px',
                height: '32px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: saving ? 'default' : 'pointer',
                fontFamily: FF, fontSize: '14px', fontWeight: 400,
                fontFeatureSettings: "'ss01' 1, 'cv01' 1, 'cv11' 1",
                minWidth: '60px',
              }}
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
            {/* Cancel (Figma typo: "Cancle") */}
            <button
              onClick={onClose}
              style={{
                backgroundColor: '#000',
                color: '#fff',
                border: 'none',
                borderRadius: '16px',
                padding: '0 9px',
                height: '32px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
                fontFamily: FF, fontSize: '14px', fontWeight: 400,
                fontFeatureSettings: "'ss01' 1, 'cv01' 1, 'cv11' 1",
                minWidth: '60px',
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Notification types ─────────────────────────────────────────────────────
interface Notification {
  _id: string
  type: 'TASK_ASSIGNED' | 'COURSE_ENROLLED'
  title: string
  message: string
  read: boolean
  createdAt?: string
}

// ── Task type for header mini-list ─────────────────────────────────────────
interface HeaderTask {
  _id: string
  title: string
  status: string
  priority: string
  dueDate?: string
}

const TASK_STATUS_DOT: Record<string, string> = {
  PENDING:     '#59a8d4',
  IN_PROGRESS: '#8a8cd9',
  COMPLETED:   '#4aa785',
  OVERDUE:     '#f87171',
  CANCELLED:   'rgba(28,28,28,0.3)',
}

function timeAgo(dateStr?: string) {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

// ── Header ────────────────────────────────────────────────────────────────────
export default function Header() {
  const pathname  = usePathname()
  const router    = useRouter()
  const { data: session } = useSession()
  const token     = (session?.user as any)?.accessToken as string | undefined

  const [openDropdown,  setOpenDropdown]  = useState<string | null>(null)
  const [showSetStatus, setShowSetStatus] = useState(false)
  const [savingStatus,  setSavingStatus]  = useState(false)
  const [presence, setPresence] = useState<PresenceData>({
    presenceStatus: 'Online',
    showOnlineStatus: true,
    oooMessage: '',
  })
  const [userProfile, setUserProfile] = useState<{
    firstName?: string; lastName?: string; avatarUrl?: string | null; role?: string
  } | null>(null)

  // ── Notifications state ──
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  // ── Tasks state (header mini-list) ──
  const [headerTasks, setHeaderTasks] = useState<HeaderTask[]>([])
  const [activeTaskCount, setActiveTaskCount] = useState(0)

  const headerRef = useRef<HTMLDivElement>(null)
  const crumbs    = BREADCRUMB_MAP[pathname] ?? ['Dashboards']

  // Load current user profile + presence once token is available
  useEffect(() => {
    if (!token) return
    apiFetch<any>('/users/me', token)
      .then(res => {
        const u = res?.data ?? res
        setUserProfile({ firstName: u.firstName, lastName: u.lastName, avatarUrl: u.avatarUrl, role: u.role })
        setPresence({
          presenceStatus:  (u.presenceStatus as StatusOpt) ?? 'Online',
          showOnlineStatus: u.showOnlineStatus ?? true,
          oooMessage:       u.oooMessage ?? '',
        })
      })
      .catch(() => {})
  }, [token])

  // Fetch notifications — on mount and every 30s
  const fetchNotifications = useCallback(() => {
    if (!token) return
    apiFetch<any>('/notifications', token)
      .then(d => {
        const data = d?.data ?? {}
        setNotifications(data.notifications ?? [])
        setUnreadCount(data.unreadCount ?? 0)
      })
      .catch(() => {})
  }, [token])

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [fetchNotifications])

  // Fetch tasks for header mini-list — on mount and every 60s
  const fetchHeaderTasks = useCallback(() => {
    if (!token) return
    apiFetch<any>('/tasks?limit=5', token)
      .then(d => {
        const items: HeaderTask[] = Array.isArray(d?.data)
          ? d.data
          : (d?.data?.items ?? [])
        setHeaderTasks(items.slice(0, 5))
        // Badge = count of PENDING + IN_PROGRESS tasks (not completed/cancelled)
        const active = items.filter(t => t.status === 'PENDING' || t.status === 'IN_PROGRESS').length
        setActiveTaskCount(active)
      })
      .catch(() => {})
  }, [token])

  useEffect(() => {
    fetchHeaderTasks()
    const interval = setInterval(fetchHeaderTasks, 60000)
    return () => clearInterval(interval)
  }, [fetchHeaderTasks])

  const handleMarkAllRead = async () => {
    if (!token) return
    await apiFetch('/notifications/read-all', token, { method: 'PATCH' }).catch(() => {})
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    setUnreadCount(0)
  }

  const handleMarkRead = async (id: string) => {
    if (!token) return
    await apiFetch(`/notifications/${id}/read`, token, { method: 'PATCH' }).catch(() => {})
    setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n))
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setOpenDropdown(null)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const toggle = (name: string) => setOpenDropdown(p => p === name ? null : name)

  // Save presence to backend
  const handleSaveStatus = useCallback(async (data: PresenceData) => {
    setSavingStatus(true)
    try {
      if (token) await apiFetch('/users/me/presence', token, { method: 'PATCH', body: JSON.stringify(data) })
      setPresence(data)
    } catch { setPresence(data) }
    finally { setSavingStatus(false); setShowSetStatus(false) }
  }, [token])

  // Derive display values: prefer API data, fall back to session
  const sessionUser  = session?.user as any
  const displayName  =
    userProfile?.firstName && userProfile?.lastName
      ? `${userProfile.firstName} ${userProfile.lastName}`
      : userProfile?.firstName ?? sessionUser?.name ?? 'User'
  const displayRole  = roleLabel(userProfile?.role ?? sessionUser?.role)
  const avatarUrl    = userProfile?.avatarUrl
  const currentDotColor = STATUS_DOT[presence.presenceStatus] ?? '#22c55e'

  return (
    <>
      {/* ── Set a Status modal (portal-style fixed overlay) ── */}
      {showSetStatus && (
        <SetStatusModal
          initial={presence}
          saving={savingStatus}
          onClose={() => setShowSetStatus(false)}
          onSave={handleSaveStatus}
        />
      )}

      <header
        ref={headerRef}
        style={{
          height: '72px', flexShrink: 0,
          backgroundColor: '#fff',
          borderBottom: '1px solid rgba(28,28,28,0.1)',
          display: 'flex', alignItems: 'center',
          padding: '0 28px', gap: '12px',
          position: 'sticky', top: 0, zIndex: 100,
        }}
      >
        {/* Breadcrumbs */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '4px' }}>
          {crumbs.map((crumb, i) => (
            <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              {i > 0 && <span style={{ ...font(14, 400, 'rgba(28,28,28,0.2)') }}>/</span>}
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px', borderRadius: '8px', ...font(14, 400, i === crumbs.length - 1 ? '#1c1c1c' : 'rgba(28,28,28,0.4)') }}>
                {crumb}
              </button>
            </span>
          ))}
        </div>

        {/* Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: '8px', padding: '4px 8px', height: '28px', width: '219px', flexShrink: 0 }}>
          <SearchIcon />
          <span style={{ ...font(14, 400, 'rgba(28,28,28,0.4)'), flex: 1, lineHeight: '20px' }}>Search for account</span>
          <span style={{ ...font(12, 400, 'rgba(28,28,28,0.4)') }}>⌘/</span>
        </div>

        {/* Icon buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {/* Tasks */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => { toggle('tasks'); fetchHeaderTasks() }}
              style={{ width: '28px', height: '28px', borderRadius: '8px', border: 'none', cursor: 'pointer', backgroundColor: openDropdown === 'tasks' ? 'rgba(28,28,28,0.08)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <ClipboardIcon />
            </button>
            {activeTaskCount > 0 && (
              <div style={{ position: 'absolute', top: '-2px', right: '-4px', minWidth: '14px', height: '14px', borderRadius: '7px', backgroundColor: '#ff4747', display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', padding: '0 3px' }}>
                <span style={{ fontFamily: FF, fontSize: '9px', fontWeight: 600, color: '#fff', lineHeight: 1 }}>{activeTaskCount > 99 ? '99+' : activeTaskCount}</span>
              </div>
            )}
            {openDropdown === 'tasks' && (
              <div style={{ position: 'absolute', top: '44px', right: 0, backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0px 8px 24px rgba(13,10,44,0.12)', border: '1px solid rgba(28,28,28,0.1)', width: '300px', zIndex: 200, overflow: 'hidden' }}>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(28,28,28,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ ...font(14, 700) }}>My Tasks</span>
                  {activeTaskCount > 0 && (
                    <span style={{ ...font(11, 500, '#ff4747'), background: 'rgba(255,71,71,0.1)', borderRadius: 99, padding: '2px 7px' }}>
                      {activeTaskCount} active
                    </span>
                  )}
                </div>
                {headerTasks.length === 0 ? (
                  <div style={{ padding: '20px 16px', textAlign: 'center' as const }}>
                    <span style={{ ...font(13, 400, 'rgba(28,28,28,0.4)') }}>No tasks assigned yet</span>
                  </div>
                ) : (
                  headerTasks.map(t => (
                    <div
                      key={t._id}
                      onClick={() => { router.push('/tasks'); setOpenDropdown(null) }}
                      style={{ padding: '10px 16px', borderBottom: '1px solid rgba(28,28,28,0.06)', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
                    >
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: TASK_STATUS_DOT[t.status] ?? '#ccc', flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ ...font(13, t.status === 'PENDING' || t.status === 'IN_PROGRESS' ? 500 : 400), overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{t.title}</div>
                        <div style={{ ...font(11, 400, TASK_STATUS_DOT[t.status] ?? 'rgba(28,28,28,0.4)'), marginTop: 2 }}>
                          {t.status === 'PENDING' ? 'Pending' : t.status === 'IN_PROGRESS' ? 'In Progress' : t.status === 'COMPLETED' ? 'Complete' : t.status === 'OVERDUE' ? 'Overdue' : t.status}
                          {t.dueDate && ` · Due ${new Date(t.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`}
                        </div>
                      </div>
                    </div>
                  ))
                )}
                <button
                  onClick={() => { router.push('/tasks'); setOpenDropdown(null) }}
                  style={{ width: '100%', padding: '10px 16px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' as const, ...font(13, 600) }}
                >
                  Show All Tasks →
                </button>
              </div>
            )}
          </div>

          {/* Notifications bell */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => toggle('notifications')}
              style={{ width: '28px', height: '28px', borderRadius: '8px', border: 'none', cursor: 'pointer', backgroundColor: openDropdown === 'notifications' ? 'rgba(28,28,28,0.08)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <BellIcon />
            </button>
            {unreadCount > 0 && (
              <div style={{ position: 'absolute', top: '-2px', right: '-4px', minWidth: '14px', height: '14px', borderRadius: '7px', backgroundColor: '#ff4747', display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', padding: '0 3px' }}>
                <span style={{ fontFamily: FF, fontSize: '9px', fontWeight: 600, color: '#fff', lineHeight: 1 }}>{unreadCount > 99 ? '99+' : unreadCount}</span>
              </div>
            )}
            {openDropdown === 'notifications' && (
              <div style={{ position: 'absolute', top: '44px', right: 0, backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0px 8px 24px rgba(13,10,44,0.12)', border: '1px solid rgba(28,28,28,0.1)', width: '320px', zIndex: 200, overflow: 'hidden' }}>
                {/* Header row */}
                <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(28,28,28,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ ...font(14, 700) }}>Notifications {unreadCount > 0 && <span style={{ ...font(11, 400, 'rgba(28,28,28,0.4)') }}>({unreadCount} new)</span>}</span>
                  {unreadCount > 0 && (
                    <button onClick={handleMarkAllRead} style={{ background: 'none', border: 'none', cursor: 'pointer', ...font(12, 500, '#9747ff'), padding: 0 }}>
                      Mark all read
                    </button>
                  )}
                </div>
                {/* Notification list */}
                <div style={{ maxHeight: '360px', overflowY: 'auto' as const }}>
                  {notifications.length === 0 ? (
                    <div style={{ padding: '24px 16px', textAlign: 'center' as const }}>
                      <span style={{ ...font(13, 400, 'rgba(28,28,28,0.4)') }}>No notifications yet</span>
                    </div>
                  ) : (
                    notifications.map(n => (
                      <div
                        key={n._id}
                        onClick={() => handleMarkRead(n._id)}
                        style={{
                          padding: '12px 16px',
                          borderBottom: '1px solid rgba(28,28,28,0.06)',
                          display: 'flex', gap: '10px', cursor: 'pointer',
                          backgroundColor: n.read ? '#fff' : 'rgba(151,71,255,0.04)',
                          transition: 'background 0.15s',
                        }}
                      >
                        {/* Icon dot */}
                        <div style={{
                          width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                          backgroundColor: n.type === 'TASK_ASSIGNED' ? 'rgba(255,71,71,0.1)' : 'rgba(151,71,255,0.1)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          {n.type === 'TASK_ASSIGNED' ? (
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                              <rect x="3" y="2" width="10" height="13" rx="1.5" stroke={n.read ? 'rgba(28,28,28,0.4)' : '#ff4747'} strokeWidth="1.3"/>
                              <path d="M5.5 7h5M5.5 9.5h3" stroke={n.read ? 'rgba(28,28,28,0.4)' : '#ff4747'} strokeWidth="1.3" strokeLinecap="round"/>
                              <path d="M6 2.5h4" stroke={n.read ? 'rgba(28,28,28,0.4)' : '#ff4747'} strokeWidth="1.3" strokeLinecap="round"/>
                            </svg>
                          ) : (
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                              <path d="M8 2a4 4 0 0 0-4 4v2L3 10h10l-1-2V6a4 4 0 0 0-4-4z" stroke={n.read ? 'rgba(28,28,28,0.4)' : '#9747ff'} strokeWidth="1.3" strokeLinejoin="round"/>
                              <path d="M6.5 13a1.5 1.5 0 0 0 3 0" stroke={n.read ? 'rgba(28,28,28,0.4)' : '#9747ff'} strokeWidth="1.3" strokeLinecap="round"/>
                            </svg>
                          )}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ ...font(13, n.read ? 400 : 600), lineHeight: '18px' }}>{n.title}</div>
                          <div style={{ ...font(12, 400, 'rgba(28,28,28,0.55)'), lineHeight: '16px', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{n.message}</div>
                          <div style={{ ...font(11, 400, 'rgba(28,28,28,0.35)'), marginTop: '4px' }}>{timeAgo(n.createdAt)}</div>
                        </div>
                        {!n.read && (
                          <div style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#9747ff', flexShrink: 0, marginTop: '5px' }} />
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Profile badge */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => toggle('profile')}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', borderRadius: '12px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', width: '168px' }}
          >
            {/* Avatar with status dot — dynamic from API */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <Avatar url={avatarUrl} name={displayName} size={32} />
              <span style={{
                position: 'absolute', bottom: '0', right: '0',
                width: '9px', height: '9px', borderRadius: '50%',
                backgroundColor: presence.showOnlineStatus ? currentDotColor : 'rgba(28,28,28,0.2)',
                border: '1.5px solid #fff',
              }} />
            </div>
            <div style={{ flex: 1, minWidth: 0, textAlign: 'left' as const }}>
              <div style={{ ...font(14, 700, '#1c1c1c'), lineHeight: '20px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{displayName}</div>
              <div style={{ ...font(14, 400, 'rgba(28,28,28,0.6)'), lineHeight: '20px' }}>{displayRole}</div>
            </div>
            <CaretDownIcon />
          </button>

          {openDropdown === 'profile' && (
            <div style={{ position: 'absolute', top: '56px', right: 0, backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0px 8px 24px rgba(13,10,44,0.12)', border: '1px solid rgba(28,28,28,0.1)', width: '220px', zIndex: 200, overflow: 'hidden' }}>

              {/* Set Status */}
              <div
                onClick={() => { setOpenDropdown(null); setShowSetStatus(true) }}
                style={{ padding: '10px 16px', borderBottom: '1px solid rgba(28,28,28,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: presence.showOnlineStatus ? currentDotColor : 'rgba(28,28,28,0.2)', display: 'inline-block' }} />
                  <span style={{ ...font(13, 400) }}>Set Status</span>
                  <span style={{ ...font(11, 400, 'rgba(28,28,28,0.4)') }}>({presence.presenceStatus})</span>
                </div>
                <span style={{ color: 'rgba(28,28,28,0.3)', fontSize: '12px' }}>›</span>
              </div>

              {/* My Profile */}
              <div onClick={() => { router.push('/profile'); setOpenDropdown(null) }} style={{ padding: '10px 16px', borderBottom: '1px solid rgba(28,28,28,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                <span style={{ ...font(13, 400) }}>My Profile</span>
                <span style={{ color: 'rgba(28,28,28,0.3)', fontSize: '12px' }}>›</span>
              </div>

              {/* Email preference */}
              <div onClick={() => { router.push('/my-account'); setOpenDropdown(null) }} style={{ padding: '10px 16px', borderBottom: '1px solid rgba(28,28,28,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                <span style={{ ...font(13, 400) }}>Email preference</span>
                <span style={{ color: 'rgba(28,28,28,0.3)', fontSize: '12px' }}>›</span>
              </div>

              {/* My Activity */}
              <div onClick={() => { router.push('/activity-log'); setOpenDropdown(null) }} style={{ padding: '10px 16px', borderBottom: '1px solid rgba(28,28,28,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                <span style={{ ...font(13, 400) }}>My Activity</span>
                <span style={{ color: 'rgba(28,28,28,0.3)', fontSize: '12px' }}>›</span>
              </div>

              {/* User Guide */}
              <div onClick={() => { router.push('/help'); setOpenDropdown(null) }} style={{ padding: '10px 16px', borderBottom: '1px solid rgba(28,28,28,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                <span style={{ ...font(13, 400) }}>User Guide</span>
                <span style={{ color: 'rgba(28,28,28,0.3)', fontSize: '12px' }}>›</span>
              </div>

              {/* System Announcements */}
              <div onClick={() => { router.push('/dashboard'); setOpenDropdown(null) }} style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                <span style={{ ...font(13, 400) }}>System Announcements</span>
                <span style={{ color: 'rgba(28,28,28,0.3)', fontSize: '12px' }}>›</span>
              </div>

              {/* Sign Out */}
              <div style={{ padding: '8px', borderTop: '1px solid rgba(28,28,28,0.08)' }}>
                <button onClick={() => signOut({ callbackUrl: '/login' })} style={{ width: '100%', padding: '8px 12px', backgroundColor: 'rgba(244,63,94,0.08)', border: 'none', borderRadius: '8px', cursor: 'pointer', ...font(13, 600, '#e11d48') }}>
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </header>
    </>
  )
}
