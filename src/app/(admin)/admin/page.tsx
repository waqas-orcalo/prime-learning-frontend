'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession, signOut } from 'next-auth/react'

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

type Page = 'dashboard' | 'users' | 'courses' | 'tasks' | 'assign' | 'logs' | 'settings'

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
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// COURSES PAGE
// ══════════════════════════════════════════════════════════════════════════════
interface CourseSlide { content: string }
interface CourseModule { name: string; slides: CourseSlide[] }
interface CourseRecord {
  _id: string; title: string; description?: string; category?: string;
  modules?: number; duration?: string; status: string; thumbnailEmoji?: string;
  enrolledUsers?: string[]; createdAt?: string;
  courseModules?: CourseModule[]
}

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
  const [courses, setCourses]       = useState<CourseRecord[]>([])
  const [total, setTotal]           = useState(0)
  const [page, setPage]             = useState(1)
  const [loading, setLoading]       = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [editCourse, setEditCourse] = useState<CourseRecord | null>(null)
  const [deleteCourse, setDeleteCourse] = useState<CourseRecord | null>(null)
  const [deleting, setDeleting]     = useState(false)
  const [saving, setSaving]         = useState(false)
  const [error, setError]           = useState('')
  const [enrollModal, setEnrollModal] = useState<CourseRecord | null>(null)
  const [enrollSearch, setEnrollSearch] = useState('')
  const [enrollUsers, setEnrollUsers] = useState<UserRecord[]>([])
  const [selectedEnrollIds, setSelectedEnrollIds] = useState<string[]>([])
  const [enrolling, setEnrolling]   = useState(false)

  const LIMIT = 12

  const [form, setForm] = useState({
    title: '', description: '', category: '', duration: '',
    status: 'DRAFT', thumbnailEmoji: '📘'
  })
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
      const res  = await apiFetch(`${apiBase()}/courses?${params}`, token)
      const body = await res.json()
      setCourses(Array.isArray(body?.data) ? body.data : (body?.data?.items ?? []))
      setTotal(body?.pagination?.total ?? body?.data?.total ?? 0)
    } catch { setError('Failed to load courses') } finally { setLoading(false) }
  }, [token, page])

  useEffect(() => { load() }, [load])

  // Load users for enroll modal
  useEffect(() => {
    if (!enrollModal) return
    apiFetch(`${apiBase()}/users?limit=100${enrollSearch ? `&search=${encodeURIComponent(enrollSearch)}` : ''}`, token)
      .then(r => r.json())
      .then(b => setEnrollUsers(Array.isArray(b?.data) ? b.data : (b?.data?.items ?? [])))
      .catch(() => {})
  }, [enrollModal, enrollSearch, token])

  const openCreate = () => {
    setForm({ title: '', description: '', category: '', duration: '', status: 'DRAFT', thumbnailEmoji: '📘' })
    setCourseModules([])
    setShowCreate(true)
  }
  const openEdit = (c: CourseRecord) => {
    setForm({ title: c.title, description: c.description ?? '', category: c.category ?? '',
      duration: c.duration ?? '', status: c.status, thumbnailEmoji: c.thumbnailEmoji ?? '📘' })
    setCourseModules(c.courseModules ? c.courseModules.map(m => ({ name: m.name, slides: m.slides.map(s => ({ content: s.content })) })) : [])
    setEditCourse(c)
  }

  const handleSave = async () => {
    setSaving(true); setError('')
    try {
      const body: Record<string, any> = {
        title: form.title, status: form.status, thumbnailEmoji: form.thumbnailEmoji,
        courseModules,
      }
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
    if (!deleteCourse) return
    setDeleting(true)
    try {
      await apiFetch(`${apiBase()}/courses/${deleteCourse._id}`, token, { method: 'DELETE' })
      setDeleteCourse(null); load()
    } catch { setError('Delete failed') } finally { setDeleting(false) }
  }

  const handlePublish = async (c: CourseRecord) => {
    try {
      await apiFetch(`${apiBase()}/courses/${c._id}`, token, {
        method: 'PATCH', body: JSON.stringify({ status: 'PUBLISHED' }),
      })
      load()
    } catch { setError('Failed to update status') }
  }

  const handleEnroll = async () => {
    if (!enrollModal || selectedEnrollIds.length === 0) return
    setEnrolling(true)
    try {
      await apiFetch(`${apiBase()}/courses/${enrollModal._id}/enroll`, token, {
        method: 'POST', body: JSON.stringify({ userIds: selectedEnrollIds }),
      })
      setEnrollModal(null); setSelectedEnrollIds([]); load()
    } catch { setError('Enroll failed') } finally { setEnrolling(false) }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ ...font(22, 700, NAVY) }}>Course Management</div>
          <div style={{ ...font(13, 400, MUTED), marginTop: 2 }}>Create, edit and organise all learning courses</div>
        </div>
        <button style={btn(true)} onClick={openCreate}>
          <span style={{ color: '#fff' }}>{icons.plus}</span> New Course
        </button>
      </div>

      {error && (
        <div style={{ background: 'rgba(240,92,92,0.1)', border: `1px solid ${RED}`, borderRadius: 10,
          padding: '10px 14px', ...font(13, 400, RED) }}>{error}</div>
      )}

      {loading ? <Spinner /> : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 16 }}>
            {courses.map((c, i) => (
              <div key={c._id} style={{ background: '#fff', borderRadius: 16, boxShadow: SHADOW, overflow: 'hidden' }}>
                <div style={{ height: 100, background: COURSE_GRADIENTS[i % COURSE_GRADIENTS.length],
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36 }}>
                  {c.thumbnailEmoji || COURSE_EMOJIS[i % COURSE_EMOJIS.length]}
                </div>
                <div style={{ padding: '14px 16px 16px' }}>
                  <div style={{ ...font(14, 600, NAVY), marginBottom: 4 }}>{c.title}</div>
                  {c.description && (
                    <div style={{ ...font(12, 400, MUTED), marginBottom: 6,
                      overflow: 'hidden', textOverflow: 'ellipsis',
                      display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const }}>
                      {c.description}
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 8, ...font(12, 400, MUTED), marginBottom: 10, flexWrap: 'wrap' as const }}>
                    {c.modules != null && <span>{c.modules} modules</span>}
                    {c.duration && <span>{c.duration}</span>}
                    <span>{(c.enrolledUsers ?? []).length} enrolled</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {c.status === 'PUBLISHED'
                      ? <Badge color="#2a8c30" bg="rgba(95,201,102,0.12)">Published</Badge>
                      : c.status === 'ARCHIVED'
                        ? <Badge color={MUTED} bg="rgba(28,28,28,0.06)">Archived</Badge>
                        : <Badge color="#b8740a" bg="rgba(245,166,35,0.12)">Draft</Badge>}
                    <div style={{ display: 'flex', gap: 6 }}>
                      {c.status !== 'PUBLISHED' && (
                        <button style={{ ...btn(true), fontSize: 12, padding: '5px 10px', borderRadius: 8 }}
                          onClick={() => handlePublish(c)}>Publish</button>
                      )}
                      <button style={{ ...btn(), fontSize: 12, padding: '5px 10px', borderRadius: 8 }}
                        onClick={() => setEnrollModal(c)}>Enroll</button>
                      <button style={{ ...btn(), fontSize: 12, padding: '5px 10px', borderRadius: 8 }}
                        onClick={() => openEdit(c)}>Edit</button>
                      <button style={{ ...btn(), fontSize: 12, padding: '5px 10px', borderRadius: 8, color: RED }}
                        onClick={() => setDeleteCourse(c)}>Del</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Create card */}
            <div onClick={openCreate} style={{ borderRadius: 16, border: '2px dashed rgba(28,28,28,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200, cursor: 'pointer' }}>
              <div style={{ textAlign: 'center', color: MUTED }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>+</div>
                <div style={{ ...font(14, 500, MUTED) }}>Create New Course</div>
              </div>
            </div>
          </div>

          <Pagination page={page} total={total} limit={LIMIT} onPage={setPage} />
        </>
      )}

      {/* Create / Edit Modal */}
      {(showCreate || editCourse) && (
        <Modal title={editCourse ? 'Edit Course' : 'Create Course'} onClose={() => { setShowCreate(false); setEditCourse(null) }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Field label="Title">
              <input style={inputStyle} value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            </Field>
            <Field label="Description">
              <textarea style={{ ...inputStyle, resize: 'vertical' as const }} rows={3} value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </Field>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="Category">
                <input style={inputStyle} value={form.category}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value }))} />
              </Field>
              <Field label="Duration (e.g. 4.5h)">
                <input style={inputStyle} value={form.duration}
                  onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} />
              </Field>
            </div>
            <Field label="Status">
              <select style={inputStyle} value={form.status}
                onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </Field>
            <Field label="Thumbnail Emoji">
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' as const }}>
                {COURSE_EMOJIS.map(e => (
                  <button key={e} onClick={() => setForm(f => ({ ...f, thumbnailEmoji: e }))}
                    style={{ fontSize: 24, background: form.thumbnailEmoji === e ? BG : 'transparent',
                      border: form.thumbnailEmoji === e ? `2px solid ${NAVY}` : '2px solid transparent',
                      borderRadius: 8, cursor: 'pointer', padding: 4 }}>{e}</button>
                ))}
              </div>
            </Field>

            {/* ── Module / Slide Builder ── */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ ...font(13, 600, NAVY) }}>Modules &amp; Slides ({courseModules.length} module{courseModules.length !== 1 ? 's' : ''})</span>
                <button style={btn(true)} onClick={() => setCourseModules(ms => [...ms, { name: `Module ${ms.length + 1}`, slides: [] }])}>
                  + Add Module
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {courseModules.map((mod, mi) => (
                  <div key={mi} style={{ border: BORDER, borderRadius: 10, overflow: 'hidden' }}>
                    {/* Module header */}
                    <div style={{ background: BG, padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <input
                        style={{ ...inputStyle, flex: 1, margin: 0 }}
                        placeholder={`Module ${mi + 1} name`}
                        value={mod.name}
                        onChange={e => setCourseModules(ms => ms.map((m, i) => i === mi ? { ...m, name: e.target.value } : m))}
                      />
                      <button
                        onClick={() => setCourseModules(ms => ms.map((m, i) => i === mi ? { ...m, slides: [...m.slides, { content: '' }] } : m))}
                        style={{ ...btn(true), whiteSpace: 'nowrap' as const, fontSize: 12, padding: '4px 10px', height: 'auto' }}
                      >+ Slide</button>
                      <button
                        onClick={() => setCourseModules(ms => ms.filter((_, i) => i !== mi))}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: RED, fontSize: 16, fontWeight: 700, padding: '0 4px' }}
                      >×</button>
                    </div>
                    {/* Slides */}
                    {mod.slides.length > 0 && (
                      <div style={{ padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {mod.slides.map((slide, si) => (
                          <div key={si} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                            <div style={{ ...font(11, 500, MUTED), paddingTop: 10, flexShrink: 0, minWidth: 52 }}>
                              Slide {si + 1}
                            </div>
                            <textarea
                              style={{ ...inputStyle, flex: 1, resize: 'vertical' as const, minHeight: 70, margin: 0 }}
                              placeholder="Slide content (text)…"
                              value={slide.content}
                              onChange={e => setCourseModules(ms => ms.map((m, i) =>
                                i !== mi ? m : { ...m, slides: m.slides.map((s, j) => j === si ? { content: e.target.value } : s) }
                              ))}
                            />
                            <button
                              onClick={() => setCourseModules(ms => ms.map((m, i) =>
                                i !== mi ? m : { ...m, slides: m.slides.filter((_, j) => j !== si) }
                              ))}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: RED, fontSize: 16, fontWeight: 700, padding: '6px 4px' }}
                            >×</button>
                          </div>
                        ))}
                      </div>
                    )}
                    {mod.slides.length === 0 && (
                      <div style={{ padding: '8px 12px', ...font(12, 400, MUTED) }}>No slides yet — click "+ Slide" to add one.</div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {error && <div style={{ ...font(13, 400, RED) }}>{error}</div>}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
              <button style={btn()} onClick={() => { setShowCreate(false); setEditCourse(null) }}>Cancel</button>
              <button style={btn(true)} onClick={handleSave} disabled={saving}>
                {saving ? 'Saving…' : editCourse ? 'Save Changes' : 'Create Course'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Enroll Modal */}
      {enrollModal && (
        <Modal title={`Enroll Users — ${enrollModal.title}`} onClose={() => setEnrollModal(null)}>
          <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8,
            background: BG, border: BORDER, borderRadius: 10, padding: '8px 12px' }}>
            {icons.search}
            <input type="text" placeholder="Search users…" value={enrollSearch}
              onChange={e => setEnrollSearch(e.target.value)}
              style={{ border: 'none', background: 'transparent', outline: 'none',
                fontFamily: FF, fontSize: 13, width: '100%' }} />
          </div>
          <div style={{ maxHeight: 300, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 16 }}>
            {enrollUsers.map(u => {
              const isSel = selectedEnrollIds.includes(u._id)
              const initials = `${u.firstName?.[0] ?? ''}${u.lastName?.[0] ?? ''}`.toUpperCase()
              return (
                <div key={u._id} onClick={() => setSelectedEnrollIds(p => isSel ? p.filter(x => x !== u._id) : [...p, u._id])}
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
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button style={btn()} onClick={() => setEnrollModal(null)}>Cancel</button>
            <button style={btn(true)} onClick={handleEnroll} disabled={enrolling || selectedEnrollIds.length === 0}>
              {enrolling ? 'Enrolling…' : `Enroll ${selectedEnrollIds.length} User${selectedEnrollIds.length !== 1 ? 's' : ''}`}
            </button>
          </div>
        </Modal>
      )}

      {/* Delete Confirm */}
      {deleteCourse && (
        <ConfirmDialog
          message={`Delete "${deleteCourse.title}"? All enrolled users will lose access.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteCourse(null)}
          loading={deleting}
        />
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

  // Load users for assign modal
  useEffect(() => {
    if (!assignModal) return
    apiFetch(`${apiBase()}/users?limit=100`, token)
      .then(r => r.json())
      .then(b => setAssignUsers(Array.isArray(b?.data) ? b.data : (b?.data?.items ?? [])))
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
      await apiFetch(`${apiBase()}/tasks/${assignModal._id}/assign`, token, {
        method: 'POST', body: JSON.stringify({ userIds: selectedAssignIds }),
      })
      setAssignModal(null); setSelectedAssignIds([])
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
          <div style={{ ...font(13, 400, MUTED), marginTop: 2 }}>Monitor and manage all learner tasks</div>
        </div>
        <button style={btn(true)} onClick={openCreate}>
          <span style={{ color: '#fff' }}>{icons.plus}</span> Create Task
        </button>
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
            Select learners to assign this task to. A copy of this task will be created for each learner.
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
              <div style={{ ...font(13, 400, MUTED), padding: '16px 0', textAlign: 'center' }}>No learners found</div>
            )}
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button style={btn()} onClick={() => setAssignModal(null)}>Cancel</button>
            <button style={btn(true)} onClick={handleAssign} disabled={assigning || selectedAssignIds.length === 0}>
              {assigning ? 'Assigning…' : `Assign to ${selectedAssignIds.length} Learner${selectedAssignIds.length !== 1 ? 's' : ''}`}
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
function DashboardPage({ token }: { token: string }) {
  const [stats, setStats] = useState({ users: 0, courses: 0, tasks: 0 })

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
  }, [token])

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
        <div style={{ ...card, flex: 1 }}>
          <div style={{ ...font(16, 700, NAVY), marginBottom: 12 }}>Quick Actions</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { label: '→ Manage Users',   color: NAVY },
              { label: '→ Manage Courses', color: GREEN },
              { label: '→ Manage Tasks',   color: INDIGO },
              { label: '→ View Logs',      color: AMBER },
            ].map(a => (
              <div key={a.label} style={{ ...font(14, 500, a.color), cursor: 'default' }}>{a.label}</div>
            ))}
          </div>
        </div>
        <div style={{ ...card, flex: 2 }}>
          <div style={{ ...font(16, 700, NAVY), marginBottom: 12 }}>Platform Activity</div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 100 }}>
            {[60, 90, 70, 100, 80, 50, 30].map((h, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={{ width: '100%', height: `${h}%`, background: i < 5 ? '#1c1c1c' : GREEN, borderRadius: '4px 4px 0 0' }} />
                <div style={{ ...font(10, 400, MUTED) }}>{['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][i]}</div>
              </div>
            ))}
          </div>
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
  const adminInitials = adminName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

  const PAGE_TITLES: Record<Page, string> = {
    dashboard: 'Dashboard', users: 'User Management', courses: 'Course Management',
    tasks: 'Task Management', assign: 'Assign Tasks', logs: 'Activity Logs', settings: 'Settings',
  }

  const NAV: { id: Page; label: string }[] = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'users',     label: 'Users' },
    { id: 'courses',   label: 'Courses' },
    { id: 'tasks',     label: 'Tasks' },
    { id: 'assign',    label: 'Assign Tasks' },
    { id: 'logs',      label: 'Activity Logs' },
    { id: 'settings',  label: 'Settings' },
  ]

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: ${BG}; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-thumb { background: rgba(28,28,28,.15); border-radius: 99px; }
        select, input { cursor: text; }
        select { cursor: pointer; }
        button:disabled { opacity: 0.55; cursor: not-allowed; }
      `}</style>

      <div style={{ display: 'flex', minHeight: '100vh', background: BG }}>

        {/* SIDEBAR */}
        <aside style={{ width: 220, minHeight: '100vh', background: '#fff', borderRight: BORDER,
          display: 'flex', flexDirection: 'column', padding: 16,
          position: 'fixed', top: 0, left: 0, bottom: 0, overflowY: 'auto', zIndex: 10 }}>

          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 0', marginBottom: 4 }}>
            <div style={{ width: 36, height: 36, background: '#1c1c1c', borderRadius: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M4 14L10 5l6 9H4Z" fill="#fff" opacity=".9"/>
                <circle cx="10" cy="10" r="2" fill="#fff"/>
              </svg>
            </div>
            <div>
              <div style={{ ...font(13, 700, NAVY) }}>Prime Learning</div>
              <div style={{ ...font(11, 400, MUTED) }}>Admin Panel</div>
            </div>
          </div>

          {/* Nav sections */}
          <div style={{ ...font(11, 400, 'rgba(28,28,28,0.40)'), padding: '4px 12px',
            textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: 4 }}>Overview</div>
          <NavItem id="dashboard" active={activePage === 'dashboard'} onClick={setActivePage}
            icon={icons.dashboard} label="Dashboard" />

          <div style={{ ...font(11, 400, 'rgba(28,28,28,0.40)'), padding: '4px 12px',
            textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: 8 }}>Manage</div>
          {(['users','courses','tasks','assign'] as Page[]).map(id => (
            <NavItem key={id} id={id} active={activePage === id} onClick={setActivePage}
              icon={icons[id]} label={NAV.find(n => n.id === id)?.label ?? id} />
          ))}

          <div style={{ ...font(11, 400, 'rgba(28,28,28,0.40)'), padding: '4px 12px',
            textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: 8 }}>System</div>
          <NavItem id="logs" active={activePage === 'logs'} onClick={setActivePage}
            icon={icons.logs} label="Activity Logs" />
          <NavItem id="settings" active={activePage === 'settings'} onClick={setActivePage}
            icon={icons.settings} label="Settings" />

          {/* Footer */}
          <div style={{ marginTop: 'auto', paddingTop: 12, borderTop: BORDER }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 12 }}>
              <Avatar initials={adminInitials} size={32} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ ...font(13, 600, NAVY), overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{adminName}</div>
                <div style={{ ...font(11, 400, MUTED), overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{adminEmail}</div>
              </div>
            </div>
            <button onClick={() => signOut({ callbackUrl: '/login' })}
              style={{ ...btn(), width: '100%', justifyContent: 'center', marginTop: 4, color: RED, borderColor: 'transparent' }}>
              {icons.logout} Sign out
            </button>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <div style={{ marginLeft: 220, flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

          {/* Topbar */}
          <div style={{ height: 64, background: '#fff', borderBottom: BORDER, padding: '0 28px',
            display: 'flex', alignItems: 'center', gap: 16,
            position: 'sticky', top: 0, zIndex: 5 }}>
            <span style={{ ...font(18, 700, NAVY), flex: 1 }}>{PAGE_TITLES[activePage]}</span>
            <div style={{ width: 38, height: 38, borderRadius: 10, border: BORDER, background: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              position: 'relative' as const, color: '#1c1c1c' }}>
              {icons.bell}
              <div style={{ position: 'absolute' as const, top: 8, right: 8, width: 7, height: 7,
                background: RED, borderRadius: '50%', border: '1.5px solid #fff' }} />
            </div>
            <Avatar initials={adminInitials} size={36} />
          </div>

          {/* Page content */}
          <div style={{ padding: 28, flex: 1 }}>
            {activePage === 'dashboard' && <DashboardPage token={token} />}
            {activePage === 'users'     && <UsersPage     token={token} />}
            {activePage === 'courses'   && <CoursesPage   token={token} />}
            {activePage === 'tasks'     && <TasksPage     token={token} />}
            {activePage === 'assign'    && <AssignPage    token={token} />}
            {activePage === 'logs'      && <LogsPage      token={token} />}
            {activePage === 'settings'  && <SettingsPage />}
          </div>
        </div>
      </div>
    </>
  )
}
