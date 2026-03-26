'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useSession, signOut } from 'next-auth/react'
import * as XLSX from 'xlsx'

// ── Design tokens ─────────────────────────────────────────────────────────────
const FF   = "'Inter', sans-serif"
const FEAT = "'ss01' 1, 'cv01' 1, 'cv11' 1"
const font = (size: number, weight = 400, color = '#1c1c1c') =>
  ({ fontFamily: FF, fontSize: `${size}px`, fontWeight: weight, color,
     fontFeatureSettings: FEAT } as React.CSSProperties)

const SHADOW = '0px 2px 6px 0px rgba(13,10,44,0.08)'
const BORDER = '1px solid rgba(28,28,28,0.10)'
const NAVY   = '#1E1B39'
const MUTED  = '#9291A5'
const GREEN  = '#5FC966'
const RED    = '#F05C5C'
const AMBER  = '#F5A623'
const INDIGO = '#6C63FF'
const BG     = '#F5F5FA'

const card: React.CSSProperties = {
  background: '#fff', borderRadius: 16, boxShadow: SHADOW, padding: 20,
}
const btn = (primary = false): React.CSSProperties => ({
  border: primary ? 'none' : BORDER,
  borderRadius: 10, cursor: 'pointer', fontFamily: FF, fontSize: 13,
  fontWeight: 500, padding: '7px 14px', display: 'inline-flex',
  alignItems: 'center', gap: 6,
  background: primary ? '#1c1c1c' : 'transparent',
  color: primary ? '#fff' : '#1c1c1c',
})
const dangerBtn: React.CSSProperties = {
  border: 'none', borderRadius: 10, cursor: 'pointer', fontFamily: FF,
  fontSize: 13, fontWeight: 500, padding: '7px 14px', display: 'inline-flex',
  alignItems: 'center', gap: 6, background: RED, color: '#fff',
}
const badge = (color: string, bg: string): React.CSSProperties => ({
  display: 'inline-flex', alignItems: 'center', gap: 5,
  borderRadius: 99, padding: '3px 9px', fontSize: 12, fontWeight: 500,
  color, background: bg, whiteSpace: 'nowrap' as const,
})
const progressTrack: React.CSSProperties = {
  height: 6, background: '#E8E8ED', borderRadius: 99, overflow: 'hidden',
}
const inputStyle: React.CSSProperties = {
  border: BORDER, borderRadius: 10, padding: '9px 12px', fontFamily: FF,
  fontSize: 14, outline: 'none', width: '100%',
}

type Page = 'dashboard' | 'users' | 'courses' | 'tasks' | 'assign' | 'groups' | 'logs' | 'settings'

// ── API helpers ───────────────────────────────────────────────────────────────
const apiBase = () => process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1'
const apiFetch = (url: string, token: string, init?: RequestInit) =>
  fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(init?.headers ?? {}),
    },
  })

// ── Avatar helper ─────────────────────────────────────────────────────────────
const PALETTE = ['#1E1B39','#615E83','#5FC966','#F05C5C','#F5A623','#4A90E2','#6C63FF']
const avatarBg = (s: string) =>
  PALETTE[(s.charCodeAt(0) + (s.charCodeAt(1) || 0)) % PALETTE.length]

function Avatar({ initials, size = 32 }: { initials: string; size?: number }) {
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: avatarBg(initials),
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      ...font(Math.floor(size * 0.35), 600, '#fff') }}>
      {initials}
    </div>
  )
}

function StatCard({ label, value, color = '#1c1c1c' }: {
  label: string; value: string | number; color?: string
}) {
  return (
    <div style={{ ...card, display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ ...font(13, 400, MUTED) }}>{label}</div>
      <div style={{ ...font(28, 700, color), lineHeight: 1 }}>{value}</div>
    </div>
  )
}

function Badge({ children, color, bg }: { children: React.ReactNode; color: string; bg: string }) {
  return <span style={badge(color, bg)}>{children}</span>
}

function Divider() {
  return <div style={{ width: '100%', height: 1, background: 'rgba(28,28,28,0.10)' }} />
}

// ── Modal ─────────────────────────────────────────────────────────────────────
function Modal({ title, onClose, children, width = 520 }: {
  title: string; onClose: () => void; children: React.ReactNode; width?: number
}) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(13,10,44,0.45)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
      padding: 16 }}>
      <div style={{ background: '#fff', borderRadius: 20, boxShadow: '0 8px 40px rgba(13,10,44,0.18)',
        width: '100%', maxWidth: width, maxHeight: '90vh', overflowY: 'auto', padding: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div style={{ ...font(18, 700, NAVY) }}>{title}</div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer',
            color: MUTED, fontSize: 22, lineHeight: 1, padding: '0 4px' }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  )
}

// ── ConfirmDialog ─────────────────────────────────────────────────────────────
function ConfirmDialog({ message, onConfirm, onCancel, loading }: {
  message: string; onConfirm: () => void; onCancel: () => void; loading: boolean
}) {
  return (
    <Modal title="Confirm Action" onClose={onCancel} width={400}>
      <div style={{ ...font(14, 400), marginBottom: 24, color: '#444' }}>{message}</div>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <button style={btn()} onClick={onCancel}>Cancel</button>
        <button style={dangerBtn} onClick={onConfirm} disabled={loading}>
          {loading ? 'Deleting…' : 'Delete'}
        </button>
      </div>
    </Modal>
  )
}

// ── FormField ─────────────────────────────────────────────────────────────────
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ ...font(13, 500, NAVY), display: 'block', marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  )
}

// ── Spinner ───────────────────────────────────────────────────────────────────
function Spinner() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
      <div style={{ width: 32, height: 32, border: `3px solid ${BG}`, borderTopColor: NAVY,
        borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}

// ── SVG icons ─────────────────────────────────────────────────────────────────
const icons: Record<string, React.ReactNode> = {
  dashboard: <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><rect x="2" y="2" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.5"/><rect x="11" y="2" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.5"/><rect x="2" y="11" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.5"/><rect x="11" y="11" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.5"/></svg>,
  users:     <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="7" r="3.5" stroke="currentColor" strokeWidth="1.5"/><path d="M3 17c0-3.866 3.134-7 7-7s7 3.134 7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  courses:   <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M3 5h14M3 10h14M3 15h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  tasks:     <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><rect x="3" y="3" width="14" height="14" rx="3" stroke="currentColor" strokeWidth="1.5"/><path d="M7 10l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  assign:    <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><circle cx="7" cy="7" r="3" stroke="currentColor" strokeWidth="1.5"/><path d="M2 17c0-3 2.24-5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M13 11v6m-3-3h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  logs:      <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M4 5h12M4 10h12M4 15h7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  settings:  <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5"/><path d="M10 2v1.5M10 16.5V18M2 10h1.5M16.5 10H18M4.22 4.22l1.06 1.06M14.72 14.72l1.06 1.06M4.22 15.78l1.06-1.06M14.72 5.28l1.06-1.06" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  groups:    <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><circle cx="6" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.5"/><circle cx="14" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.5"/><path d="M1 17c0-2.5 2-4 5-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M19 17c0-2.5-2-4-5-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M7 17c0-2.761 1.343-5 3-5s3 2.239 3 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  logout:    <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M7 3H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h3M13 14l4-4-4-4M17 10H8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  bell:      <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M10 2a5 5 0 0 1 5 5c0 3.5 1.5 5 1.5 5h-13S5 10.5 5 7a5 5 0 0 1 5-5Z" stroke="currentColor" strokeWidth="1.5"/><path d="M8.27 15a1.75 1.75 0 0 0 3.46 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  search:    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="7" cy="7" r="5" stroke={MUTED} strokeWidth="1.4"/><path d="M11 11l3 3" stroke={MUTED} strokeWidth="1.4" strokeLinecap="round"/></svg>,
  plus:      <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>,
}

// ── Role / Status badges ───────────────────────────────────────────────────────
const roleBadge = (role: string) => {
  if (role === 'SUPER_ADMIN' || role === 'ORG_ADMIN')
    return <Badge color={NAVY} bg="rgba(28,28,28,0.08)">{role.replace('_', ' ')}</Badge>
  if (role === 'TRAINER')
    return <Badge color="#4a4ab5" bg="rgba(108,99,255,0.12)">Trainer</Badge>
  return <Badge color="#2a8c30" bg="rgba(95,201,102,0.12)">Learner</Badge>
}
const statusBadge = (s: string) => {
  const st = (s ?? '').toLowerCase()
  if (st === 'active')    return <Badge color="#2a8c30" bg="rgba(95,201,102,0.12)">Active</Badge>
  if (st === 'pending')   return <Badge color="#b8740a" bg="rgba(245,166,35,0.12)">Pending</Badge>
  if (st === 'suspended' || st === 'inactive')
    return <Badge color="#c0392b" bg="rgba(240,92,92,0.12)">Suspended</Badge>
  return <Badge color={MUTED} bg="rgba(28,28,28,0.06)">{s}</Badge>
}

// ── Pagination bar ────────────────────────────────────────────────────────────
function Pagination({ page, total, limit, onPage }: {
  page: number; total: number; limit: number; onPage: (p: number) => void
}) {
  const pages = Math.max(1, Math.ceil(total / limit))
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      paddingTop: 14, borderTop: BORDER, marginTop: 4, ...font(13, 400, MUTED) }}>
      <span>Showing {Math.min((page - 1) * limit + 1, total)}–{Math.min(page * limit, total)} of {total}</span>
      <div style={{ display: 'flex', gap: 4 }}>
        <button style={{ ...btn(false), fontSize: 12, padding: '5px 10px', borderRadius: 8 }}
          disabled={page <= 1} onClick={() => onPage(page - 1)}>← Prev</button>
        {Array.from({ length: Math.min(pages, 5) }, (_, i) => i + 1).map(p => (
          <button key={p} style={{ ...btn(p === page), fontSize: 12, padding: '5px 10px', borderRadius: 8 }}
            onClick={() => onPage(p)}>{p}</button>
        ))}
        <button style={{ ...btn(false), fontSize: 12, padding: '5px 10px', borderRadius: 8 }}
          disabled={page >= pages} onClick={() => onPage(page + 1)}>Next →</button>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// USERS PAGE
// ══════════════════════════════════════════════════════════════════════════════
interface UserRecord {
  _id: string; firstName: string; lastName: string; email: string;
  role: string; status: string; phone?: string; createdAt?: string
}

interface TrainerRecord { _id: string; firstName: string; lastName: string; email: string }

function UsersPage({ token }: { token: string }) {
  const [users, setUsers]           = useState<UserRecord[]>([])
  const [total, setTotal]           = useState(0)
  const [page, setPage]             = useState(1)
  const [search, setSearch]         = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [loading, setLoading]       = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [editUser, setEditUser]     = useState<UserRecord | null>(null)
  const [deleteUser, setDeleteUser] = useState<UserRecord | null>(null)
  const [deleting, setDeleting]     = useState(false)
  const [saving, setSaving]         = useState(false)
  const [error, setError]           = useState('')
  // Trainer assignment
  const [assignUser, setAssignUser]         = useState<UserRecord | null>(null)
  const [trainers, setTrainers]             = useState<TrainerRecord[]>([])
  const [selectedTrainerId, setSelectedTrainerId] = useState<string>('')
  const [assigning, setAssigning]           = useState(false)

  const LIMIT = 10

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(LIMIT) })
      if (search)     params.set('search', search)
      if (roleFilter) params.set('role', roleFilter)
      const res  = await apiFetch(`${apiBase()}/users?${params}`, token)
      const body = await res.json()
      setUsers(Array.isArray(body?.data) ? body.data : (body?.data?.items ?? []))
      setTotal(body?.pagination?.total ?? body?.data?.total ?? 0)
    } catch {
      setError('Failed to load users')
    } finally {
      setLoading(false)
    }
  }, [token, page, search, roleFilter])

  useEffect(() => { load() }, [load])

  // ── Create / Edit user ────────────────────────────────────────────────────
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', password: '', role: 'LEARNER', phone: ''
  })

  // Expose setForm for browser-automation testing
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).__adminForms = (window as any).__adminForms ?? {}
      ;(window as any).__adminForms.setUserForm = setForm
    }
  }, [setForm])

  const openCreate = () => {
    setForm({ firstName: '', lastName: '', email: '', password: '', role: 'LEARNER', phone: '' })
    setShowCreate(true)
  }
  const openEdit = (u: UserRecord) => {
    setForm({ firstName: u.firstName, lastName: u.lastName, email: u.email,
      password: '', role: u.role, phone: u.phone ?? '' })
    setEditUser(u)
  }

  const handleSave = async () => {
    setSaving(true); setError('')
    try {
      let res: Response
      if (editUser) {
        // UpdateUserDto only accepts firstName, lastName, phone, dateOfBirth
        const body: Record<string, string> = { firstName: form.firstName, lastName: form.lastName }
        if (form.phone) body.phone = form.phone
        res = await apiFetch(`${apiBase()}/users/${editUser._id}`, token, {
          method: 'PATCH', body: JSON.stringify(body),
        })
      } else {
        res = await apiFetch(`${apiBase()}/users`, token, {
          method: 'POST', body: JSON.stringify(form),
        })
      }
      if (!res.ok) {
        const b = await res.json().catch(() => ({}))
        throw new Error(b?.message ?? 'Save failed')
      }
      setShowCreate(false); setEditUser(null)
      load()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteUser) return
    setDeleting(true)
    try {
      await apiFetch(`${apiBase()}/users/${deleteUser._id}`, token, { method: 'DELETE' })
      setDeleteUser(null); load()
    } catch { setError('Delete failed') } finally { setDeleting(false) }
  }

  const handleStatus = async (u: UserRecord, status: string) => {
    try {
      await apiFetch(`${apiBase()}/users/${u._id}/status`, token, {
        method: 'PATCH', body: JSON.stringify({ status }),
      })
      load()
    } catch { setError('Status update failed') }
  }

  const openAssignTrainer = async (u: UserRecord) => {
    setAssignUser(u)
    setSelectedTrainerId((u as any).assignedTrainerId ?? '')
    if (trainers.length === 0) {
      try {
        const r = await apiFetch(`${apiBase()}/users/trainer/all-trainers`, token)
        const d = await r.json()
        setTrainers(Array.isArray(d?.data) ? d.data : [])
      } catch { setTrainers([]) }
    }
  }

  const handleAssignTrainer = async () => {
    if (!assignUser) return
    setAssigning(true)
    try {
      await apiFetch(`${apiBase()}/users/${assignUser._id}/assign-trainer`, token, {
        method: 'PATCH',
        body: JSON.stringify({ trainerId: selectedTrainerId || null }),
      })
      setAssignUser(null)
      load()
    } catch { setError('Assign trainer failed') } finally { setAssigning(false) }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ ...font(22, 700, NAVY) }}>User Management</div>
          <div style={{ ...font(13, 400, MUTED), marginTop: 2 }}>Manage all learners, trainers, and admins</div>
        </div>
        <button style={btn(true)} onClick={openCreate}>
          <span style={{ color: '#fff' }}>{icons.plus}</span> Add User
        </button>
      </div>

      {error && (
        <div style={{ background: 'rgba(240,92,92,0.1)', border: `1px solid ${RED}`, borderRadius: 10,
          padding: '10px 14px', ...font(13, 400, RED) }}>{error}</div>
      )}

      {/* Table */}
      <div style={card}>
        {/* Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingBottom: 16,
          borderBottom: BORDER, marginBottom: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: BG,
            border: BORDER, borderRadius: 10, padding: '8px 12px', flex: 1, maxWidth: 260 }}>
            {icons.search}
            <input type="text" placeholder="Search users…" value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              style={{ border: 'none', background: 'transparent', outline: 'none',
                fontFamily: FF, fontSize: 13, color: '#1c1c1c', width: '100%' }} />
          </div>
          <select value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1) }}
            style={{ border: BORDER, borderRadius: 10, padding: '7px 10px', fontFamily: FF, fontSize: 13, outline: 'none' }}>
            <option value="">All Roles</option>
            <option value="LEARNER">Learner</option>
            <option value="TRAINER">Trainer</option>
            <option value="ORG_ADMIN">Admin</option>
            <option value="SUPER_ADMIN">Super Admin</option>
          </select>
        </div>

        {loading ? <Spinner /> : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ borderBottom: BORDER }}>
                  {['Name / Email', 'Role', 'Status', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '8px 12px', textAlign: 'left',
                      ...font(11, 600, MUTED), textTransform: 'uppercase',
                      letterSpacing: '0.4px', whiteSpace: 'nowrap' as const }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.length === 0 && (
                  <tr><td colSpan={4} style={{ padding: 32, textAlign: 'center', ...font(14, 400, MUTED) }}>
                    No users found
                  </td></tr>
                )}
                {users.map((u, i) => {
                  const initials = `${u.firstName?.[0] ?? ''}${u.lastName?.[0] ?? ''}`.toUpperCase()
                  return (
                    <tr key={u._id} style={{ borderBottom: i < users.length - 1 ? BORDER : 'none' }}>
                      <td style={{ padding: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <Avatar initials={initials || '?'} size={32} />
                          <div>
                            <div style={{ ...font(14, 500, NAVY) }}>{u.firstName} {u.lastName}</div>
                            <div style={{ ...font(12, 400, MUTED) }}>{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '12px' }}>{roleBadge(u.role)}</td>
                      <td style={{ padding: '12px' }}>{statusBadge(u.status)}</td>
                      <td style={{ padding: '12px' }}>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' as const }}>
                          <button style={{ ...btn(), fontSize: 12, padding: '5px 10px', borderRadius: 8 }}
                            onClick={() => openEdit(u)}>Edit</button>
                          {u.role === 'LEARNER' && (
                            <button style={{ ...btn(), fontSize: 12, padding: '5px 10px', borderRadius: 8, color: INDIGO, borderColor: INDIGO }}
                              onClick={() => openAssignTrainer(u)}>
                              {(u as any).assignedTrainerId ? '👤 Trainer' : 'Assign Trainer'}
                            </button>
                          )}
                          {(u.status ?? '').toLowerCase() !== 'active' && (
                            <button style={{ ...btn(true), fontSize: 12, padding: '5px 10px', borderRadius: 8 }}
                              onClick={() => handleStatus(u, 'ACTIVE')}>Activate</button>
                          )}
                          {(u.status ?? '').toLowerCase() === 'active' && u.role === 'LEARNER' && (
                            <button style={{ ...btn(), fontSize: 12, padding: '5px 10px', borderRadius: 8, color: AMBER, borderColor: AMBER }}
                              onClick={() => handleStatus(u, 'INACTIVE')}>Suspend</button>
                          )}
                          <button style={{ ...btn(), fontSize: 12, padding: '5px 10px', borderRadius: 8, color: RED }}
                            onClick={() => setDeleteUser(u)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
        <Pagination page={page} total={total} limit={LIMIT} onPage={setPage} />
      </div>

      {/* Create / Edit Modal */}
      {(showCreate || editUser) && (
        <Modal title={editUser ? 'Edit User' : 'Add New User'} onClose={() => { setShowCreate(false); setEditUser(null) }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="First Name">
                <input style={inputStyle} value={form.firstName}
                  onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} />
              </Field>
              <Field label="Last Name">
                <input style={inputStyle} value={form.lastName}
                  onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} />
              </Field>
            </div>
            <Field label="Email">
              <input style={inputStyle} type="email" value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            </Field>
            {!editUser && (
              <Field label="Password (min 8 characters)">
                <input style={inputStyle} type="password" value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
              </Field>
            )}
            <Field label="Role">
              <select style={inputStyle} value={form.role}
                onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                <option value="LEARNER">Learner</option>
                <option value="TRAINER">Trainer</option>
                <option value="ORG_ADMIN">Org Admin</option>
                <option value="SUPER_ADMIN">Super Admin</option>
              </select>
            </Field>
            <Field label="Phone (optional)">
              <input style={inputStyle} value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
            </Field>
            {error && <div style={{ ...font(13, 400, RED) }}>{error}</div>}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
              <button style={btn()} onClick={() => { setShowCreate(false); setEditUser(null) }}>Cancel</button>
              <button style={btn(true)} onClick={handleSave} disabled={saving}>
                {saving ? 'Saving…' : editUser ? 'Save Changes' : 'Create User'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirm */}
      {deleteUser && (
        <ConfirmDialog
          message={`Delete ${deleteUser.firstName} ${deleteUser.lastName}? This action cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteUser(null)}
          loading={deleting}
        />
      )}

      {/* Assign Trainer Modal */}
      {assignUser && (
        <Modal title={`Assign Trainer — ${assignUser.firstName} ${assignUser.lastName}`} onClose={() => setAssignUser(null)} width={440}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ ...font(13, 400, MUTED) }}>
              Select the trainer this learner should be assigned to. Choose "Unassigned" to remove their current trainer.
            </div>
            {trainers.length === 0 ? (
              <div style={{ ...font(13, 400, MUTED), textAlign: 'center', padding: '16px 0' }}>
                No trainers found. Create a trainer user first.
              </div>
            ) : (
              <Field label="Trainer">
                <select style={inputStyle} value={selectedTrainerId}
                  onChange={e => setSelectedTrainerId(e.target.value)}>
                  <option value="">— Unassigned —</option>
                  {trainers.map(t => (
                    <option key={t._id} value={t._id}>
                      {t.firstName} {t.lastName} ({t.email})
                    </option>
                  ))}
                </select>
              </Field>
            )}
            {(assignUser as any).assignedTrainerId && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(108,99,255,0.07)', borderRadius: 8, padding: '8px 12px' }}>
                <span style={{ fontSize: 14 }}>👤</span>
                <span style={{ ...font(12, 500, INDIGO) }}>Currently assigned to a trainer</span>
              </div>
            )}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
              <button style={btn()} onClick={() => setAssignUser(null)}>Cancel</button>
              <button style={btn(true)} onClick={handleAssignTrainer} disabled={assigning}>
                {assigning ? 'Saving…' : 'Save Assignment'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// COURSES PAGE — extended design tokens & helpers
// ══════════════════════════════════════════════════════════════════════════════
// Extra palette (admin page doesn't define these)
const C_INDIGO_LIGHT = '#EEF2FF'
const C_PURPLE       = '#8B5CF6'
const C_TEAL         = '#06B6D4'
const C_GREEN_EM     = '#10B981'
const C_GRAY50       = '#F9FAFB'
const C_GRAY100      = '#F3F4F6'
const C_GRAY200      = '#E5E7EB'
const C_GRAY400      = '#9CA3AF'
const C_GRAY600      = '#4B5563'
const C_GRAY900      = '#111827'
const C_WHITE        = '#FFFFFF'
const C_SH_SM        = '0 1px 3px rgba(0,0,0,0.08),0 1px 2px rgba(0,0,0,0.04)'
const C_SH_MD        = '0 4px 16px rgba(0,0,0,0.08),0 2px 6px rgba(0,0,0,0.04)'
const C_SH_LG        = '0 20px 48px rgba(0,0,0,0.12),0 8px 20px rgba(0,0,0,0.06)'
const C_SH_INDIGO    = '0 4px 14px rgba(99,102,241,0.35)'
const C_FF           = "'Inter','SF Pro Display',-apple-system,sans-serif"
const cf = (size: number, weight = 400, color = C_GRAY900, extra: React.CSSProperties = {}): React.CSSProperties =>
  ({ fontFamily: C_FF, fontSize: `${size}px`, fontWeight: weight, color, lineHeight: 1.5, ...extra })
const cInput: React.CSSProperties = {
  border: `1.5px solid ${C_GRAY200}`, borderRadius: 10, padding: '10px 14px',
  fontFamily: C_FF, fontSize: 14, outline: 'none', width: '100%',
  boxSizing: 'border-box', color: C_GRAY900, background: C_WHITE,
  transition: 'border-color 0.15s, box-shadow 0.15s',
}
const cBtnPrimary: React.CSSProperties = {
  background: `linear-gradient(135deg,#6366F1 0%,${C_PURPLE} 100%)`,
  color: C_WHITE, border: 'none', borderRadius: 10, padding: '10px 20px',
  cursor: 'pointer', fontFamily: C_FF, fontSize: 13, fontWeight: 600,
  display: 'inline-flex', alignItems: 'center', gap: 7,
  boxShadow: C_SH_INDIGO,
}
const cBtnSecondary: React.CSSProperties = {
  background: C_WHITE, color: C_GRAY600, border: `1.5px solid ${C_GRAY200}`,
  borderRadius: 10, padding: '9px 16px', cursor: 'pointer',
  fontFamily: C_FF, fontSize: 13, fontWeight: 500,
  display: 'inline-flex', alignItems: 'center', gap: 6,
}
const cBtnDanger: React.CSSProperties = {
  background: '#EF4444', color: C_WHITE, border: 'none', borderRadius: 10,
  padding: '9px 18px', cursor: 'pointer', fontFamily: C_FF, fontSize: 13, fontWeight: 600,
}
const cBtnGhost = (color = C_GRAY600, borderColor = C_GRAY200): React.CSSProperties => ({
  background: 'transparent', color, border: `1.5px solid ${borderColor}`,
  borderRadius: 8, padding: '5px 11px', cursor: 'pointer',
  fontFamily: C_FF, fontSize: 12, fontWeight: 500,
  display: 'inline-flex', alignItems: 'center', gap: 5,
})

function CChip({ label, color, bg, dot }: { label: React.ReactNode; color: string; bg: string; dot?: string }) {
  return (
    <span style={{ display:'inline-flex',alignItems:'center',gap:5,borderRadius:99,padding:'4px 10px',fontSize:11,fontWeight:600,color,background:bg,fontFamily:C_FF }}>
      {dot && <span style={{ width:6,height:6,borderRadius:'50%',background:dot,flexShrink:0 }} />}
      {label}
    </span>
  )
}

function CStatCard({ icon, label, value, gradient }: { icon: string; label: string; value: number|string; gradient: string }) {
  return (
    <div style={{ background:C_WHITE,borderRadius:16,boxShadow:C_SH_SM,padding:'18px 22px',display:'flex',alignItems:'center',gap:16,flex:1 }}>
      <div style={{ width:48,height:48,borderRadius:14,background:gradient,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,flexShrink:0 }}>{icon}</div>
      <div>
        <div style={cf(22,700,C_GRAY900)}>{value}</div>
        <div style={cf(12,500,C_GRAY400)}>{label}</div>
      </div>
    </div>
  )
}

// ── Course Stepper ────────────────────────────────────────────────────────────
function CStepper({ step }: { step: number }) {
  const steps = [{ label:'Course Info', icon:'📋' },{ label:'Modules & Content', icon:'📦' },{ label:'Review & Save', icon:'✅' }]
  return (
    <div style={{ display:'flex',alignItems:'center',gap:0,marginBottom:24,padding:'14px 18px',background:C_GRAY50,borderRadius:14 }}>
      {steps.map(({ label, icon },i) => {
        const active=i+1===step, done=i+1<step
        return (
          <div key={i} style={{ display:'flex',alignItems:'center',flex:i<steps.length-1?1:'none' }}>
            <div style={{ display:'flex',alignItems:'center',gap:9 }}>
              <div style={{ width:32,height:32,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,background:done?`linear-gradient(135deg,${C_GREEN_EM},#059669)`:active?`linear-gradient(135deg,#6366F1,${C_PURPLE})`:C_WHITE,border:`2px solid ${done?C_GREEN_EM:active?'#6366F1':C_GRAY200}`,boxShadow:active?C_SH_INDIGO:'none',fontSize:12,color:done||active?C_WHITE:C_GRAY400,fontWeight:700 }}>
                {done?'✓':active?icon:i+1}
              </div>
              <div>
                <div style={cf(12,done||active?600:400,done?C_GREEN_EM:active?'#6366F1':C_GRAY400)}>{label}</div>
                {active && <div style={cf(10,400,C_GRAY400)}>Current step</div>}
              </div>
            </div>
            {i<steps.length-1 && <div style={{ flex:1,height:2,marginLeft:12,marginRight:12,background:done?`linear-gradient(90deg,${C_GREEN_EM},${C_GREEN_EM})`:C_GRAY200,borderRadius:2 }} />}
          </div>
        )
      })}
    </div>
  )
}

// ── Excel helpers ─────────────────────────────────────────────────────────────
function cDownloadTemplate() {
  const wb = XLSX.utils.book_new()
  const info = XLSX.utils.aoa_to_sheet([
    ['Field','Value','Notes'],
    ['Course Title','Workplace Safety Fundamentals','Required'],
    ['Description','Learn essential safety procedures and emergency response protocols.','Optional'],
    ['Category','Health & Safety','Optional'],
    ['Emoji','🛡️','Any single emoji'],
    ['Status','PUBLISHED','PUBLISHED or DRAFT'],
  ])
  info['!cols']=[{wch:18},{wch:52},{wch:20}]
  XLSX.utils.book_append_sheet(wb,info,'Course Info')
  const data = XLSX.utils.aoa_to_sheet([
    ['Module Name','Slide Content (optional)','Question','Option A','Option B','Option C','Option D','Correct (A/B/C/D)','Explanation','Pass %'],
    ['Intro to Safety','Safety means being protected from harm. Always assess before acting.','First step in an emergency?','Call 911','Assess situation','Evacuate','Sound alarm','B','Always assess first.',70],
    ['Intro to Safety','','PPE stands for?','Personal Protective Equipment','Planned Protection Exercise','Primary Protective Element','Personnel Enforcement','A','',70],
    ['Communication Skills','Clear communication reduces errors and builds team trust.','Active listening involves?','Talking more','Focusing on speaker','Planning your reply','Checking phone','B','Give full attention to the speaker.',75],
    ['Communication Skills','','Key element of clear communication?','Using jargon','Being concise','Speaking fast','Avoiding eye contact','B','',75],
  ])
  data['!cols']=[{wch:24},{wch:44},{wch:36},{wch:22},{wch:22},{wch:22},{wch:22},{wch:16},{wch:34},{wch:8}]
  XLSX.utils.book_append_sheet(wb,data,'Modules & Quizzes')
  XLSX.writeFile(wb,'course_bulk_import_template.xlsx')
}

interface CParsedExcel {
  courseInfo: { title:string; description:string; category:string; emoji:string; status:string }
  modules: CourseModule[]
}
async function cParseExcel(file: File): Promise<CParsedExcel> {
  return new Promise((resolve,reject) => {
    const reader = new FileReader()
    reader.onerror = reject
    reader.onload = e => {
      try {
        const wb = XLSX.read(new Uint8Array(e.target!.result as ArrayBuffer),{type:'array'})
        const ci = {title:'',description:'',category:'',emoji:'📚',status:'PUBLISHED'}
        const infoName = wb.SheetNames.find(n=>n.toLowerCase().includes('info'))
        if (infoName) {
          const rows = XLSX.utils.sheet_to_json<string[]>(wb.Sheets[infoName],{header:1,defval:''}) as string[][]
          for (const r of rows) {
            const k=String(r[0]||'').toLowerCase().trim(),v=String(r[1]||'').trim()
            if (!v) continue
            if (k.includes('title')) ci.title=v
            if (k.includes('desc')) ci.description=v
            if (k.includes('categ')) ci.category=v
            if (k.includes('emoji')||k.includes('icon')) ci.emoji=v
            if (k.includes('status')) ci.status=v.toUpperCase()==='DRAFT'?'DRAFT':'PUBLISHED'
          }
        }
        const dataName=wb.SheetNames.find(n=>!n.toLowerCase().includes('info'))??wb.SheetNames[0]
        const raw=XLSX.utils.sheet_to_json<string[]>(wb.Sheets[dataName],{header:1,defval:''}) as string[][]
        const moduleMap=new Map<string,CourseModule>(), order:string[]=[]
        for (let i=1;i<raw.length;i++) {
          const r=raw[i]; if (!r||r.every(c=>!c)) continue
          const mName=String(r[0]||'').trim(); if (!mName) continue
          const slide=String(r[1]||'').trim(),q=String(r[2]||'').trim()
          if (!moduleMap.has(mName)) { moduleMap.set(mName,{name:mName,slides:[],quiz:{passingScore:r[9]?Number(r[9]):70,questions:[]}}); order.push(mName) }
          const mod=moduleMap.get(mName)!
          if (slide&&!mod.slides.some(s=>s.content===slide)) mod.slides.push({content:slide})
          if (r[9]) mod.quiz!.passingScore=Number(r[9])
          if (q) { const am:Record<string,number>={A:0,B:1,C:2,D:3}; mod.quiz!.questions.push({question:q,options:[String(r[3]||''),String(r[4]||''),String(r[5]||''),String(r[6]||'')],correctIndex:am[String(r[7]||'').trim().toUpperCase()]??0,explanation:String(r[8]||'')}) }
        }
        Array.from(moduleMap.values()).forEach(mod=>{ if (mod.slides.length===0) mod.slides.push({content:''}) })
        resolve({courseInfo:ci,modules:order.map(n=>moduleMap.get(n)!)})
      } catch(err){reject(err)}
    }
    reader.readAsArrayBuffer(file)
  })
}

// ── Upload Zone (admin variant) ───────────────────────────────────────────────
function CUploadZone({ onParsed }: { onParsed: (r: CParsedExcel) => void }) {
  const [drag,setDrag]=useState(false)
  const [st,setSt]=useState<'idle'|'loading'|'done'|'error'>('idle')
  const [sum,setSum]=useState<{modules:number;questions:number;hasCourseInfo:boolean}|null>(null)
  const [err,setErr]=useState('')
  const ref=useRef<HTMLInputElement>(null)

  const go=async(file:File)=>{
    if (!file.name.match(/\.xlsx?$/i)){setErr('Please upload a .xlsx file');setSt('error');return}
    setSt('loading');setErr('')
    try {
      const r=await cParseExcel(file)
      setSum({modules:r.modules.length,questions:r.modules.reduce((s,m)=>s+(m.quiz?.questions.length??0),0),hasCourseInfo:!!r.courseInfo.title})
      setSt('done');onParsed(r)
    } catch {setErr('Could not read file — use the template format.');setSt('error')}
  }

  return (
    <div style={{marginBottom:22}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <div style={{width:30,height:30,borderRadius:8,background:'linear-gradient(135deg,#06B6D4,#6366F1)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14}}>📤</div>
          <div>
            <div style={cf(13,700,C_GRAY900)}>Bulk Upload from Excel</div>
            <div style={cf(11,400,C_GRAY400)}>Auto-fills course info, modules, slides & quizzes</div>
          </div>
          <span style={{...cf(10,700,'#F59E0B'),background:'rgba(245,158,11,0.12)',borderRadius:99,padding:'3px 9px',border:'1px solid rgba(245,158,11,0.25)'}}>⚡ Recommended</span>
        </div>
        <button onClick={cDownloadTemplate} style={{...cBtnSecondary,borderColor:C_TEAL,color:C_TEAL,fontSize:12,padding:'6px 12px'}}>⬇ Template</button>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:12}}>
        <div style={{background:C_GRAY50,borderRadius:10,padding:10,border:`1px solid ${C_GRAY200}`}}>
          <div style={cf(11,700,C_GRAY600,{marginBottom:6})}>📋 Sheet 1 — "Course Info"</div>
          <table style={{width:'100%',borderCollapse:'collapse',fontSize:10,fontFamily:C_FF}}>
            <tbody>{[['Course Title','My Course'],['Description','…'],['Category','IT'],['Status','PUBLISHED']].map(([k,v],i)=>(
              <tr key={i}><td style={{padding:'2px 6px',fontWeight:600,color:C_GRAY600,background:i%2===0?C_GRAY50:C_WHITE,borderBottom:`1px solid ${C_GRAY100}`}}>{k}</td><td style={{padding:'2px 6px',color:C_GRAY400,background:i%2===0?C_GRAY50:C_WHITE,borderBottom:`1px solid ${C_GRAY100}`}}>{v}</td></tr>
            ))}</tbody>
          </table>
        </div>
        <div style={{background:C_GRAY50,borderRadius:10,padding:10,border:`1px solid ${C_GRAY200}`}}>
          <div style={cf(11,700,C_GRAY600,{marginBottom:6})}>🗂️ Sheet 2 — "Modules & Quizzes"</div>
          <table style={{borderCollapse:'collapse',fontSize:10,fontFamily:C_FF,width:'100%'}}>
            <thead><tr style={{background:'linear-gradient(90deg,#6366F1,#8B5CF6)'}}>{['Module','Slide','Question','A','B','C','D','✓','%'].map(h=><th key={h} style={{padding:'3px 5px',color:C_WHITE,fontWeight:600,textAlign:'left'}}>{h}</th>)}</tr></thead>
            <tbody><tr style={{background:C_GRAY50}}><td style={{padding:'3px 5px',color:'#6366F1',fontWeight:600}}>Safety</td><td style={{padding:'3px 5px',color:C_GRAY400}}>PPE…</td><td style={{padding:'3px 5px',color:C_GRAY600}}>First step?</td><td style={{padding:'3px 5px',color:C_GRAY400}}>Call 911</td><td style={{padding:'3px 5px',color:C_GRAY400}}>Assess</td><td style={{padding:'3px 5px',color:C_GRAY400}}>Run</td><td style={{padding:'3px 5px',color:C_GRAY400}}>Alarm</td><td style={{padding:'3px 5px',color:C_GREEN_EM,fontWeight:700}}>B</td><td style={{padding:'3px 5px',color:C_GRAY400}}>70</td></tr></tbody>
          </table>
        </div>
      </div>

      <div onDragOver={e=>{e.preventDefault();setDrag(true)}} onDragLeave={()=>setDrag(false)}
        onDrop={e=>{e.preventDefault();setDrag(false);const f=e.dataTransfer.files[0];if(f)go(f)}}
        onClick={()=>st!=='loading'&&ref.current?.click()}
        style={{border:`2px dashed ${drag?'#6366F1':st==='done'?C_GREEN_EM:st==='error'?'#EF4444':C_GRAY200}`,borderRadius:14,padding:'22px 20px',textAlign:'center',cursor:'pointer',background:drag?C_INDIGO_LIGHT:st==='done'?'rgba(16,185,129,0.05)':st==='error'?'rgba(239,68,68,0.04)':C_GRAY50,transition:'all 0.2s'}}>
        <input ref={ref} type="file" accept=".xlsx,.xls" style={{display:'none'}} onChange={e=>{const f=e.target.files?.[0];if(f)go(f);e.target.value=''}} />
        {st==='loading'&&<div><div style={{fontSize:28,marginBottom:8}}>⏳</div><div style={cf(13,600,C_GRAY600)}>Parsing…</div></div>}
        {st==='done'&&sum&&(
          <div>
            <div style={{width:44,height:44,borderRadius:'50%',background:'linear-gradient(135deg,#10B981,#059669)',margin:'0 auto 10px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,boxShadow:'0 4px 12px rgba(16,185,129,0.4)'}}>✓</div>
            <div style={cf(14,700,'#059669')}>Imported successfully!</div>
            <div style={{display:'flex',justifyContent:'center',gap:8,marginTop:8,flexWrap:'wrap'}}>
              {sum.hasCourseInfo&&<CChip label="Course info filled" color={C_TEAL} bg="rgba(6,182,212,0.1)" />}
              <CChip label={`${sum.modules} modules`} color="#6366F1" bg={C_INDIGO_LIGHT} />
              <CChip label={`${sum.questions} questions`} color={C_PURPLE} bg="rgba(139,92,246,0.1)" />
            </div>
            <div style={cf(11,400,C_GRAY400,{marginTop:8})}>Click to upload a different file</div>
          </div>
        )}
        {st==='error'&&<div><div style={{fontSize:28,marginBottom:8}}>❌</div><div style={cf(13,600,'#EF4444')}>{err}</div><div style={cf(11,400,C_GRAY400,{marginTop:4})}>Click to try again</div></div>}
        {st==='idle'&&(
          <div>
            <div style={{fontSize:34,marginBottom:8}}>📂</div>
            <div style={cf(14,600,C_GRAY900)}>Drop your .xlsx file here</div>
            <div style={cf(12,400,C_GRAY400,{marginTop:4})}>or click to browse your computer</div>
            <div style={{marginTop:12,display:'inline-flex',alignItems:'center',gap:6,background:C_INDIGO_LIGHT,borderRadius:99,padding:'5px 14px'}}><span style={cf(11,600,'#6366F1')}>Fills title, modules, slides & quiz questions automatically</span></div>
          </div>
        )}
      </div>
      <div style={{display:'flex',alignItems:'center',gap:12,marginTop:18,marginBottom:4}}>
        <div style={{flex:1,height:1,background:C_GRAY200}} />
        <span style={cf(11,500,C_GRAY400)}>or build manually below</span>
        <div style={{flex:1,height:1,background:C_GRAY200}} />
      </div>
    </div>
  )
}

// ── Admin Module Card (collapsible) ───────────────────────────────────────────
function CModuleCard({ mod, mi, total, onChange, onRemove }: {
  mod: CourseModule; mi: number; total: number
  onChange: (u: CourseModule) => void; onRemove: () => void
}) {
  const [open,setOpen]=useState(true)
  const slidesFilled=mod.slides.filter(s=>s.content.trim()).length
  const qCount=mod.quiz?.questions.length??0
  const accents=['#6366F1',C_PURPLE,C_TEAL,'#F59E0B',C_GREEN_EM]
  const accent=accents[mi%5]

  const updQ=(qi:number,u:Partial<QuizQuestion>)=>onChange({...mod,quiz:{...mod.quiz!,questions:mod.quiz!.questions.map((q,j)=>j===qi?{...q,...u}:q)}})

  return (
    <div style={{marginBottom:12,borderRadius:14,overflow:'hidden',boxShadow:C_SH_SM,border:open?`1.5px solid ${accent}22`:`1.5px solid ${C_GRAY200}`}}>
      <div style={{display:'flex',alignItems:'center',gap:12,padding:'13px 16px',background:open?`linear-gradient(135deg,${accent}0F,${accent}05)`:C_WHITE,cursor:'pointer'}} onClick={()=>setOpen(o=>!o)}>
        <div style={{width:30,height:30,borderRadius:9,background:`linear-gradient(135deg,${accent},${accent}BB)`,color:C_WHITE,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:800,flexShrink:0,boxShadow:`0 2px 8px ${accent}44`}}>M{mi+1}</div>
        <div style={{flex:1,minWidth:0}} onClick={e=>e.stopPropagation()}>
          <input style={{border:'none',background:'transparent',padding:0,fontSize:14,fontWeight:600,color:C_GRAY900,outline:'none',fontFamily:C_FF,width:'100%'}} placeholder={`Module ${mi+1} name`} value={mod.name} onChange={e=>onChange({...mod,name:e.target.value})} />
        </div>
        <div style={{display:'flex',alignItems:'center',gap:6,flexShrink:0}}>
          {slidesFilled>0&&<CChip label={`📄 ${slidesFilled}`} color={C_GRAY600} bg={C_GRAY100} />}
          {qCount>0&&<CChip label={`🧩 ${qCount}`} color={C_PURPLE} bg="rgba(139,92,246,0.1)" />}
          <div style={{width:22,height:22,borderRadius:6,background:C_GRAY100,display:'flex',alignItems:'center',justifyContent:'center',color:C_GRAY400,fontSize:10}}>{open?'▲':'▼'}</div>
          {total>1&&<button onClick={e=>{e.stopPropagation();onRemove()}} style={{background:'rgba(239,68,68,0.08)',border:'none',cursor:'pointer',width:24,height:24,borderRadius:6,color:'#EF4444',fontSize:16,display:'flex',alignItems:'center',justifyContent:'center'}}>×</button>}
        </div>
      </div>

      {open&&(
        <div style={{padding:'4px 16px 16px',background:C_WHITE}}>
          {/* Slides */}
          <div style={{marginTop:12}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
              <div style={{display:'flex',alignItems:'center',gap:7}}><span style={{fontSize:13}}>📄</span><span style={cf(13,700,C_GRAY900)}>Slides</span><span style={{...cf(11,600,accent),background:`${accent}15`,borderRadius:99,padding:'2px 7px'}}>{mod.slides.length}</span></div>
              <button style={cBtnGhost(accent,`${accent}44`)} onClick={()=>onChange({...mod,slides:[...mod.slides,{content:''}]})}>+ Add Slide</button>
            </div>
            {mod.slides.map((sl,si)=>(
              <div key={si} style={{display:'flex',gap:8,marginBottom:8,alignItems:'flex-start'}}>
                <div style={{width:22,height:22,borderRadius:6,background:`${accent}15`,color:accent,display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:700,flexShrink:0,marginTop:10}}>S{si+1}</div>
                <textarea style={{...cInput,minHeight:66,resize:'vertical' as const,flex:1,fontSize:13}} placeholder={`Slide ${si+1} content…`} value={sl.content} onChange={e=>onChange({...mod,slides:mod.slides.map((s,j)=>j===si?{content:e.target.value}:s)})} />
                {mod.slides.length>1&&<button onClick={()=>onChange({...mod,slides:mod.slides.filter((_,j)=>j!==si)})} style={{background:'transparent',border:'none',cursor:'pointer',color:'#EF4444',fontSize:18,marginTop:8,flexShrink:0}}>×</button>}
              </div>
            ))}
          </div>

          {/* Quiz */}
          <div style={{borderTop:`1.5px solid ${C_GRAY100}`,marginTop:14,paddingTop:14}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
              <div style={{display:'flex',alignItems:'center',gap:7}}><span style={{fontSize:13}}>🧩</span><span style={cf(13,700,C_GRAY900)}>Quiz</span>{mod.quiz&&<span style={{...cf(11,600,C_PURPLE),background:'rgba(139,92,246,0.1)',borderRadius:99,padding:'2px 7px'}}>{mod.quiz.questions.length} Q</span>}</div>
              {mod.quiz
                ?<button style={cBtnGhost('#EF4444','rgba(239,68,68,0.3)')} onClick={()=>onChange({...mod,quiz:undefined})}>Remove</button>
                :<button style={cBtnGhost(C_PURPLE,'rgba(139,92,246,0.3)')} onClick={()=>onChange({...mod,quiz:{passingScore:70,questions:[{question:'',options:['','','',''],correctIndex:0,explanation:''}]}})}>+ Add Quiz</button>}
            </div>

            {mod.quiz&&(
              <div style={{background:C_GRAY50,borderRadius:12,padding:12,border:`1px solid ${C_GRAY200}`}}>
                <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:14,padding:'9px 12px',background:C_WHITE,borderRadius:10,border:`1px solid ${C_GRAY200}`}}>
                  <span style={cf(13,500,C_GRAY600)}>Passing score</span>
                  <input type="number" min={0} max={100} style={{...cInput,width:66,textAlign:'center',padding:'6px 10px'}} value={mod.quiz.passingScore} onChange={e=>onChange({...mod,quiz:{...mod.quiz!,passingScore:Number(e.target.value)}})} />
                  <span style={cf(13,400,C_GRAY400)}>%</span>
                  <span style={{...cf(11,500,C_GRAY400),marginLeft:'auto'}}>Recommended: 70%</span>
                </div>

                {mod.quiz.questions.map((q,qi)=>(
                  <div key={qi} style={{background:C_WHITE,borderRadius:12,padding:14,marginBottom:10,border:`1px solid ${C_GRAY200}`,boxShadow:C_SH_SM}}>
                    <div style={{display:'flex',gap:8,marginBottom:10}}>
                      <div style={{width:26,height:26,borderRadius:7,background:`linear-gradient(135deg,${C_PURPLE},#6366F1)`,color:C_WHITE,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700,flexShrink:0}}>Q{qi+1}</div>
                      <input style={{...cInput,flex:1,fontWeight:500}} placeholder="Question text…" value={q.question} onChange={e=>updQ(qi,{question:e.target.value})} />
                      <button onClick={()=>onChange({...mod,quiz:{...mod.quiz!,questions:mod.quiz!.questions.filter((_,j)=>j!==qi)}})} style={{background:'rgba(239,68,68,0.08)',border:'none',cursor:'pointer',width:28,height:28,borderRadius:7,color:'#EF4444',fontSize:15,flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center'}}>×</button>
                    </div>
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:7,marginBottom:8}}>
                      {q.options.map((opt,oi)=>(
                        <label key={oi} style={{display:'flex',alignItems:'center',gap:7,padding:'7px 10px',borderRadius:9,border:`1.5px solid ${q.correctIndex===oi?C_GREEN_EM:C_GRAY200}`,background:q.correctIndex===oi?'rgba(16,185,129,0.06)':C_WHITE,cursor:'pointer'}}>
                          <input type="radio" name={`cq-${mi}-${qi}`} checked={q.correctIndex===oi} onChange={()=>updQ(qi,{correctIndex:oi})} style={{accentColor:C_GREEN_EM,flexShrink:0}} />
                          <span style={{...cf(10,700,q.correctIndex===oi?C_GREEN_EM:C_GRAY400),minWidth:13}}>{String.fromCharCode(65+oi)}</span>
                          <input style={{border:'none',background:'transparent',outline:'none',fontFamily:C_FF,fontSize:13,flex:1,minWidth:0}} placeholder={`Option ${String.fromCharCode(65+oi)}`} value={opt} onChange={e=>updQ(qi,{options:q.options.map((o,k)=>k===oi?e.target.value:o)})} />
                          {q.correctIndex===oi&&<span style={{fontSize:12,color:C_GREEN_EM,flexShrink:0}}>✓</span>}
                        </label>
                      ))}
                    </div>
                    <input style={{...cInput,fontSize:12,background:C_GRAY50}} placeholder="💬 Explanation (optional)" value={q.explanation??''} onChange={e=>updQ(qi,{explanation:e.target.value})} />
                  </div>
                ))}
                <button style={{...cBtnGhost(C_PURPLE,'rgba(139,92,246,0.3)'),marginTop:6}} onClick={()=>onChange({...mod,quiz:{...mod.quiz!,questions:[...mod.quiz!.questions,{question:'',options:['','','',''],correctIndex:0,explanation:''}]}})}>+ Add Question</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Admin Course Card ─────────────────────────────────────────────────────────
function AdminCourseCard({ course, idx, onEdit, onDelete, onPublish, onEnroll, onEnrollGroup, onAssignTrainer }: {
  course: CourseRecord; idx: number
  onEdit:()=>void; onDelete:()=>void; onPublish:()=>void
  onEnroll:()=>void; onEnrollGroup:()=>void; onAssignTrainer:()=>void
}) {
  const [hover,setHover]=useState(false)
  const gradients=['linear-gradient(135deg,#6366F1,#8B5CF6)','linear-gradient(135deg,#10B981,#059669)','linear-gradient(135deg,#F59E0B,#D97706)','linear-gradient(135deg,#06B6D4,#0284C7)','linear-gradient(135deg,#EF4444,#DC2626)','linear-gradient(135deg,#8B5CF6,#7C3AED)']
  const grad=gradients[idx%gradients.length]
  const quizCount=course.courseModules?.filter(m=>m.quiz&&m.quiz.questions.length>0).length??0

  return (
    <div onMouseEnter={()=>setHover(true)} onMouseLeave={()=>setHover(false)}
      style={{background:C_WHITE,borderRadius:18,boxShadow:hover?C_SH_MD:C_SH_SM,overflow:'hidden',transition:'box-shadow 0.2s, transform 0.2s',transform:hover?'translateY(-2px)':'none',border:`1px solid ${C_GRAY100}`}}>
      {/* Gradient header */}
      <div style={{height:90,background:grad,display:'flex',alignItems:'center',justifyContent:'center',position:'relative'}}>
        <div style={{fontSize:38}}>{course.thumbnailEmoji||'📚'}</div>
        <div style={{position:'absolute',top:10,right:10}}>
          {course.status==='PUBLISHED'
            ?<CChip label="Published" color="#fff" bg="rgba(255,255,255,0.25)" dot="#fff" />
            :course.status==='ARCHIVED'
            ?<CChip label="Archived" color="#fff" bg="rgba(255,255,255,0.2)" />
            :<CChip label="Draft" color="#fff" bg="rgba(255,255,255,0.2)" dot="#FCD34D" />}
        </div>
      </div>

      {/* Body */}
      <div style={{padding:'14px 16px 16px'}}>
        <div style={cf(14,700,C_GRAY900,{marginBottom:4})}>{course.title}</div>
        {course.description&&<div style={{...cf(12,400,C_GRAY400),marginBottom:8,overflow:'hidden',textOverflow:'ellipsis',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical' as const}}>{course.description}</div>}

        <div style={{display:'flex',flexWrap:'wrap' as const,gap:6,marginBottom:12}}>
          {course.category&&<CChip label={course.category} color="#6366F1" bg={C_INDIGO_LIGHT} />}
          {(course.courseModules?.length??0)>0&&<CChip label={`📦 ${course.courseModules!.length} modules`} color={C_GRAY600} bg={C_GRAY100} />}
          {quizCount>0&&<CChip label={`🧩 ${quizCount} quiz${quizCount>1?'zes':''}`} color={C_PURPLE} bg="rgba(139,92,246,0.1)" />}
          {(course.enrolledUsers?.length??0)>0&&<CChip label={`👥 ${course.enrolledUsers!.length}`} color={C_GREEN_EM} bg="rgba(16,185,129,0.1)" />}
          {(course.assignedTrainers?.length??0)>0&&<CChip label={`🎓 ${course.assignedTrainers!.length} trainer${course.assignedTrainers!.length>1?'s':''}`} color={C_TEAL} bg="rgba(6,182,212,0.1)" />}
        </div>

        {/* Action buttons */}
        <div style={{display:'flex',flexWrap:'wrap' as const,gap:5}}>
          {course.status!=='PUBLISHED'&&<button onClick={onPublish} style={{...cBtnGhost(C_GREEN_EM,'rgba(16,185,129,0.3)'),fontSize:11,padding:'4px 9px'}}>✅ Publish</button>}
          <button onClick={onEnroll} style={{...cBtnGhost('#6366F1','rgba(99,102,241,0.3)'),fontSize:11,padding:'4px 9px'}}>👤 Enroll</button>
          <button onClick={onEnrollGroup} style={{...cBtnGhost(C_TEAL,'rgba(6,182,212,0.3)'),fontSize:11,padding:'4px 9px'}}>👥 Group</button>
          <button onClick={onAssignTrainer} style={{...cBtnGhost(C_PURPLE,'rgba(139,92,246,0.3)'),fontSize:11,padding:'4px 9px'}}>🎓 Trainers</button>
          <button onClick={onEdit} style={{...cBtnGhost(C_GRAY600,C_GRAY200),fontSize:11,padding:'4px 9px'}}>✏️ Edit</button>
          <button onClick={onDelete} style={{...cBtnGhost('#EF4444','rgba(239,68,68,0.3)'),fontSize:11,padding:'4px 9px'}}>🗑️</button>
        </div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// COURSES PAGE
// ══════════════════════════════════════════════════════════════════════════════
interface CourseSlide { content: string }
interface QuizQuestion { question: string; options: string[]; correctIndex: number; explanation?: string }
interface CourseQuiz { passingScore: number; questions: QuizQuestion[] }
interface CourseModule { name: string; slides: CourseSlide[]; quiz?: CourseQuiz }
interface CourseRecord {
  _id: string; title: string; description?: string; category?: string;
  modules?: number; duration?: string; status: string; thumbnailEmoji?: string;
  enrolledUsers?: string[]; createdAt?: string;
  courseModules?: CourseModule[];
  assignedTrainers?: string[];
}

const emptyQuestion = (): QuizQuestion => ({ question: '', options: ['', '', '', ''], correctIndex: 0, explanation: '' })

const COURSE_EMOJIS = ['📘','📊','🔬','💼','🧪','🎯','🧠','💻','🌐','📐']
const COURSE_GRADIENTS = [
  'linear-gradient(135deg,#1E1B39,#615E83)',
  'linear-gradient(135deg,#5FC966,#2a8c30)',
  'linear-gradient(135deg,#F5A623,#e67e22)',
  'linear-gradient(135deg,#4A90E2,#2258a5)',
  'linear-gradient(135deg,#6C63FF,#4a4ab5)',
  'linear-gradient(135deg,#F05C5C,#c0392b)',
]

function CoursesPage({ token }: { token: string }) {
  const [courses, setCourses]           = useState<CourseRecord[]>([])
  const [total, setTotal]               = useState(0)
  const [page, setPage]                 = useState(1)
  const [loading, setLoading]           = useState(true)
  const [showCreate, setShowCreate]     = useState(false)
  const [editorStep, setEditorStep]     = useState(1)
  const [editCourse, setEditCourse]     = useState<CourseRecord | null>(null)
  const [deleteCourse, setDeleteCourse] = useState<CourseRecord | null>(null)
  const [deleting, setDeleting]         = useState(false)
  const [saving, setSaving]             = useState(false)
  const [error, setError]               = useState('')
  const [enrollModal, setEnrollModal]   = useState<CourseRecord | null>(null)
  const [enrollSearch, setEnrollSearch] = useState('')
  const [enrollUsers, setEnrollUsers]   = useState<UserRecord[]>([])
  const [selectedEnrollIds, setSelectedEnrollIds] = useState<string[]>([])
  const [enrolling, setEnrolling]       = useState(false)
  const [enrollGroupModal, setEnrollGroupModal] = useState<CourseRecord | null>(null)
  const [enrollGroups, setEnrollGroups] = useState<{ _id: string; name: string; members: any[] }[]>([])
  const [selectedGroupId, setSelectedGroupId] = useState<string>('')
  const [enrollingGroup, setEnrollingGroup] = useState(false)
  const [assignTrainerModal, setAssignTrainerModal] = useState<CourseRecord | null>(null)
  const [allTrainers, setAllTrainers]   = useState<{ _id: string; firstName: string; lastName: string; email: string }[]>([])
  const [selectedTrainerIds, setSelectedTrainerIds] = useState<string[]>([])
  const [trainerSearch, setTrainerSearch] = useState('')
  const [assigning, setAssigning]       = useState(false)

  const LIMIT = 12
  const ALL_EMOJIS = ['📘','📊','🔬','💼','🧪','🎯','🧠','💻','🌐','📐','🛡️','🚀','🎨','🔐','⚡','🎓','🧩','🗂️']

  const [form, setForm] = useState({ title:'', description:'', category:'', duration:'', status:'DRAFT', thumbnailEmoji:'📘' })
  const [courseModules, setCourseModules] = useState<CourseModule[]>([])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).__adminForms = (window as any).__adminForms ?? {}
      ;(window as any).__adminForms.setCourseForm = setForm
    }
  }, [setForm])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(LIMIT) })
      const res = await apiFetch(`${apiBase()}/courses?${params}`, token)
      const body = await res.json()
      setCourses(Array.isArray(body?.data) ? body.data : (body?.data?.items ?? []))
      setTotal(body?.pagination?.total ?? body?.data?.total ?? 0)
    } catch { setError('Failed to load courses') } finally { setLoading(false) }
  }, [token, page])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    if (!enrollModal) return
    apiFetch(`${apiBase()}/users?limit=100${enrollSearch ? `&search=${encodeURIComponent(enrollSearch)}` : ''}`, token)
      .then(r => r.json()).then(b => setEnrollUsers(Array.isArray(b?.data) ? b.data : (b?.data?.items ?? []))).catch(() => {})
  }, [enrollModal, enrollSearch, token])

  useEffect(() => {
    if (!enrollGroupModal) return
    setSelectedGroupId('')
    apiFetch(`${apiBase()}/groups`, token).then(r => r.json()).then(b => setEnrollGroups(Array.isArray(b?.data) ? b.data : [])).catch(() => {})
  }, [enrollGroupModal, token])

  useEffect(() => {
    if (!assignTrainerModal) return
    setSelectedTrainerIds((assignTrainerModal.assignedTrainers ?? []).slice())
    setTrainerSearch('')
    apiFetch(`${apiBase()}/users?limit=200&role=TRAINER`, token).then(r => r.json()).then(b => setAllTrainers(Array.isArray(b?.data) ? b.data : (b?.data?.items ?? []))).catch(() => {})
  }, [assignTrainerModal, token])

  const handleAssignTrainers = async () => {
    if (!assignTrainerModal || selectedTrainerIds.length === 0) return
    setAssigning(true)
    try {
      const res = await apiFetch(`${apiBase()}/courses/${assignTrainerModal._id}/assign-trainers`, token, { method: 'POST', body: JSON.stringify({ trainerIds: selectedTrainerIds }) })
      if (!res.ok) { const b = await res.json().catch(() => ({})); throw new Error(b?.message ?? 'Assign failed') }
      setAssignTrainerModal(null); load()
    } catch (e: unknown) { setError(e instanceof Error ? e.message : 'Assign failed') }
    finally { setAssigning(false) }
  }

  const handleRevokeTrainer = async (courseId: string, trainerId: string) => {
    try {
      await apiFetch(`${apiBase()}/courses/${courseId}/assign-trainers/${trainerId}`, token, { method: 'DELETE' })
      setAssignTrainerModal(prev => prev ? { ...prev, assignedTrainers: (prev.assignedTrainers ?? []).filter(id => id !== trainerId) } : null)
      setSelectedTrainerIds(prev => prev.filter(id => id !== trainerId))
      load()
    } catch { setError('Failed to revoke trainer') }
  }

  const openCreate = () => {
    setForm({ title:'', description:'', category:'', duration:'', status:'DRAFT', thumbnailEmoji:'📘' })
    setCourseModules([]); setEditorStep(1); setShowCreate(true)
  }
  const openEdit = (c: CourseRecord) => {
    setForm({ title:c.title, description:c.description??'', category:c.category??'', duration:c.duration??'', status:c.status, thumbnailEmoji:c.thumbnailEmoji??'📘' })
    setCourseModules(c.courseModules ? c.courseModules.map(m => ({ name:m.name, slides:m.slides.map(s=>({content:s.content})), quiz:m.quiz?{passingScore:m.quiz.passingScore??70,questions:m.quiz.questions.map(q=>({...q,options:[...q.options],explanation:q.explanation??''}))}:undefined })) : [])
    setEditCourse(c); setEditorStep(1)
  }

  const handleBulkParsed = (r: CParsedExcel) => {
    if (r.courseInfo.title) setForm(p=>({...p,title:r.courseInfo.title||p.title,description:r.courseInfo.description||p.description,category:r.courseInfo.category||p.category,thumbnailEmoji:r.courseInfo.emoji||p.thumbnailEmoji,status:r.courseInfo.status||p.status}))
    if (r.modules.length>0) setCourseModules(r.modules)
  }

  const handleSave = async () => {
    setSaving(true); setError('')
    try {
      const body: Record<string, any> = { title:form.title, status:form.status, thumbnailEmoji:form.thumbnailEmoji, courseModules }
      if (form.description) body.description = form.description
      if (form.category)    body.category    = form.category
      if (form.duration)    body.duration    = form.duration
      const url    = editCourse ? `${apiBase()}/courses/${editCourse._id}` : `${apiBase()}/courses`
      const method = editCourse ? 'PATCH' : 'POST'
      const res    = await apiFetch(url, token, { method, body: JSON.stringify(body) })
      if (!res.ok) { const b = await res.json().catch(() => ({})); throw new Error(b?.message ?? 'Save failed') }
      setShowCreate(false); setEditCourse(null); load()
    } catch (e: unknown) { setError(e instanceof Error ? e.message : 'Save failed') }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!deleteCourse) return; setDeleting(true)
    try { await apiFetch(`${apiBase()}/courses/${deleteCourse._id}`, token, { method:'DELETE' }); setDeleteCourse(null); load() }
    catch { setError('Delete failed') } finally { setDeleting(false) }
  }

  const handlePublish = async (c: CourseRecord) => {
    try { await apiFetch(`${apiBase()}/courses/${c._id}`, token, { method:'PATCH', body:JSON.stringify({status:'PUBLISHED'}) }); load() }
    catch { setError('Failed to update status') }
  }

  const handleEnroll = async () => {
    if (!enrollModal || selectedEnrollIds.length === 0) return; setEnrolling(true)
    try { await apiFetch(`${apiBase()}/courses/${enrollModal._id}/enroll`, token, { method:'POST', body:JSON.stringify({userIds:selectedEnrollIds}) }); setEnrollModal(null); setSelectedEnrollIds([]); load() }
    catch { setError('Enroll failed') } finally { setEnrolling(false) }
  }

  const handleEnrollGroup = async () => {
    if (!enrollGroupModal || !selectedGroupId) return; setEnrollingGroup(true)
    try {
      const res = await apiFetch(`${apiBase()}/courses/${enrollGroupModal._id}/enroll-group`, token, { method:'POST', body:JSON.stringify({groupId:selectedGroupId}) })
      const body = await res.json()
      if (!res.ok) throw new Error(body?.message ?? 'Group enroll failed')
      setEnrollGroupModal(null); setSelectedGroupId(''); load()
    } catch (e: unknown) { setError(e instanceof Error ? e.message : 'Group enroll failed') }
    finally { setEnrollingGroup(false) }
  }

  // Stats
  const totalEnrolled = courses.reduce((s,c)=>s+(c.enrolledUsers?.length??0),0)
  const totalQuizzes  = courses.reduce((s,c)=>s+(c.courseModules?.filter(m=>m.quiz&&m.quiz.questions.length>0).length??0),0)
  const stepOk = editorStep === 1 ? !!form.title.trim() : true

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
      <style>{`
        @keyframes adminFadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        .admin-course-modal input:focus,.admin-course-modal textarea:focus,.admin-course-modal select:focus{border-color:#6366F1!important;box-shadow:0 0 0 3px rgba(99,102,241,0.12)!important;outline:none}
      `}</style>

      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', animation:'adminFadeIn 0.4s ease' }}>
        <div style={{ display:'flex', alignItems:'center', gap:14 }}>
          <div style={{ width:46,height:46,borderRadius:14,background:'linear-gradient(135deg,#6366F1,#8B5CF6)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,boxShadow:C_SH_INDIGO }}>🎓</div>
          <div>
            <div style={cf(22,800,C_GRAY900,{letterSpacing:'-0.3px'})}>Course Management</div>
            <div style={cf(13,400,C_GRAY400,{marginTop:2})}>Create, publish and organise all learning courses</div>
          </div>
        </div>
        <button style={cBtnPrimary} onClick={openCreate}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 2v10M2 7h10" stroke="#fff" strokeWidth="2.2" strokeLinecap="round"/></svg>
          New Course
        </button>
      </div>

      {/* Stat cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, animation:'adminFadeIn 0.5s ease' }}>
        <CStatCard icon="📚" label="Total Courses"   value={courses.length} gradient="linear-gradient(135deg,#EEF2FF,#C7D2FE)" />
        <CStatCard icon="✅" label="Published"       value={courses.filter(c=>c.status==='PUBLISHED').length} gradient="linear-gradient(135deg,#ECFDF5,#A7F3D0)" />
        <CStatCard icon="👥" label="Total Enrolled"  value={totalEnrolled} gradient="linear-gradient(135deg,#EFF6FF,#BFDBFE)" />
        <CStatCard icon="🧩" label="Quizzes Active"  value={totalQuizzes} gradient="linear-gradient(135deg,#F5F3FF,#DDD6FE)" />
      </div>

      {error && <div style={{ background:'rgba(239,68,68,0.07)',border:'1.5px solid rgba(239,68,68,0.25)',borderRadius:12,padding:'11px 16px',...cf(13,500,'#EF4444') }}>⚠ {error}</div>}

      {/* Course grid */}
      {loading ? <Spinner /> : (
        <>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:18, animation:'adminFadeIn 0.6s ease' }}>
            {courses.map((c,i) => (
              <AdminCourseCard key={c._id} course={c} idx={i}
                onEdit={()=>openEdit(c)} onDelete={()=>setDeleteCourse(c)} onPublish={()=>handlePublish(c)}
                onEnroll={()=>setEnrollModal(c)} onEnrollGroup={()=>setEnrollGroupModal(c)} onAssignTrainer={()=>setAssignTrainerModal(c)} />
            ))}

            {/* Create card */}
            <div onClick={openCreate}
              style={{ borderRadius:18,border:`2px dashed ${C_GRAY200}`,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',minHeight:220,cursor:'pointer',transition:'all 0.2s',background:C_GRAY50 }}
              onMouseEnter={e=>{(e.currentTarget as HTMLDivElement).style.borderColor='#6366F1';(e.currentTarget as HTMLDivElement).style.background=C_INDIGO_LIGHT}}
              onMouseLeave={e=>{(e.currentTarget as HTMLDivElement).style.borderColor=C_GRAY200;(e.currentTarget as HTMLDivElement).style.background=C_GRAY50}}>
              <div style={{ width:52,height:52,borderRadius:16,background:'linear-gradient(135deg,#6366F1,#8B5CF6)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,marginBottom:12,boxShadow:C_SH_INDIGO }}>+</div>
              <div style={cf(14,700,C_GRAY900)}>Create New Course</div>
              <div style={cf(12,400,C_GRAY400,{marginTop:4})}>Add a course with modules & quizzes</div>
            </div>
          </div>
          <Pagination page={page} total={total} limit={LIMIT} onPage={setPage} />
        </>
      )}

      {/* ── Create / Edit Modal ── */}
      {(showCreate || editCourse) && (
        <div className="admin-course-modal" style={{ position:'fixed',inset:0,background:'rgba(17,24,39,0.55)',backdropFilter:'blur(4px)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:20 }}>
          <div style={{ background:C_WHITE,borderRadius:24,boxShadow:C_SH_LG,width:'100%',maxWidth:820,maxHeight:'92vh',overflowY:'auto',display:'flex',flexDirection:'column' }}>
            {/* Header */}
            <div style={{ padding:'24px 28px 0',position:'sticky',top:0,background:C_WHITE,zIndex:1,borderRadius:'24px 24px 0 0' }}>
              <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:20 }}>
                <div>
                  <div style={cf(19,700,C_GRAY900)}>{editCourse?'✏️ Edit Course':'✨ Create New Course'}</div>
                  <div style={cf(13,400,C_GRAY400,{marginTop:3})}>{editCourse?editCourse.title:'Fill in the details and build your module content'}</div>
                </div>
                <button onClick={()=>{setShowCreate(false);setEditCourse(null);setError('')}} style={{ background:C_GRAY100,border:'none',cursor:'pointer',width:32,height:32,borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',color:C_GRAY400,fontSize:16,flexShrink:0 }}>✕</button>
              </div>
              <CStepper step={editorStep} />
            </div>

            <div style={{ padding:'4px 28px 28px',flex:1 }}>
              {/* Step 1 — Info */}
              {editorStep===1 && (
                <div style={{ display:'flex',flexDirection:'column',gap:16,animation:'adminFadeIn 0.3s ease' }}>
                  <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:14 }}>
                    <div>
                      <label style={cf(13,600,C_GRAY600,{display:'block',marginBottom:5})}>Course Title *</label>
                      <input style={cInput} value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} placeholder="e.g. Workplace Safety Fundamentals" autoFocus />
                    </div>
                    <div>
                      <label style={cf(13,600,C_GRAY600,{display:'block',marginBottom:5})}>Category</label>
                      <input style={cInput} value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))} placeholder="e.g. Health & Safety, IT…" />
                    </div>
                  </div>
                  <div>
                    <label style={cf(13,600,C_GRAY600,{display:'block',marginBottom:5})}>Description</label>
                    <textarea style={{...cInput,minHeight:84,resize:'vertical' as const}} value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} placeholder="Brief overview of what learners will gain…" />
                  </div>
                  <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:14 }}>
                    <div>
                      <label style={cf(13,600,C_GRAY600,{display:'block',marginBottom:5})}>Duration (optional)</label>
                      <input style={cInput} value={form.duration} onChange={e=>setForm(f=>({...f,duration:e.target.value}))} placeholder="e.g. 4.5h" />
                    </div>
                    <div>
                      <label style={cf(13,600,C_GRAY600,{display:'block',marginBottom:5})}>Status</label>
                      <select style={{...cInput,cursor:'pointer',color:C_GRAY900}} value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))}>
                        <option value="DRAFT">🔒 Draft — hidden from learners</option>
                        <option value="PUBLISHED">✅ Published — visible to learners</option>
                        <option value="ARCHIVED">📦 Archived</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label style={cf(13,600,C_GRAY600,{display:'block',marginBottom:8})}>Course Icon</label>
                    <div style={{ display:'flex',flexWrap:'wrap' as const,gap:6 }}>
                      {ALL_EMOJIS.map(em=>(
                        <button key={em} onClick={()=>setForm(f=>({...f,thumbnailEmoji:em}))}
                          style={{ width:40,height:40,borderRadius:10,border:`2px solid ${form.thumbnailEmoji===em?'#6366F1':C_GRAY200}`,background:form.thumbnailEmoji===em?C_INDIGO_LIGHT:C_WHITE,fontSize:20,cursor:'pointer',transition:'all 0.15s',boxShadow:form.thumbnailEmoji===em?C_SH_INDIGO:C_SH_SM }}>
                          {em}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2 — Modules */}
              {editorStep===2 && (
                <div style={{ animation:'adminFadeIn 0.3s ease' }}>
                  <CUploadZone onParsed={handleBulkParsed} />
                  <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14 }}>
                    <div style={cf(14,700,C_GRAY900)}>Modules <span style={cf(12,500,C_GRAY400,{marginLeft:4})}>{`(${courseModules.length})`}</span></div>
                    <button style={cBtnPrimary} onClick={()=>setCourseModules(ms=>[...ms,{name:`Module ${ms.length+1}`,slides:[{content:''}]}])}>+ Add Module</button>
                  </div>
                  {courseModules.map((mod,mi)=>(
                    <CModuleCard key={mi} mod={mod} mi={mi} total={courseModules.length}
                      onChange={u=>setCourseModules(ms=>ms.map((m,i)=>i===mi?u:m))}
                      onRemove={()=>setCourseModules(ms=>ms.filter((_,i)=>i!==mi))} />
                  ))}
                  {courseModules.length===0 && (
                    <div style={{ textAlign:'center',padding:'32px 0',background:C_GRAY50,borderRadius:14,border:`2px dashed ${C_GRAY200}` }}>
                      <div style={{ fontSize:32,marginBottom:10 }}>📦</div>
                      <div style={cf(14,600,C_GRAY900)}>No modules yet</div>
                      <div style={cf(12,400,C_GRAY400,{marginTop:4})}>Upload from Excel above or add a module manually</div>
                    </div>
                  )}
                </div>
              )}

              {/* Step 3 — Review */}
              {editorStep===3 && (
                <div style={{ animation:'adminFadeIn 0.3s ease' }}>
                  <div style={{ background:`linear-gradient(135deg,${C_INDIGO_LIGHT},rgba(139,92,246,0.08))`,border:'1px solid rgba(99,102,241,0.2)',borderRadius:14,padding:18,marginBottom:20 }}>
                    <div style={cf(14,700,C_GRAY900,{marginBottom:10})}>✅ Course Summary</div>
                    <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10 }}>
                      {[['Title',form.title||'—'],['Modules',`${courseModules.length}`],['Quiz Qs',`${courseModules.reduce((s,m)=>s+(m.quiz?.questions.length??0),0)} total`]].map(([l,v])=>(
                        <div key={l} style={{ background:C_WHITE,borderRadius:10,padding:'10px 14px',border:`1px solid ${C_GRAY200}` }}>
                          <div style={cf(11,600,C_GRAY400)}>{l}</div>
                          <div style={cf(13,700,C_GRAY900)}>{v}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  {courseModules.map((mod,mi)=>(
                    <CModuleCard key={mi} mod={mod} mi={mi} total={courseModules.length}
                      onChange={u=>setCourseModules(ms=>ms.map((m,i)=>i===mi?u:m))}
                      onRemove={()=>setCourseModules(ms=>ms.filter((_,i)=>i!==mi))} />
                  ))}
                </div>
              )}

              {error && <div style={{ ...cf(13,500,'#EF4444'),background:'rgba(239,68,68,0.06)',borderRadius:10,padding:'10px 14px',marginTop:12 }}>⚠ {error}</div>}

              {/* Footer */}
              <div style={{ display:'flex',justifyContent:'space-between',marginTop:24,paddingTop:20,borderTop:`1px solid ${C_GRAY100}` }}>
                <div>{editorStep>1&&<button style={cBtnSecondary} onClick={()=>setEditorStep(s=>s-1)}>← Back</button>}</div>
                <div style={{ display:'flex',gap:10 }}>
                  <button style={cBtnSecondary} onClick={()=>{setShowCreate(false);setEditCourse(null);setError('')}}>Cancel</button>
                  {editorStep<3
                    ?<button style={{...cBtnPrimary,opacity:stepOk?1:0.5}} disabled={!stepOk} onClick={()=>setEditorStep(s=>s+1)}>Continue →</button>
                    :<button style={cBtnPrimary} onClick={handleSave} disabled={saving}>{saving?'⏳ Saving…':editCourse?'💾 Save Changes':'🚀 Create Course'}</button>}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Enroll Modal ── */}
      {enrollModal && (
        <Modal title="👤 Enroll Users" onClose={()=>setEnrollModal(null)}>
          <div style={cf(13,500,C_GRAY600,{marginBottom:14})}>{enrollModal.title}</div>
          <div style={{ marginBottom:12,display:'flex',alignItems:'center',gap:8,background:C_GRAY50,border:`1.5px solid ${C_GRAY200}`,borderRadius:10,padding:'9px 14px' }}>
            {icons.search}
            <input type="text" placeholder="Search users…" value={enrollSearch} onChange={e=>setEnrollSearch(e.target.value)}
              style={{ border:'none',background:'transparent',outline:'none',fontFamily:C_FF,fontSize:13,width:'100%' }} />
          </div>
          <div style={{ maxHeight:300,overflowY:'auto',display:'flex',flexDirection:'column',gap:6,marginBottom:16 }}>
            {enrollUsers.map(u=>{
              const isSel=selectedEnrollIds.includes(u._id)
              const initials=`${u.firstName?.[0]??''}${u.lastName?.[0]??''}`.toUpperCase()
              return (
                <label key={u._id} onClick={()=>setSelectedEnrollIds(p=>isSel?p.filter(x=>x!==u._id):[...p,u._id])}
                  style={{ display:'flex',alignItems:'center',gap:12,padding:'10px 12px',borderRadius:12,cursor:'pointer',background:isSel?C_INDIGO_LIGHT:C_WHITE,border:`1.5px solid ${isSel?'#6366F1':C_GRAY200}`,transition:'all 0.15s' }}>
                  <div style={{ width:20,height:20,borderRadius:6,border:`2px solid ${isSel?'#6366F1':C_GRAY200}`,background:isSel?'#6366F1':C_WHITE,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
                    {isSel&&<span style={{ color:C_WHITE,fontSize:11,fontWeight:700 }}>✓</span>}
                  </div>
                  <Avatar initials={initials||'?'} size={30} />
                  <div style={{ flex:1 }}>
                    <div style={cf(13,600,C_GRAY900)}>{u.firstName} {u.lastName}</div>
                    <div style={cf(11,400,C_GRAY400)}>{u.email}</div>
                  </div>
                </label>
              )
            })}
          </div>
          <div style={{ display:'flex',gap:10,justifyContent:'space-between',alignItems:'center',paddingTop:12,borderTop:`1px solid ${C_GRAY100}` }}>
            <span style={cf(12,500,C_GRAY400)}>{selectedEnrollIds.length} selected</span>
            <div style={{ display:'flex',gap:8 }}>
              <button style={cBtnSecondary} onClick={()=>setEnrollModal(null)}>Cancel</button>
              <button style={{...cBtnPrimary,opacity:selectedEnrollIds.length===0||enrolling?0.5:1}} onClick={handleEnroll} disabled={enrolling||selectedEnrollIds.length===0}>
                {enrolling?'Enrolling…':`Enroll ${selectedEnrollIds.length} User${selectedEnrollIds.length!==1?'s':''}`}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Group Enroll Modal ── */}
      {enrollGroupModal && (
        <Modal title="👥 Enroll by Group" onClose={()=>setEnrollGroupModal(null)}>
          <div style={cf(13,400,C_GRAY400,{marginBottom:14})}>Select a group to enroll all its members in <strong style={{color:C_GRAY900}}>{enrollGroupModal.title}</strong>.</div>
          {enrollGroups.length===0 ? (
            <div style={{ textAlign:'center',padding:'28px 0' }}>
              <div style={{ fontSize:36,marginBottom:10 }}>👥</div>
              <div style={cf(14,600,C_GRAY900)}>No groups found</div>
              <div style={cf(13,400,C_GRAY400,{marginTop:4})}>Create a group first in Group Management.</div>
            </div>
          ) : (
            <div style={{ display:'flex',flexDirection:'column',gap:8,maxHeight:320,overflowY:'auto',marginBottom:16 }}>
              {enrollGroups.map(g=>{
                const isSel=selectedGroupId===g._id
                return (
                  <label key={g._id} onClick={()=>setSelectedGroupId(g._id)}
                    style={{ display:'flex',alignItems:'center',gap:12,padding:'12px 14px',borderRadius:12,cursor:'pointer',border:`1.5px solid ${isSel?'#6366F1':C_GRAY200}`,background:isSel?C_INDIGO_LIGHT:C_WHITE,transition:'all 0.15s' }}>
                    <input type="radio" readOnly checked={isSel} style={{ accentColor:'#6366F1',cursor:'pointer' }} />
                    <div style={{ width:38,height:38,borderRadius:12,background:'linear-gradient(135deg,#6366F1,#8B5CF6)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0 }}>👥</div>
                    <div style={{ flex:1 }}>
                      <div style={cf(14,600,C_GRAY900)}>{g.name}</div>
                      <div style={cf(12,400,C_GRAY400)}>{g.members?.length??0} member{(g.members?.length??0)!==1?'s':''}</div>
                    </div>
                    {isSel&&<CChip label="✓ Selected" color="#6366F1" bg={C_INDIGO_LIGHT} />}
                  </label>
                )
              })}
            </div>
          )}
          <div style={{ display:'flex',gap:10,justifyContent:'flex-end',paddingTop:12,borderTop:`1px solid ${C_GRAY100}` }}>
            <button style={cBtnSecondary} onClick={()=>setEnrollGroupModal(null)}>Cancel</button>
            <button style={{...cBtnPrimary,opacity:!selectedGroupId||enrollingGroup?0.5:1}} onClick={handleEnrollGroup} disabled={enrollingGroup||!selectedGroupId}>
              {enrollingGroup?'Enrolling…':selectedGroupId?`Enroll Group (${enrollGroups.find(g=>g._id===selectedGroupId)?.members?.length??0} members)`:'Select a Group'}
            </button>
          </div>
        </Modal>
      )}

      {/* ── Assign Trainers Modal ── */}
      {assignTrainerModal && (
        <Modal title="🎓 Assign Trainers" onClose={()=>setAssignTrainerModal(null)} width={560}>
          <div style={cf(13,400,C_GRAY400,{marginBottom:14})}>Give trainers access to <strong style={{color:C_GRAY900}}>{assignTrainerModal.title}</strong>. They can view, manage, and enroll learners.</div>
          <div style={{ position:'relative',marginBottom:12 }}>
            <input style={{...cInput,paddingLeft:36}} placeholder="Search trainers…" value={trainerSearch} onChange={e=>setTrainerSearch(e.target.value)} />
            <svg style={{ position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',pointerEvents:'none' }} width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="6" cy="6" r="4.5" stroke={C_GRAY400} strokeWidth="1.3"/><path d="M9.5 9.5L12 12" stroke={C_GRAY400} strokeWidth="1.3" strokeLinecap="round"/></svg>
          </div>
          {allTrainers.length===0 ? (
            <div style={{ textAlign:'center',padding:'24px 0' }}>
              <div style={{ fontSize:34,marginBottom:10 }}>🎓</div>
              <div style={cf(14,600,C_GRAY900)}>No trainers found</div>
              <div style={cf(13,400,C_GRAY400,{marginTop:4})}>Add users with the TRAINER role first.</div>
            </div>
          ) : (
            <div style={{ display:'flex',flexDirection:'column',gap:6,maxHeight:300,overflowY:'auto',marginBottom:16 }}>
              {allTrainers.filter(t=>{ const q=trainerSearch.toLowerCase(); return !q||`${t.firstName} ${t.lastName} ${t.email}`.toLowerCase().includes(q) }).map(t=>{
                const isAssigned=(assignTrainerModal.assignedTrainers??[]).includes(t._id)
                const isSel=selectedTrainerIds.includes(t._id)
                const initials=`${t.firstName?.[0]??''}${t.lastName?.[0]??''}`.toUpperCase()
                return (
                  <div key={t._id}
                    style={{ display:'flex',alignItems:'center',gap:12,padding:'10px 12px',borderRadius:12,border:`1.5px solid ${isSel?'#6366F1':C_GRAY200}`,background:isSel?C_INDIGO_LIGHT:C_WHITE,cursor:'pointer',transition:'all 0.15s' }}
                    onClick={()=>setSelectedTrainerIds(prev=>prev.includes(t._id)?prev.filter(id=>id!==t._id):[...prev,t._id])}>
                    <div style={{ width:20,height:20,borderRadius:6,border:`2px solid ${isSel?'#6366F1':C_GRAY200}`,background:isSel?'#6366F1':C_WHITE,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
                      {isSel&&<span style={{ color:C_WHITE,fontSize:11,fontWeight:700 }}>✓</span>}
                    </div>
                    <Avatar initials={initials} size={32} />
                    <div style={{ flex:1,minWidth:0 }}>
                      <div style={cf(13,600,C_GRAY900)}>{t.firstName} {t.lastName}</div>
                      <div style={{ ...cf(11,400,C_GRAY400),overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{t.email}</div>
                    </div>
                    {isAssigned&&(
                      <div style={{ display:'flex',alignItems:'center',gap:6 }}>
                        <CChip label="Has access" color="#6366F1" bg={C_INDIGO_LIGHT} />
                        <button onClick={e=>{e.stopPropagation();handleRevokeTrainer(assignTrainerModal._id,t._id)}}
                          style={{ background:'rgba(239,68,68,0.08)',border:'none',cursor:'pointer',width:24,height:24,borderRadius:6,color:'#EF4444',fontSize:14,display:'flex',alignItems:'center',justifyContent:'center' }} title="Revoke">×</button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
          <div style={{ display:'flex',gap:10,justifyContent:'flex-end',paddingTop:12,borderTop:`1px solid ${C_GRAY100}` }}>
            <button style={cBtnSecondary} onClick={()=>setAssignTrainerModal(null)}>Cancel</button>
            <button style={{...cBtnPrimary,opacity:selectedTrainerIds.length===0||assigning?0.5:1}} onClick={handleAssignTrainers} disabled={assigning||selectedTrainerIds.length===0}>
              {assigning?'Assigning…':`Assign ${selectedTrainerIds.length>0?`(${selectedTrainerIds.length}) `:''}Trainer${selectedTrainerIds.length!==1?'s':''}`}
            </button>
          </div>
        </Modal>
      )}

      {/* ── Delete Confirm ── */}
      {deleteCourse && (
        <div style={{ position:'fixed',inset:0,background:'rgba(17,24,39,0.55)',backdropFilter:'blur(4px)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center' }}>
          <div style={{ background:C_WHITE,borderRadius:20,padding:32,maxWidth:400,width:'100%',boxShadow:C_SH_LG }}>
            <div style={{ width:60,height:60,borderRadius:18,background:'rgba(239,68,68,0.1)',margin:'0 auto 16px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:28 }}>🗑️</div>
            <div style={cf(18,700,C_GRAY900,{marginBottom:8,textAlign:'center'})}>Delete this course?</div>
            <div style={cf(14,400,C_GRAY400,{marginBottom:28,textAlign:'center'})}>
              <strong style={{color:C_GRAY900}}>{deleteCourse.title}</strong> will be permanently deleted and all enrolled users will lose access.
            </div>
            <div style={{ display:'flex',gap:10,justifyContent:'center' }}>
              <button style={{...cBtnSecondary,padding:'10px 24px'}} onClick={()=>setDeleteCourse(null)}>Cancel</button>
              <button style={{...cBtnDanger,padding:'10px 24px'}} onClick={handleDelete} disabled={deleting}>{deleting?'Deleting…':'Yes, Delete'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// TASKS PAGE
// ══════════════════════════════════════════════════════════════════════════════
interface TaskRecord {
  _id: string; title: string; description?: string; status: string;
  priority: string; dueDate?: string;
  reference?: string; primaryMethod?: string; secondaryMethods?: string[];
  assignedTo?: { _id: string; firstName: string; lastName: string } | string;
  createdAt?: string
}

const METHOD_OPTIONS = [
  'Assignment', 'FS Prep', 'Gateway', 'Observation',
  'Project', 'Questions', 'SLC Observation', 'Teaching and Learning',
]

function TasksPage({ token }: { token: string }) {
  const [tasks, setTasks]           = useState<TaskRecord[]>([])
  const [total, setTotal]           = useState(0)
  const [page, setPage]             = useState(1)
  const [loading, setLoading]       = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [editTask, setEditTask]     = useState<TaskRecord | null>(null)
  const [deleteTask, setDeleteTask] = useState<TaskRecord | null>(null)
  const [deleting, setDeleting]     = useState(false)
  const [saving, setSaving]         = useState(false)
  const [error, setError]           = useState('')
  const [assignModal, setAssignModal] = useState<TaskRecord | null>(null)
  const [assignUsers, setAssignUsers] = useState<UserRecord[]>([])
  const [selectedAssignIds, setSelectedAssignIds] = useState<string[]>([])
  const [assigning, setAssigning]   = useState(false)
  const [assignSuccess, setAssignSuccess] = useState('')

  const LIMIT = 10

  const [form, setForm] = useState({
    title: '', description: '', priority: 'MEDIUM', status: 'PENDING', dueDate: '',
    reference: '', primaryMethod: 'Assignment', secondaryMethods: [] as string[],
  })

  // Expose setForm for browser-automation testing
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).__adminForms = (window as any).__adminForms ?? {}
      ;(window as any).__adminForms.setTaskForm = setForm
    }
  }, [setForm])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(LIMIT) })
      const res  = await apiFetch(`${apiBase()}/tasks?${params}`, token)
      const body = await res.json()
      setTasks(Array.isArray(body?.data) ? body.data : (body?.data?.items ?? []))
      setTotal(body?.pagination?.total ?? body?.data?.total ?? 0)
    } catch { setError('Failed to load tasks') } finally { setLoading(false) }
  }, [token, page])

  useEffect(() => { load() }, [load])

  // Load LEARNER + TRAINER users for assign modal
  useEffect(() => {
    if (!assignModal) return
    apiFetch(`${apiBase()}/users?limit=200`, token)
      .then(r => r.json())
      .then(b => {
        const all: UserRecord[] = Array.isArray(b?.data) ? b.data : (b?.data?.items ?? [])
        // Only show learners and trainers (exclude org admins / super admins)
        setAssignUsers(all.filter(u => (u as any).role === 'LEARNER' || (u as any).role === 'TRAINER'))
      })
      .catch(() => {})
  }, [assignModal, token])

  const openCreate = () => {
    setForm({ title: '', description: '', priority: 'MEDIUM', status: 'PENDING', dueDate: '',
      reference: '', primaryMethod: 'Assignment', secondaryMethods: [] })
    setShowCreate(true)
  }
  const openEdit = (t: TaskRecord) => {
    setForm({ title: t.title, description: t.description ?? '',
      priority: t.priority ?? 'MEDIUM', status: t.status ?? 'PENDING',
      dueDate: t.dueDate ? t.dueDate.slice(0, 10) : '',
      reference: t.reference ?? '', primaryMethod: t.primaryMethod ?? 'Assignment',
      secondaryMethods: t.secondaryMethods ?? [] })
    setEditTask(t)
  }

  const toggleSecondary = (method: string) => {
    setForm(f => ({
      ...f,
      secondaryMethods: f.secondaryMethods.includes(method)
        ? f.secondaryMethods.filter(m => m !== method)
        : [...f.secondaryMethods, method],
    }))
  }

  const handleSave = async () => {
    setSaving(true); setError('')
    try {
      const body: Record<string, unknown> = {
        title: form.title, priority: form.priority, status: form.status,
        primaryMethod: form.primaryMethod,
      }
      if (form.description)                  body.description      = form.description
      if (form.dueDate)                      body.dueDate          = form.dueDate
      if (form.reference.trim())             body.reference        = form.reference.trim()
      if (form.secondaryMethods.length > 0)  body.secondaryMethods = form.secondaryMethods
      const url    = editTask ? `${apiBase()}/tasks/${editTask._id}` : `${apiBase()}/tasks`
      const method = editTask ? 'PATCH' : 'POST'
      const res    = await apiFetch(url, token, { method, body: JSON.stringify(body) })
      if (!res.ok) { const b = await res.json().catch(() => ({})); throw new Error(b?.message ?? 'Save failed') }
      setShowCreate(false); setEditTask(null); load()
    } catch (e: unknown) { setError(e instanceof Error ? e.message : 'Save failed') }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!deleteTask) return
    setDeleting(true)
    try {
      await apiFetch(`${apiBase()}/tasks/${deleteTask._id}`, token, { method: 'DELETE' })
      setDeleteTask(null); load()
    } catch { setError('Delete failed') } finally { setDeleting(false) }
  }

  const handleAssign = async () => {
    if (!assignModal || selectedAssignIds.length === 0) return
    setAssigning(true)
    try {
      const res = await apiFetch(`${apiBase()}/tasks/${assignModal._id}/assign`, token, {
        method: 'POST', body: JSON.stringify({ userIds: selectedAssignIds }),
      })
      if (!res.ok) { const b = await res.json().catch(() => ({})); throw new Error(b?.message ?? 'Assign failed') }
      const count = selectedAssignIds.length
      const taskTitle = assignModal.title
      setAssignModal(null); setSelectedAssignIds([])
      setAssignSuccess(`✓ "${taskTitle}" assigned to ${count} user${count !== 1 ? 's' : ''} and they've been notified.`)
      setTimeout(() => setAssignSuccess(''), 5000)
      load()
    } catch { setError('Assign failed') } finally { setAssigning(false) }
  }

  const priorityBadge = (p: string) => {
    if ((p ?? '').toUpperCase() === 'HIGH')   return <Badge color="#c0392b" bg="rgba(240,92,92,0.12)">High</Badge>
    if ((p ?? '').toUpperCase() === 'MEDIUM') return <Badge color="#b8740a" bg="rgba(245,166,35,0.12)">Medium</Badge>
    return <Badge color="#2258a5" bg="rgba(74,144,226,0.12)">Low</Badge>
  }
  const taskStatusBadge = (s: string) => {
    if ((s ?? '').toUpperCase() === 'COMPLETED') return <Badge color="#2a8c30" bg="rgba(95,201,102,0.12)">Completed</Badge>
    if ((s ?? '').toUpperCase() === 'IN_PROGRESS') return <Badge color="#b8740a" bg="rgba(245,166,35,0.12)">In Progress</Badge>
    if ((s ?? '').toUpperCase() === 'OVERDUE') return <Badge color="#c0392b" bg="rgba(240,92,92,0.12)">Overdue</Badge>
    return <Badge color="#4a4ab5" bg="rgba(108,99,255,0.12)">Pending</Badge>
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ ...font(22, 700, NAVY) }}>Task Management</div>
          <div style={{ ...font(13, 400, MUTED), marginTop: 2 }}>Monitor and manage all tasks</div>
        </div>
        <button style={btn(true)} onClick={openCreate}>
          <span style={{ color: '#fff' }}>{icons.plus}</span> Create Task
        </button>
      </div>

      {error && (
        <div style={{ background: 'rgba(240,92,92,0.1)', border: `1px solid ${RED}`, borderRadius: 10,
          padding: '10px 14px', ...font(13, 400, RED) }}>{error}</div>
      )}
      {assignSuccess && (
        <div style={{ background: 'rgba(95,201,102,0.1)', border: `1px solid ${GREEN}`, borderRadius: 10,
          padding: '10px 14px', ...font(13, 400, '#2a8c30') }}>{assignSuccess}</div>
      )}

      <div style={card}>
        {loading ? <Spinner /> : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ borderBottom: BORDER }}>
                  {['Task', 'Priority', 'Status', 'Due Date', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '8px 12px', textAlign: 'left',
                      ...font(11, 600, MUTED), textTransform: 'uppercase',
                      letterSpacing: '0.4px', whiteSpace: 'nowrap' as const }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tasks.length === 0 && (
                  <tr><td colSpan={5} style={{ padding: 32, textAlign: 'center', ...font(14, 400, MUTED) }}>
                    No tasks found
                  </td></tr>
                )}
                {tasks.map((t, i) => (
                  <tr key={t._id} style={{ borderBottom: i < tasks.length - 1 ? BORDER : 'none' }}>
                    <td style={{ padding: '12px' }}>
                      <div style={{ ...font(14, 500, NAVY) }}>{t.title}</div>
                      {t.description && (
                        <div style={{ ...font(12, 400, MUTED), marginTop: 2,
                          maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>
                          {t.description}
                        </div>
                      )}
                      <div style={{ display: 'flex', gap: 6, marginTop: 4, flexWrap: 'wrap' as const }}>
                        {t.primaryMethod && (
                          <span style={{ background: '#e5ecf6', borderRadius: 4, padding: '1px 6px', ...font(11, 500, '#1c1c1c') }}>
                            {t.primaryMethod}
                          </span>
                        )}
                        {t.reference && (
                          <span style={{ background: 'rgba(95,201,102,0.12)', borderRadius: 4, padding: '1px 6px', ...font(11, 500, '#2a8c30') }}>
                            Ref: {t.reference}
                          </span>
                        )}
                        {(t.secondaryMethods ?? []).length > 0 && (
                          <span style={{ background: 'rgba(108,99,255,0.08)', borderRadius: 4, padding: '1px 6px', ...font(11, 400, INDIGO) }}>
                            +{(t.secondaryMethods ?? []).length} methods
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '12px' }}>{priorityBadge(t.priority)}</td>
                    <td style={{ padding: '12px' }}>{taskStatusBadge(t.status)}</td>
                    <td style={{ padding: '12px', ...font(13, 400, MUTED) }}>
                      {t.dueDate ? new Date(t.dueDate).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' }) : '—'}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button style={{ ...btn(), fontSize: 12, padding: '5px 10px', borderRadius: 8 }}
                          onClick={() => openEdit(t)}>Edit</button>
                        <button style={{ ...btn(true), fontSize: 12, padding: '5px 10px', borderRadius: 8 }}
                          onClick={() => { setAssignModal(t); setSelectedAssignIds([]) }}>Assign</button>
                        <button style={{ ...btn(), fontSize: 12, padding: '5px 10px', borderRadius: 8, color: RED }}
                          onClick={() => setDeleteTask(t)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination page={page} total={total} limit={LIMIT} onPage={setPage} />
      </div>

      {/* Create / Edit Modal */}
      {(showCreate || editTask) && (
        <Modal title={editTask ? 'Edit Task' : 'Create Task'} onClose={() => { setShowCreate(false); setEditTask(null) }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxHeight: '70vh', overflowY: 'auto', paddingRight: 4 }}>

            {/* Title */}
            <Field label="Task Title *">
              <input style={inputStyle} value={form.title} autoFocus
                placeholder="e.g. Complete Unit 01 workbook"
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            </Field>

            {/* Details of Planned Assessment */}
            <Field label="Details of Planned Assessment">
              <textarea style={{ ...inputStyle, resize: 'vertical' as const, lineHeight: '1.5' }} rows={3}
                placeholder="Describe what the learner needs to do..."
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </Field>

            {/* Section label */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ flex: 1, height: 1, background: 'rgba(28,28,28,0.08)' }} />
              <span style={{ ...font(11, 500, MUTED), textTransform: 'uppercase' as const, letterSpacing: '0.5px' }}>Assessment Fields</span>
              <div style={{ flex: 1, height: 1, background: 'rgba(28,28,28,0.08)' }} />
            </div>

            {/* Primary Method + Due Date + Reference */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 140px', gap: 12 }}>
              <Field label="Primary Method">
                <select style={inputStyle} value={form.primaryMethod}
                  onChange={e => setForm(f => ({ ...f, primaryMethod: e.target.value }))}>
                  {METHOD_OPTIONS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </Field>
              <Field label="Due Date">
                <input style={inputStyle} type="date" value={form.dueDate}
                  onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} />
              </Field>
              <Field label="Reference">
                <input style={inputStyle} value={form.reference}
                  placeholder="e.g. FSE1"
                  onChange={e => setForm(f => ({ ...f, reference: e.target.value }))} />
              </Field>
            </div>

            {/* Secondary Methods checkboxes */}
            <Field label="Secondary Methods">
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8,
                background: 'rgba(28,28,28,0.02)', border: BORDER,
                borderRadius: 10, padding: 14,
              }}>
                {METHOD_OPTIONS.map(method => {
                  const checked = form.secondaryMethods.includes(method)
                  return (
                    <button key={method} type="button" onClick={() => toggleSecondary(method)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        background: 'none', border: 'none', cursor: 'pointer',
                        padding: '4px 0', textAlign: 'left' as const,
                      }}>
                      <svg width="17" height="17" viewBox="0 0 17 17" fill="none" style={{ flexShrink: 0 }}>
                        <rect x="1" y="1" width="15" height="15" rx="4"
                          stroke={checked ? '#1c1c1c' : 'rgba(28,28,28,0.25)'}
                          strokeWidth="1.4"
                          fill={checked ? '#1c1c1c' : 'transparent'} />
                        {checked && <path d="M4 8.5l3 3 6-6" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>}
                      </svg>
                      <span style={{ ...font(13, checked ? 500 : 400), whiteSpace: 'nowrap' as const }}>{method}</span>
                    </button>
                  )
                })}
              </div>
            </Field>

            {/* Section label */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ flex: 1, height: 1, background: 'rgba(28,28,28,0.08)' }} />
              <span style={{ ...font(11, 500, MUTED), textTransform: 'uppercase' as const, letterSpacing: '0.5px' }}>Status & Priority</span>
              <div style={{ flex: 1, height: 1, background: 'rgba(28,28,28,0.08)' }} />
            </div>

            {/* Priority + Status */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="Priority">
                <select style={inputStyle} value={form.priority}
                  onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                </select>
              </Field>
              <Field label="Status">
                <select style={inputStyle} value={form.status}
                  onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                  <option value="PENDING">Pending</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </Field>
            </div>

            {error && <div style={{ ...font(13, 400, RED) }}>{error}</div>}

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 4 }}>
              <button style={btn()} onClick={() => { setShowCreate(false); setEditTask(null) }}>Cancel</button>
              <button style={btn(true)} onClick={handleSave} disabled={saving || !form.title.trim()}>
                {saving ? 'Saving…' : editTask ? 'Save Changes' : 'Create Task'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Assign Modal */}
      {assignModal && (
        <Modal title={`Assign: "${assignModal.title}"`} onClose={() => setAssignModal(null)}>
          <div style={{ marginBottom: 8, ...font(13, 400, MUTED) }}>
            Select learners or trainers to assign this task to. A copy of this task will be created for each user.
          </div>
          <div style={{ maxHeight: 300, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 16 }}>
            {assignUsers.map(u => {
              const isSel = selectedAssignIds.includes(u._id)
              const initials = `${u.firstName?.[0] ?? ''}${u.lastName?.[0] ?? ''}`.toUpperCase()
              return (
                <div key={u._id} onClick={() => setSelectedAssignIds(p => isSel ? p.filter(x => x !== u._id) : [...p, u._id])}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px',
                    borderRadius: 10, cursor: 'pointer', background: isSel ? 'rgba(28,28,28,0.05)' : 'transparent' }}>
                  <input type="checkbox" checked={isSel} readOnly style={{ cursor: 'pointer' }} />
                  <Avatar initials={initials || '?'} size={28} />
                  <div>
                    <div style={{ ...font(13, 500, NAVY) }}>{u.firstName} {u.lastName}</div>
                    <div style={{ ...font(11, 400, MUTED) }}>{u.email}</div>
                  </div>
                </div>
              )
            })}
            {assignUsers.length === 0 && (
              <div style={{ ...font(13, 400, MUTED), padding: '16px 0', textAlign: 'center' }}>No users found</div>
            )}
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button style={btn()} onClick={() => setAssignModal(null)}>Cancel</button>
            <button style={btn(true)} onClick={handleAssign} disabled={assigning || selectedAssignIds.length === 0}>
              {assigning ? 'Assigning…' : `Assign to ${selectedAssignIds.length} User${selectedAssignIds.length !== 1 ? 's' : ''}`}
            </button>
          </div>
        </Modal>
      )}

      {/* Delete Confirm */}
      {deleteTask && (
        <ConfirmDialog
          message={`Delete "${deleteTask.title}"? This cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTask(null)}
          loading={deleting}
        />
      )}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// ASSIGN TASKS PAGE
// ══════════════════════════════════════════════════════════════════════════════
function AssignPage({ token }: { token: string }) {
  const [users, setUsers]           = useState<UserRecord[]>([])
  const [tasks, setTasks]           = useState<TaskRecord[]>([])
  const [selectedTaskId, setSelectedTaskId] = useState('')
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([])
  const [userSearch, setUserSearch] = useState('')
  const [assigning, setAssigning]   = useState(false)
  const [success, setSuccess]       = useState('')
  const [error, setError]           = useState('')

  useEffect(() => {
    apiFetch(`${apiBase()}/users?limit=100`, token)
      .then(r => r.json())
      .then(b => setUsers(Array.isArray(b?.data) ? b.data : (b?.data?.items ?? [])))
      .catch(() => {})
    apiFetch(`${apiBase()}/tasks?limit=100`, token)
      .then(r => r.json())
      .then(b => setTasks(Array.isArray(b?.data) ? b.data : (b?.data?.items ?? [])))
      .catch(() => {})
  }, [token])

  const filtered = users.filter(u =>
    userSearch === '' ||
    `${u.firstName} ${u.lastName}`.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase())
  )

  const handleAssign = async () => {
    if (!selectedTaskId || selectedUserIds.length === 0) return
    setAssigning(true); setError(''); setSuccess('')
    try {
      const res = await apiFetch(`${apiBase()}/tasks/${selectedTaskId}/assign`, token, {
        method: 'POST', body: JSON.stringify({ userIds: selectedUserIds }),
      })
      if (!res.ok) { const b = await res.json().catch(() => ({})); throw new Error(b?.message ?? 'Assign failed') }
      setSuccess(`Task assigned to ${selectedUserIds.length} learner${selectedUserIds.length !== 1 ? 's' : ''} successfully!`)
      setSelectedUserIds([])
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Assign failed')
    } finally { setAssigning(false) }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <div style={{ ...font(22, 700, NAVY) }}>Assign Tasks</div>
        <div style={{ ...font(13, 400, MUTED), marginTop: 2 }}>Assign tasks to individuals or groups of learners</div>
      </div>

      {success && (
        <div style={{ background: 'rgba(95,201,102,0.1)', border: `1px solid ${GREEN}`, borderRadius: 10,
          padding: '10px 14px', ...font(13, 400, '#2a8c30') }}>{success}</div>
      )}
      {error && (
        <div style={{ background: 'rgba(240,92,92,0.1)', border: `1px solid ${RED}`, borderRadius: 10,
          padding: '10px 14px', ...font(13, 400, RED) }}>{error}</div>
      )}

      <div style={{ display: 'flex', gap: 20 }}>
        {/* Task selector */}
        <div style={{ ...card, flex: 2 }}>
          <div style={{ ...font(16, 700, NAVY), marginBottom: 20 }}>Select Task</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 400, overflowY: 'auto' }}>
            {tasks.length === 0 && <div style={{ ...font(13, 400, MUTED), padding: '16px 0' }}>No tasks available. Create one first.</div>}
            {tasks.map(t => (
              <div key={t._id} onClick={() => setSelectedTaskId(t._id)}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 12, cursor: 'pointer',
                  border: selectedTaskId === t._id ? `2px solid ${NAVY}` : `2px solid transparent`,
                  background: selectedTaskId === t._id ? 'rgba(28,28,28,0.04)' : '#fff',
                  boxShadow: '0 1px 4px rgba(13,10,44,0.06)' }}>
                <input type="radio" readOnly checked={selectedTaskId === t._id} style={{ cursor: 'pointer' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ ...font(14, 500, NAVY) }}>{t.title}</div>
                  {t.description && <div style={{ ...font(12, 400, MUTED), marginTop: 2 }}>{t.description}</div>}
                  <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                    <Badge color="#b8740a" bg="rgba(245,166,35,0.12)">{t.priority}</Badge>
                    {t.dueDate && (
                      <span style={{ ...font(11, 400, MUTED) }}>
                        Due: {new Date(t.dueDate).toLocaleDateString('en-GB', { day:'numeric', month:'short' })}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Learner picker */}
        <div style={{ ...card, flex: 1 }}>
          <div style={{ ...font(16, 700, NAVY), marginBottom: 16 }}>Assign To</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: BG,
            border: BORDER, borderRadius: 10, padding: '8px 12px', marginBottom: 12 }}>
            {icons.search}
            <input type="text" placeholder="Search learners…" value={userSearch}
              onChange={e => setUserSearch(e.target.value)}
              style={{ border: 'none', background: 'transparent', outline: 'none',
                fontFamily: FF, fontSize: 13, width: '100%' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, maxHeight: 280, overflowY: 'auto', marginBottom: 12 }}>
            {filtered.map(u => {
              const isSel = selectedUserIds.includes(u._id)
              const initials = `${u.firstName?.[0] ?? ''}${u.lastName?.[0] ?? ''}`.toUpperCase()
              return (
                <div key={u._id} onClick={() => setSelectedUserIds(p => isSel ? p.filter(x => x !== u._id) : [...p, u._id])}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px',
                    borderRadius: 10, cursor: 'pointer', background: isSel ? 'rgba(28,28,28,0.05)' : 'transparent' }}>
                  <input type="checkbox" checked={isSel} readOnly style={{ cursor: 'pointer' }} />
                  <Avatar initials={initials || '?'} size={28} />
                  <div>
                    <div style={{ ...font(13, 500, NAVY) }}>{u.firstName} {u.lastName}</div>
                    <div style={{ ...font(11, 400, MUTED) }}>{u.email}</div>
                  </div>
                </div>
              )
            })}
          </div>
          <Divider />
          <div style={{ ...font(13, 400, MUTED), marginTop: 12, marginBottom: 12 }}>
            {selectedUserIds.length} learner{selectedUserIds.length !== 1 ? 's' : ''} selected
          </div>
          <button style={{ ...btn(true), width: '100%', justifyContent: 'center', borderRadius: 12, padding: '10px' }}
            disabled={assigning || !selectedTaskId || selectedUserIds.length === 0}
            onClick={handleAssign}>
            {assigning ? 'Assigning…' : 'Assign Task →'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// GROUPS PAGE
// ══════════════════════════════════════════════════════════════════════════════
interface GroupMember { _id: string; firstName: string; lastName: string; email: string; role: string }
interface GroupRecord { _id: string; name: string; description: string; members: GroupMember[]; createdAt?: string }

function GroupsPage({ token }: { token: string }) {
  const [groups, setGroups]           = useState<GroupRecord[]>([])
  const [allUsers, setAllUsers]       = useState<UserRecord[]>([])
  const [loading, setLoading]         = useState(true)
  const [showCreate, setShowCreate]   = useState(false)
  const [editGroup, setEditGroup]     = useState<GroupRecord | null>(null)
  const [viewGroup, setViewGroup]     = useState<GroupRecord | null>(null)
  const [saving, setSaving]           = useState(false)
  const [newName, setNewName]         = useState('')
  const [newDesc, setNewDesc]         = useState('')
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set())
  const [memberSearch, setMemberSearch] = useState('')
  const [addMemberMode, setAddMemberMode] = useState(false)
  const [addSearch, setAddSearch]     = useState('')

  const load = () => {
    setLoading(true)
    apiFetch(`${apiBase()}/groups`, token)
      .then(r => r.json()).then((b: any) => setGroups(Array.isArray(b?.data) ? b.data : []))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
    apiFetch(`${apiBase()}/users?limit=200`, token)
      .then(r => r.json())
      .then((b: any) => setAllUsers(Array.isArray(b?.data) ? b.data : (b?.data?.items ?? [])))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  const openCreate = () => {
    setNewName(''); setNewDesc(''); setSelectedUserIds(new Set())
    setEditGroup(null); setShowCreate(true)
  }

  const openEdit = (g: GroupRecord) => {
    setNewName(g.name); setNewDesc(g.description)
    setSelectedUserIds(new Set(g.members.map(m => String(m._id))))
    setEditGroup(g); setShowCreate(true)
  }

  const toggleUser = (id: string) => {
    setSelectedUserIds(prev => {
      const s = new Set(prev)
      s.has(id) ? s.delete(id) : s.add(id)
      return s
    })
  }

  const saveGroup = async () => {
    if (!newName.trim()) return
    setSaving(true)
    try {
      const memberIds = Array.from(selectedUserIds)
      if (editGroup) {
        // Update name/desc
        await apiFetch(`${apiBase()}/groups/${editGroup._id}`, token, {
          method: 'PATCH', body: JSON.stringify({ name: newName, description: newDesc }),
        })
        // Sync members: add new ones, remove removed ones
        const existing = new Set(editGroup.members.map(m => String(m._id)))
        const toAdd    = memberIds.filter(id => !existing.has(id))
        const toRemove = editGroup.members.map(m => String(m._id)).filter(id => !selectedUserIds.has(id))
        if (toAdd.length)    await apiFetch(`${apiBase()}/groups/${editGroup._id}/members`, token, { method: 'POST',   body: JSON.stringify({ memberIds: toAdd }) })
        if (toRemove.length) await apiFetch(`${apiBase()}/groups/${editGroup._id}/members`, token, { method: 'DELETE', body: JSON.stringify({ memberIds: toRemove }) })
      } else {
        await apiFetch(`${apiBase()}/groups`, token, {
          method: 'POST', body: JSON.stringify({ name: newName, description: newDesc, memberIds }),
        })
      }
      setShowCreate(false); load()
    } finally { setSaving(false) }
  }

  const deleteGroup = async (id: string) => {
    if (!confirm('Delete this group?')) return
    await apiFetch(`${apiBase()}/groups/${id}`, token, { method: 'DELETE' })
    load()
  }

  const removeMemberFromView = async (groupId: string, memberId: string) => {
    await apiFetch(`${apiBase()}/groups/${groupId}/members`, token, {
      method: 'DELETE', body: JSON.stringify({ memberIds: [memberId] }),
    })
    const updated = await apiFetch(`${apiBase()}/groups/${groupId}`, token).then((r: any) => r.json())
    setViewGroup(updated?.data ?? null)
    load()
  }

  const addMembersToView = async (groupId: string, ids: string[]) => {
    await apiFetch(`${apiBase()}/groups/${groupId}/members`, token, {
      method: 'POST', body: JSON.stringify({ memberIds: ids }),
    })
    const updated = await apiFetch(`${apiBase()}/groups/${groupId}`, token).then((r: any) => r.json())
    setViewGroup(updated?.data ?? null)
    setAddMemberMode(false); setAddSearch('')
    load()
  }

  // Merge populate data with allUsers so names always resolve correctly
  const resolveUser = (m: GroupMember): GroupMember => {
    const full = allUsers.find(u => u._id === String(m._id))
    return full ? { ...m, firstName: full.firstName, lastName: full.lastName, email: full.email, role: full.role } : m
  }

  const filteredUsers = allUsers.filter(u => {
    const q = memberSearch.toLowerCase()
    return `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(q)
  })

  return (
    <div style={{ padding: '0 4px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <div style={{ ...font(22, 700, NAVY) }}>Group Management</div>
          <div style={{ ...font(13, 400, MUTED), marginTop: 2 }}>Create and manage user groups</div>
        </div>
        <button style={btn(true)} onClick={openCreate}>
          {icons.plus}&nbsp;New Group
        </button>
      </div>

      {/* Groups grid */}
      {loading ? (
        <div style={{ ...font(14, 400, MUTED), textAlign: 'center', padding: 40 }}>Loading…</div>
      ) : groups.length === 0 ? (
        <div style={{ ...card, textAlign: 'center', padding: 48 }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>👥</div>
          <div style={{ ...font(16, 600, NAVY), marginBottom: 6 }}>No groups yet</div>
          <div style={{ ...font(13, 400, MUTED), marginBottom: 16 }}>Create a group to organise users together</div>
          <button style={btn(true)} onClick={openCreate}>Create first group</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {groups.map(g => (
            <div key={g._id} style={{ ...card, cursor: 'default' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(108,99,255,0.12)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: INDIGO, flexShrink: 0 }}>
                    {icons.groups}
                  </div>
                  <div>
                    <div style={{ ...font(15, 600, NAVY) }}>{g.name}</div>
                    <div style={{ ...font(12, 400, MUTED) }}>{g.members.length} member{g.members.length !== 1 ? 's' : ''}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button style={btn()} onClick={() => openEdit(g)} title="Edit">✏️</button>
                  <button style={dangerBtn} onClick={() => deleteGroup(g._id)} title="Delete">🗑️</button>
                </div>
              </div>
              {g.description && (
                <div style={{ ...font(12, 400, MUTED), marginBottom: 10, lineHeight: 1.5 }}>{g.description}</div>
              )}
              {/* Member avatars */}
              <Divider />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
                <div style={{ display: 'flex', gap: -6 }}>
                  {g.members.slice(0, 5).map(m => {
                    const rm = resolveUser(m)
                    return (
                    <div key={rm._id} title={`${rm.firstName ?? ''} ${rm.lastName ?? ''}`}
                      style={{ marginLeft: -6, border: '2px solid #fff', borderRadius: '50%' }}>
                      <Avatar initials={`${(rm.firstName||'?')[0]}${(rm.lastName||'?')[0]}`} size={28} />
                    </div>
                  )}
                  )}
                  {g.members.length > 5 && (
                    <div style={{ marginLeft: -6, border: '2px solid #fff', borderRadius: '50%',
                      width: 28, height: 28, background: '#e8e8ed', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', ...font(10, 600, MUTED) }}>
                      +{g.members.length - 5}
                    </div>
                  )}
                </div>
                <button style={{ ...btn(), fontSize: 12 }} onClick={() => { setViewGroup(g); setAddMemberMode(false); setAddSearch(''); setMemberSearch('') }}>
                  View members
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {showCreate && (
        <Modal title={editGroup ? `Edit Group — ${editGroup.name}` : 'Create New Group'} onClose={() => setShowCreate(false)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <div style={{ ...font(12, 500, MUTED), marginBottom: 4 }}>Group Name *</div>
              <input style={inputStyle} value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. Engineering Team" />
            </div>
            <div>
              <div style={{ ...font(12, 500, MUTED), marginBottom: 4 }}>Description</div>
              <textarea style={{ ...inputStyle, height: 72, resize: 'vertical' } as React.CSSProperties}
                value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Optional description…" />
            </div>
            <div>
              <div style={{ ...font(12, 500, MUTED), marginBottom: 6 }}>
                Members ({selectedUserIds.size} selected)
              </div>
              <input style={{ ...inputStyle, marginBottom: 8 }} placeholder="Search users…"
                value={memberSearch} onChange={e => setMemberSearch(e.target.value)} />
              <div style={{ maxHeight: 220, overflowY: 'auto', border: BORDER, borderRadius: 10 }}>
                {filteredUsers.map(u => {
                  const checked = selectedUserIds.has(u._id)
                  return (
                    <div key={u._id} onClick={() => toggleUser(u._id)}
                      style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
                        cursor: 'pointer', borderBottom: BORDER,
                        background: checked ? 'rgba(108,99,255,0.06)' : 'transparent' }}>
                      <input type="checkbox" readOnly checked={checked} style={{ accentColor: INDIGO }} />
                      <Avatar initials={`${(u.firstName||'?')[0]}${(u.lastName||'?')[0]}`} size={28} />
                      <div>
                        <div style={{ ...font(13, 500, NAVY) }}>{u.firstName ?? ''} {u.lastName ?? ''}</div>
                        <div style={{ ...font(11, 400, MUTED) }}>{u.email}</div>
                      </div>
                      <div style={{ marginLeft: 'auto' }}>{roleBadge(u.role)}</div>
                    </div>
                  )
                })}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
              <button style={btn()} onClick={() => setShowCreate(false)}>Cancel</button>
              <button style={btn(true)} onClick={saveGroup} disabled={saving || !newName.trim()}>
                {saving ? 'Saving…' : editGroup ? 'Save Changes' : 'Create Group'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* View Members Modal */}
      {viewGroup && (
        <Modal title={`${viewGroup.name} — Members`} onClose={() => setViewGroup(null)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ ...font(13, 400, MUTED) }}>{viewGroup.members.length} member{viewGroup.members.length !== 1 ? 's' : ''}</div>
              <button style={btn(true)} onClick={() => setAddMemberMode(v => !v)}>
                {addMemberMode ? 'Cancel' : '+ Add Members'}
              </button>
            </div>

            {addMemberMode && (
              <div style={{ border: BORDER, borderRadius: 10, padding: 12, background: 'rgba(108,99,255,0.04)' }}>
                <input style={{ ...inputStyle, marginBottom: 8 }} placeholder="Search users to add…"
                  value={addSearch} onChange={e => setAddSearch(e.target.value)} />
                <div style={{ maxHeight: 160, overflowY: 'auto' }}>
                  {allUsers
                    .filter(u => !viewGroup.members.find(m => String(m._id) === u._id))
                    .filter(u => `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(addSearch.toLowerCase()))
                    .map(u => (
                      <div key={u._id}
                        style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0',
                          borderBottom: BORDER, cursor: 'pointer' }}
                        onClick={() => addMembersToView(viewGroup._id, [u._id])}>
                        <Avatar initials={`${(u.firstName||'?')[0]}${(u.lastName||'?')[0]}`} size={26} />
                        <div style={{ flex: 1 }}>
                          <div style={{ ...font(13, 500, NAVY) }}>{u.firstName ?? ''} {u.lastName ?? ''}</div>
                          <div style={{ ...font(11, 400, MUTED) }}>{u.email}</div>
                        </div>
                        <button style={{ ...btn(true), fontSize: 11, padding: '4px 8px' }}>Add</button>
                      </div>
                    ))}
                </div>
              </div>
            )}

            <div style={{ maxHeight: 300, overflowY: 'auto' }}>
              {viewGroup.members.length === 0 ? (
                <div style={{ ...font(13, 400, MUTED), textAlign: 'center', padding: 24 }}>No members yet</div>
              ) : viewGroup.members.map(m => {
                const rm = resolveUser(m)
                return (
                <div key={rm._id} style={{ display: 'flex', alignItems: 'center', gap: 10,
                  padding: '8px 0', borderBottom: BORDER }}>
                  <Avatar initials={`${(rm.firstName||'?')[0]}${(rm.lastName||'?')[0]}`} size={32} />
                  <div style={{ flex: 1 }}>
                    <div style={{ ...font(13, 500, NAVY) }}>{rm.firstName ?? ''} {rm.lastName ?? ''}</div>
                    <div style={{ ...font(11, 400, MUTED) }}>{rm.email}</div>
                  </div>
                  {roleBadge(rm.role)}
                  <button style={{ ...dangerBtn, padding: '4px 8px', fontSize: 11 }}
                    onClick={() => removeMemberFromView(viewGroup._id, rm._id)}>
                    Remove
                  </button>
                </div>
              )})}
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// LOGS PAGE
// ══════════════════════════════════════════════════════════════════════════════
interface LogRecord {
  _id: string; action?: string; module?: string; entity?: string; entityId?: string;
  description?: string; createdAt?: string;
  user?: { _id: string; firstName: string; lastName: string; email: string } | null;
  performedBy?: { _id: string; firstName: string; lastName: string; email: string } | null;
  ipAddress?: string; method?: string; path?: string
}

function LogsPage({ token }: { token: string }) {
  const [logs, setLogs]     = useState<LogRecord[]>([])
  const [total, setTotal]   = useState(0)
  const [page, setPage]     = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState('')

  const LIMIT = 15

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(LIMIT) })
      const res  = await apiFetch(`${apiBase()}/activity-log?${params}`, token)
      const body = await res.json()
      setLogs(Array.isArray(body?.data) ? body.data : (body?.data?.items ?? []))
      setTotal(body?.pagination?.total ?? body?.data?.total ?? 0)
    } catch { setError('Failed to load logs') } finally { setLoading(false) }
  }, [token, page])

  useEffect(() => { load() }, [load])

  const methodColor = (m: string) => {
    if (!m) return MUTED
    const upper = m.toUpperCase()
    if (upper === 'POST')   return '#2258a5'
    if (upper === 'PATCH' || upper === 'PUT') return '#b8740a'
    if (upper === 'DELETE') return '#c0392b'
    return '#2a8c30'
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ ...font(22, 700, NAVY) }}>Activity Logs</div>
          <div style={{ ...font(13, 400, MUTED), marginTop: 2 }}>Full audit trail of all platform events</div>
        </div>
        <button style={btn()} onClick={load}>↻ Refresh</button>
      </div>

      {error && (
        <div style={{ background: 'rgba(240,92,92,0.1)', border: `1px solid ${RED}`, borderRadius: 10,
          padding: '10px 14px', ...font(13, 400, RED) }}>{error}</div>
      )}

      <div style={card}>
        {loading ? <Spinner /> : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ borderBottom: BORDER }}>
                  {['Timestamp', 'User', 'Action / Path', 'Method', 'IP'].map(h => (
                    <th key={h} style={{ padding: '8px 12px', textAlign: 'left',
                      ...font(11, 600, MUTED), textTransform: 'uppercase',
                      letterSpacing: '0.4px', whiteSpace: 'nowrap' as const }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 && (
                  <tr><td colSpan={5} style={{ padding: 32, textAlign: 'center', ...font(14, 400, MUTED) }}>
                    No log entries found
                  </td></tr>
                )}
                {logs.map((l, i) => {
                  // API returns performedBy (populated object) or user
                  const actor = l.performedBy ?? l.user
                  const initials = actor
                    ? `${actor.firstName?.[0] ?? ''}${actor.lastName?.[0] ?? ''}`.toUpperCase()
                    : 'SY'
                  const userName = actor ? `${actor.firstName} ${actor.lastName}` : 'System'
                  // Parse method and path from description "PATCH /api/v1/..." when not explicit
                  const descParts = l.description?.split(' ') ?? []
                  const resolvedMethod = l.method ?? (descParts.length >= 2 ? descParts[0] : undefined)
                  const resolvedPath   = l.path   ?? (descParts.length >= 2 ? descParts.slice(1).join(' ') : undefined)
                  // Friendly action label combining action + module
                  const actionLabel = [l.action, l.module].filter(Boolean).join(' · ')
                  return (
                    <tr key={l._id} style={{ borderBottom: i < logs.length - 1 ? BORDER : 'none' }}>
                      <td style={{ padding: '12px', ...font(12, 400, MUTED), whiteSpace: 'nowrap' as const }}>
                        {l.createdAt ? new Date(l.createdAt).toLocaleString('en-GB', {
                          day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' }) : '—'}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Avatar initials={initials || '?'} size={26} />
                          <div>
                            <div style={{ ...font(13, 500, NAVY) }}>{userName}</div>
                            {actor?.email && <div style={{ ...font(11, 400, MUTED) }}>{actor.email}</div>}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <div style={{ ...font(13, 500, NAVY) }}>{actionLabel || l.description || '—'}</div>
                        {resolvedPath && <div style={{ ...font(11, 400, MUTED), fontFamily: 'monospace', marginTop: 2 }}>{resolvedPath}</div>}
                      </td>
                      <td style={{ padding: '12px' }}>
                        {resolvedMethod && (
                          <Badge color={methodColor(resolvedMethod)} bg={`${methodColor(resolvedMethod)}1a`}>
                            {resolvedMethod.toUpperCase()}
                          </Badge>
                        )}
                      </td>
                      <td style={{ padding: '12px', ...font(12, 400, MUTED), fontFamily: 'monospace' }}>
                        {l.ipAddress ?? '—'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
        <Pagination page={page} total={total} limit={LIMIT} onPage={setPage} />
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// DASHBOARD PAGE
// ══════════════════════════════════════════════════════════════════════════════
type ActivityPeriod = 'week' | 'month' | 'year'

function DashboardPage({ token, onNavigate }: { token: string; onNavigate: (page: Page) => void }) {
  const [stats, setStats]               = useState({ users: 0, courses: 0, tasks: 0 })
  const [allLogs, setAllLogs]           = useState<any[]>([])
  const [activityPeriod, setActivityPeriod] = useState<ActivityPeriod>('week')

  useEffect(() => {
    Promise.all([
      apiFetch(`${apiBase()}/users?limit=1`, token).then(r => r.json()).catch(() => ({})),
      apiFetch(`${apiBase()}/courses?limit=1`, token).then(r => r.json()).catch(() => ({})),
      apiFetch(`${apiBase()}/tasks?limit=1`, token).then(r => r.json()).catch(() => ({})),
    ]).then(([u, c, t]) => {
      setStats({
        users:   u?.pagination?.total ?? (Array.isArray(u?.data) ? u.data.length : 0),
        courses: c?.pagination?.total ?? (Array.isArray(c?.data) ? c.data.length : 0),
        tasks:   t?.pagination?.total ?? (Array.isArray(t?.data) ? t.data.length : 0),
      })
    })
    apiFetch(`${apiBase()}/activity-log?limit=500`, token)
      .then(r => r.json())
      .then(body => {
        const logs: any[] = Array.isArray(body?.data) ? body.data : (body?.data?.items ?? [])
        setAllLogs(logs)
      })
      .catch(() => {})
  }, [token])

  // Compute chart bars + labels for the selected period
  const { bars, labels, highlightIndex } = useMemo(() => {
    const now = new Date()

    if (activityPeriod === 'week') {
      // Current week Mon–Sun
      const counts = [0,0,0,0,0,0,0]
      const todayDow = (now.getDay() + 6) % 7
      const monOffset = todayDow
      const weekMonday = new Date(now)
      weekMonday.setDate(now.getDate() - monOffset)
      weekMonday.setHours(0,0,0,0)
      const weekSunday = new Date(weekMonday)
      weekSunday.setDate(weekMonday.getDate() + 7)
      allLogs.forEach(log => {
        if (!log.createdAt) return
        const d = new Date(log.createdAt)
        if (d >= weekMonday && d < weekSunday) counts[(d.getDay() + 6) % 7]++
      })
      return { bars: counts, labels: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], highlightIndex: todayDow }
    }

    if (activityPeriod === 'month') {
      // Last 4 weeks — each column = one week (oldest → newest)
      const counts = [0,0,0,0]
      const weekLabels = ['3w ago','2w ago','1w ago','This wk']
      allLogs.forEach(log => {
        if (!log.createdAt) return
        const d = new Date(log.createdAt)
        const diffMs = now.getTime() - d.getTime()
        const diffWeeks = Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000))
        if (diffWeeks >= 0 && diffWeeks < 4) counts[3 - diffWeeks]++
      })
      return { bars: counts, labels: weekLabels, highlightIndex: 3 }
    }

    // year — 12 months Jan–Dec of current year
    const counts = Array(12).fill(0)
    allLogs.forEach(log => {
      if (!log.createdAt) return
      const d = new Date(log.createdAt)
      if (d.getFullYear() === now.getFullYear()) counts[d.getMonth()]++
    })
    return {
      bars: counts,
      labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
      highlightIndex: now.getMonth(),
    }
  }, [allLogs, activityPeriod])

  const PERIOD_TABS: { id: ActivityPeriod; label: string }[] = [
    { id: 'week',  label: 'Week'  },
    { id: 'month', label: 'Month' },
    { id: 'year',  label: 'Year'  },
  ]

  const BAR_MAX_PX = 80
  const maxVal = Math.max(...bars, 1)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <div style={{ ...font(22, 700, NAVY) }}>Overview Dashboard</div>
        <div style={{ ...font(13, 400, MUTED), marginTop: 2 }}>Welcome back, Super Admin</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
        <StatCard label="Total Users"   value={stats.users}   color={NAVY} />
        <StatCard label="Total Courses" value={stats.courses} color={GREEN} />
        <StatCard label="Total Tasks"   value={stats.tasks}   color={INDIGO} />
      </div>

      <div style={{ display: 'flex', gap: 20 }}>
        {/* Quick Actions */}
        <div style={{ ...card, flex: 1 }}>
          <div style={{ ...font(16, 700, NAVY), marginBottom: 12 }}>Quick Actions</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {([
              { label: '→ Manage Users',   color: NAVY,   page: 'users'   as Page },
              { label: '→ Manage Courses', color: GREEN,  page: 'courses' as Page },
              { label: '→ Manage Tasks',   color: INDIGO, page: 'tasks'   as Page },
              { label: '→ View Logs',      color: AMBER,  page: 'logs'    as Page },
            ] as { label: string; color: string; page: Page }[]).map(a => (
              <div
                key={a.label}
                onClick={() => onNavigate(a.page)}
                style={{ ...font(14, 500, a.color), cursor: 'pointer', userSelect: 'none' }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.7')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
              >{a.label}</div>
            ))}
          </div>
        </div>

        {/* Platform Activity */}
        <div style={{ ...card, flex: 2 }}>
          {/* Header row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <div style={{ ...font(16, 700, NAVY) }}>Platform Activity</div>
              <div style={{ ...font(11, 400, MUTED), marginTop: 2 }}>
                {activityPeriod === 'week'  && 'Current week — log entries per day'}
                {activityPeriod === 'month' && 'Last 4 weeks — log entries per week'}
                {activityPeriod === 'year'  && `${new Date().getFullYear()} — log entries per month`}
              </div>
            </div>
            {/* Period toggle */}
            <div style={{ display: 'flex', border: `1px solid ${BORDER.replace('1px solid ', '')}`, borderRadius: 8, overflow: 'hidden' }}>
              {PERIOD_TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActivityPeriod(tab.id)}
                  style={{
                    padding: '5px 14px',
                    border: 'none',
                    borderRight: tab.id !== 'year' ? `1px solid rgba(28,28,28,0.1)` : 'none',
                    cursor: 'pointer',
                    background: activityPeriod === tab.id ? NAVY : '#fff',
                    ...font(12, activityPeriod === tab.id ? 600 : 400, activityPeriod === tab.id ? '#fff' : MUTED),
                    transition: 'background .15s',
                  }}
                >{tab.label}</button>
              ))}
            </div>
          </div>

          {/* Chart */}
          {bars.every(v => v === 0) ? (
            <div style={{ height: BAR_MAX_PX + 20, display: 'flex', alignItems: 'center', justifyContent: 'center', ...font(13, 400, MUTED) }}>
              No activity data for this period
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: bars.length > 8 ? 4 : 8, height: BAR_MAX_PX + 20 }}>
              {bars.map((count, i) => {
                const barPx = Math.max(Math.round((count / maxVal) * BAR_MAX_PX), count > 0 ? 4 : 0)
                const isHighlight = i === highlightIndex
                return (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, minWidth: 0 }} title={`${labels[i]}: ${count} events`}>
                    <div style={{ width: '100%', height: barPx, background: isHighlight ? GREEN : '#1c1c1c', borderRadius: '4px 4px 0 0', transition: 'height .3s ease' }} />
                    <div style={{ ...font(bars.length > 8 ? 9 : 10, 400, isHighlight ? GREEN : MUTED), whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>{labels[i]}</div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// SETTINGS PAGE
// ══════════════════════════════════════════════════════════════════════════════
function SettingsPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <div style={{ ...font(22, 700, NAVY) }}>Settings</div>
        <div style={{ ...font(13, 400, MUTED), marginTop: 2 }}>Platform configuration and preferences</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div style={card}>
          <div style={{ ...font(16, 700, NAVY), marginBottom: 20 }}>General</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Field label="Platform Name">
              <input style={inputStyle} defaultValue="Prime Learning Platform" />
            </Field>
            <Field label="Admin Email">
              <input style={inputStyle} type="email" defaultValue="admin@prime.com" />
            </Field>
          </div>
        </div>
        <div style={card}>
          <div style={{ ...font(16, 700, NAVY), marginBottom: 20 }}>Security</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { label: 'Require 2FA for admins', on: true },
              { label: 'Allow self-registration', on: false },
            ].map(s => (
              <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ ...font(14, 500, NAVY) }}>{s.label}</div>
                <div style={{ width: 40, height: 22, background: s.on ? '#1c1c1c' : '#E8E8ED',
                  borderRadius: 99, cursor: 'pointer', position: 'relative' as const }}>
                  <div style={{ position: 'absolute' as const, top: 3, [s.on ? 'right' : 'left']: 3,
                    width: 16, height: 16, background: '#fff', borderRadius: '50%',
                    boxShadow: '0 1px 3px rgba(0,0,0,.2)' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// NAV ITEM
// ══════════════════════════════════════════════════════════════════════════════
function NavItem({ id, active, onClick, icon, label }: {
  id: Page; active: boolean; onClick: (id: Page) => void
  icon: React.ReactNode; label: string
}) {
  return (
    <div onClick={() => onClick(id)}
      style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 12,
        cursor: 'pointer', background: active ? '#1c1c1c' : 'transparent',
        color: active ? '#fff' : '#1c1c1c', marginBottom: 2 }}>
      <span style={{ color: 'currentColor', display: 'flex', flexShrink: 0 }}>{icon}</span>
      <span style={{ ...font(14, active ? 500 : 400, 'inherit'), flex: 1 }}>{label}</span>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN ADMIN PAGE
// ══════════════════════════════════════════════════════════════════════════════
export default function AdminPage() {
  const { data: session } = useSession()
  const [activePage, setActivePage] = useState<Page>('dashboard')

  const token       = ((session?.user as any)?.accessToken as string) ?? ''
  const adminName   = `${(session?.user as any)?.firstName ?? 'Super'} ${(session?.user as any)?.lastName ?? 'Admin'}`
  const adminEmail  = session?.user?.email ?? 'admin@prime.com'
  const adminInitials = adminName.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)

  const NAV: { id: Page; label: string }[] = [
    { id: 'dashboard', label: 'Dashboard'   },
    { id: 'users',     label: 'Users'       },
    { id: 'courses',   label: 'Courses'     },
    { id: 'tasks',     label: 'Tasks'       },
    { id: 'assign',    label: 'Assign Tasks'},
    { id: 'groups',    label: 'Groups'      },
    { id: 'logs',      label: 'Audit Logs'  },
    { id: 'settings',  label: 'Settings'   },
  ]

  return (
    <div style={{ display: 'flex', height: '100vh', background: BG, fontFamily: FF, overflow: 'hidden' }}>

      {/* ── Sidebar ────────────────────────────────────────────────────────── */}
      <aside style={{
        width: 220, flexShrink: 0, background: '#fff', borderRight: BORDER,
        display: 'flex', flexDirection: 'column', padding: '20px 12px', overflowY: 'auto',
      }}>
        {/* Logo / brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28, paddingLeft: 4 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8, background: '#1c1c1c',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ ...font(14, 700, '#fff') }}>P</span>
          </div>
          <span style={{ ...font(15, 700, NAVY) }}>Prime Admin</span>
        </div>

        {/* Nav items */}
        <nav style={{ flex: 1 }}>
          {NAV.map(({ id, label }) => (
            <NavItem
              key={id}
              id={id}
              label={label}
              icon={icons[id]}
              active={activePage === id}
              onClick={setActivePage}
            />
          ))}
        </nav>

        {/* Admin profile + sign out */}
        <div style={{ borderTop: BORDER, paddingTop: 12, marginTop: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <Avatar initials={adminInitials || 'A'} size={32} />
            <div style={{ minWidth: 0 }}>
              <div style={{ ...font(13, 600, NAVY), overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {adminName}
              </div>
              <div style={{ ...font(11, 400, MUTED), overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {adminEmail}
              </div>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            style={{ ...btn(), width: '100%', justifyContent: 'center', color: RED }}
          >
            <span style={{ display: 'flex', color: RED }}>{icons.logout}</span>
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main content ───────────────────────────────────────────────────── */}
      <main style={{ flex: 1, overflowY: 'auto', padding: 28 }}>
        {activePage === 'dashboard' && <DashboardPage token={token} onNavigate={setActivePage} />}
        {activePage === 'users'     && <UsersPage     token={token} />}
        {activePage === 'courses'   && <CoursesPage   token={token} />}
        {activePage === 'tasks'     && <TasksPage     token={token} />}
        {activePage === 'assign'    && <AssignPage    token={token} />}
        {activePage === 'groups'    && <GroupsPage    token={token} />}
        {activePage === 'logs'      && <LogsPage      token={token} />}
        {activePage === 'settings'  && <SettingsPage />}
      </main>
    </div>
  )
}