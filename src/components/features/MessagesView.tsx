'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { connectSse, disconnectSse } from '@/lib/sse'

// ── Icons ────────────────────────────────────────────────────────────────────
const enc = (s: string) => `data:image/svg+xml,${encodeURIComponent(s)}`
const iconSearch   = enc(`<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="9" cy="9" r="6.5" stroke="#818183" stroke-width="1.5"/><path d="M14 14l4 4" stroke="#818183" stroke-width="1.5" stroke-linecap="round"/></svg>`)
const iconSearchSm = enc(`<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="8" cy="8" r="5.5" stroke="#94a3b8" stroke-width="1.4"/><path d="M13 13l3.5 3.5" stroke="#94a3b8" stroke-width="1.4" stroke-linecap="round"/></svg>`)
const iconPlus     = enc(`<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 4v12M4 10h12" stroke="#475569" stroke-width="1.5" stroke-linecap="round"/></svg>`)
const iconMic      = enc(`<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="7" y="2" width="6" height="10" rx="3" stroke="#475569" stroke-width="1.5"/><path d="M4 10a6 6 0 0 0 12 0" stroke="#475569" stroke-width="1.5" stroke-linecap="round"/><path d="M10 16v2" stroke="#475569" stroke-width="1.5" stroke-linecap="round"/></svg>`)
const iconSend     = enc(`<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M18 10L3 3l3 7-3 7 15-7z" stroke="#4f46e5" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M6 10h12" stroke="#4f46e5" stroke-width="1.5" stroke-linecap="round"/></svg>`)
const iconCheck    = enc(`<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M1 6l3 3 7-6" stroke="rgba(71,85,105,0.6)" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`)
const iconDblCheck = enc(`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M1 8l4 4 8-8" stroke="#a5b4fc" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/><path d="M5 8l4 4 8-8" stroke="#a5b4fc" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>`)
const iconCompose  = enc(`<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M13 2.5l2.5 2.5-9 9L3 15l1-3.5 9-9z" stroke="#fff" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/><path d="M11.5 4l2.5 2.5" stroke="#fff" stroke-width="1.4" stroke-linecap="round"/></svg>`)
const iconClose    = enc(`<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M5 5l10 10M15 5L5 15" stroke="#475569" stroke-width="1.5" stroke-linecap="round"/></svg>`)
const iconTick     = enc(`<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="8" fill="#4f46e5"/><path d="M6.5 10l2.5 2.5 4.5-4.5" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`)

const FF   = "'Inter', sans-serif"
const font = (size: number, weight = 400, color = '#1e293b') =>
  ({ fontFamily: FF, fontSize: `${size}px`, fontWeight: weight, color } as React.CSSProperties)

const TABS    = ['All', 'Unread', 'Unresolved']
const PALETTE = ['#4f46e5','#f97316','#be185d','#7c3aed','#0891b2','#3b82f6','#059669','#dc2626','#d97706']
const avatarBg = (name: string) =>
  PALETTE[(name.charCodeAt(0) + (name.charCodeAt(1) || 0)) % PALETTE.length]

// ── Types ────────────────────────────────────────────────────────────────────
interface Conversation {
  partnerId:       string  // always a plain string from the API
  firstName:       string
  lastName:        string
  email:           string
  lastMessage:     string
  lastMessageAt:   string
  lastMessageMine: boolean
  unreadCount:     number
}
interface ChatMessage {
  _id:         string  // always plain string from API
  senderId:    string  // always plain string from API
  recipientId: string
  content:     string
  createdAt:   string
  isRead:      boolean
}
interface AvailableUser {
  _id:       string  // always plain string from API
  firstName: string
  lastName:  string
  email:     string
  role:      string
}

// ── Helpers ──────────────────────────────────────────────────────────────────
const fullName  = (u: { firstName: string; lastName: string }) => `${u.firstName} ${u.lastName}`
const initials  = (n: string) => n.split(/[\s\-_]/).slice(0, 2).map(w => w[0]?.toUpperCase() || '').join('')
const fmtTime   = (iso: string) => new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
const fmtDay    = (iso: string) => new Date(iso).toLocaleDateString([], { day: 'numeric', month: 'long' })
const apiBase   = () => process.env.NEXT_PUBLIC_API_URL ?? 'https://gateway.primecollege.org/api/v1'
const apiFetch  = (url: string, token: string, init?: RequestInit) =>
  fetch(url, {
    ...init,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...(init?.headers ?? {}) },
  })

function Avatar({ name, size = 48, online = true }: { name: string; size?: number; online?: boolean }) {
  const bg = avatarBg(name)
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <div style={{ width: size, height: size, borderRadius: '50%', backgroundColor: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', ...font(Math.floor(size * 0.3), 600, '#fff') }}>
        {initials(name)}
      </div>
      <div style={{ position: 'absolute', bottom: 0, right: 0, width: Math.max(size * 0.25, 8), height: Math.max(size * 0.25, 8), borderRadius: '50%', backgroundColor: online ? '#22c55e' : '#cbd5e1', border: '1.5px solid #fff' }} />
    </div>
  )
}

function Spinner({ size = 24, color = '#4f46e5' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 0.9s linear infinite', flexShrink: 0 }}>
      <circle cx="12" cy="12" r="9" stroke={color === '#fff' ? 'rgba(255,255,255,0.25)' : '#e2e8f0'} strokeWidth="2.5"/>
      <path d="M12 3a9 9 0 0 1 9 9" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  )
}

// ── New Chat Panel ───────────────────────────────────────────────────────────
function NewChatPanel({ token, onClose, onStart }: {
  token: string
  onClose: () => void
  onStart: (u: AvailableUser) => void
}) {
  const [search,   setSearch]   = useState('')
  const [users,    setUsers]    = useState<AvailableUser[]>([])
  const [loading,  setLoading]  = useState(true)
  const [selected, setSelected] = useState<AvailableUser | null>(null)

  useEffect(() => {
    const tid = setTimeout(async () => {
      setLoading(true)
      try {
        const url = `${apiBase()}/messages/contacts/available${search ? `?search=${encodeURIComponent(search)}` : ''}`
        const res = await apiFetch(url, token)
        if (res.ok) {
          const body = await res.json()
          setUsers(body.data ?? [])
        }
      } catch { /* offline */ }
      setLoading(false)
    }, 250)
    return () => clearTimeout(tid)
  }, [search, token])

  const name = selected ? fullName(selected) : ''

  return (
    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', backgroundColor: '#fff', height: '100%' }}>
      {/* Header */}
      <div style={{ borderBottom: '1px solid #cbd5e1', padding: '16px 24px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ ...font(18, 700), letterSpacing: '-0.126px' }}>New Chat</span>
        <button onClick={onClose} style={{ width: 36, height: 36, borderRadius: '50%', border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img src={iconClose} alt="close" style={{ width: 20, height: 20 }} />
        </button>
      </div>

      {/* To: field */}
      <div style={{ padding: '14px 24px', borderBottom: '1px solid #e4e7ec', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' as const }}>
        <span style={{ ...font(14, 600, '#64748b'), flexShrink: 0 }}>To:</span>
        {selected && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, backgroundColor: '#eef2ff', borderRadius: 20, padding: '4px 10px 4px 6px', flexShrink: 0 }}>
            <Avatar name={name} size={22} online={false} />
            <span style={{ ...font(13, 600, '#4f46e5') }}>{name}</span>
            <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', marginLeft: 2 }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3.5 3.5l7 7M10.5 3.5l-7 7" stroke="#4f46e5" strokeWidth="1.3" strokeLinecap="round"/></svg>
            </button>
          </div>
        )}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, minWidth: 120 }}>
          <img src={iconSearchSm} alt="" style={{ width: 18, height: 18, flexShrink: 0 }} />
          <input autoFocus type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search people…"
            style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', ...font(14, 400) }} />
        </div>
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
        <div style={{ padding: '8px 24px 4px' }}>
          <span style={{ ...font(11, 600, '#94a3b8'), letterSpacing: '0.4px', textTransform: 'uppercase' as const }}>
            {search ? 'Results' : 'Suggested'}
          </span>
        </div>

        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}>
            <Spinner />
          </div>
        )}

        {!loading && users.length === 0 && (
          <div style={{ padding: '32px 24px', textAlign: 'center' as const }}>
            <span style={{ ...font(14, 400, '#94a3b8') }}>
              {search ? 'No users found' : 'Everyone is already in your conversations'}
            </span>
          </div>
        )}

        {!loading && users.map(u => {
          const uName = fullName(u)
          const isSel = selected?._id === u._id
          return (
            <div key={u._id} onClick={() => setSelected(isSel ? null : u)}
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 24px', backgroundColor: isSel ? '#eef2ff' : 'transparent', cursor: 'pointer' }}
              onMouseEnter={e => { if (!isSel) (e.currentTarget as HTMLElement).style.backgroundColor = '#f8fafc' }}
              onMouseLeave={e => { if (!isSel) (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent' }}>
              <Avatar name={uName} size={44} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ ...font(15, 600), lineHeight: '22px' }}>{uName}</div>
                <div style={{ ...font(13, 400, '#94a3b8'), lineHeight: '18px', textTransform: 'capitalize' as const }}>
                  {u.role?.toLowerCase()}
                </div>
              </div>
              {isSel && <img src={iconTick} alt="selected" style={{ width: 22, height: 22, flexShrink: 0 }} />}
            </div>
          )
        })}
      </div>

      {/* Start button */}
      <div style={{ padding: '16px 24px', borderTop: '1px solid #e4e7ec', flexShrink: 0 }}>
        <button disabled={!selected} onClick={() => selected && onStart(selected)}
          style={{ width: '100%', height: 48, backgroundColor: selected ? '#4f46e5' : '#e2e8f0', border: 'none', borderRadius: 12, cursor: selected ? 'pointer' : 'not-allowed', ...font(15, 600, selected ? '#fff' : '#94a3b8') }}>
          {selected ? `Start chat with ${selected.firstName}` : 'Select a contact to start'}
        </button>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function MessagesView() {
  const { data: session } = useSession()
  const token = (session?.user as any)?.accessToken as string | undefined
  // myId is a plain string (set in auth.ts jwt callback as token.id = user.id)
  const myId  = (session?.user as any)?.id as string | undefined

  const [activeTab,     setActiveTab]     = useState('All')
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConv,    setActiveConv]    = useState<Conversation | null>(null)
  const [messages,      setMessages]      = useState<ChatMessage[]>([])
  const [draft,         setDraft]         = useState('')
  const [showNewChat,   setShowNewChat]   = useState(false)
  const [loadingConvs,  setLoadingConvs]  = useState(false)
  const [loadingMsgs,   setLoadingMsgs]   = useState(false)
  const [sending,       setSending]       = useState(false)
  const [sideSearch,    setSideSearch]    = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const activeConvRef = useRef<Conversation | null>(null)
  // Mobile panel-switch: 'list' shows conversation list, 'chat' shows the chat/new-chat panel
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list')

  // Keep ref in sync so SSE callback always reads the latest activeConv
  useEffect(() => { activeConvRef.current = activeConv }, [activeConv])

  // Mobile: switch to chat panel when a conversation is opened or new-chat is shown
  useEffect(() => {
    setMobileView(activeConv || showNewChat ? 'chat' : 'list')
  }, [activeConv, showNewChat])

  // ── Load conversations sidebar ───────────────────────────────────────────
  const loadConversations = useCallback(async () => {
    if (!token) return
    setLoadingConvs(true)
    try {
      const res = await apiFetch(`${apiBase()}/messages/conversations`, token)
      if (res.ok) {
        const body = await res.json()
        // body.data is the array from successResponse; sort newest-first
        const sorted = [...(body.data ?? [])].sort(
          (a: Conversation, b: Conversation) =>
            new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime(),
        )
        setConversations(sorted)
      }
    } catch { /* offline */ }
    setLoadingConvs(false)
  }, [token])

  useEffect(() => { loadConversations() }, [loadConversations])

  // ── SSE real-time connection ─────────────────────────────────────────────
  useEffect(() => {
    if (!token) return
    connectSse(token, (type, data) => {
      if (type === 'new-message') {
        const msg = data as unknown as ChatMessage
        const isActiveConv = activeConvRef.current?.partnerId === msg.senderId

        if (isActiveConv) {
          // Append to chat window
          setMessages(prev => [...prev, msg])
          // Update sidebar in-place: user is reading it → unreadCount stays 0,
          // bubble conversation to top. Avoid calling loadConversations() here
          // because the new message isn't marked-as-read in DB yet, so a
          // re-fetch would incorrectly show unreadCount > 0.
          setConversations(prev => {
            const updated = prev.map(c =>
              c.partnerId === msg.senderId
                ? { ...c, lastMessage: msg.content, lastMessageAt: msg.createdAt, lastMessageMine: false, unreadCount: 0 }
                : c,
            )
            return [...updated].sort(
              (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime(),
            )
          })
          // Mark the incoming message as read on the backend
          apiFetch(
            `${apiBase()}/messages/conversation/${msg.senderId}?limit=1`,
            token,
          ).catch(() => { /* silent — mark-as-read is best-effort */ })
        } else {
          // Message for a different (background) conversation → re-fetch to
          // get the accurate unread count for the sidebar badge.
          loadConversations()
        }
      }
    })
    return () => disconnectSse()
  }, [token, loadConversations])

  // ── Load messages for active conversation ────────────────────────────────
  useEffect(() => {
    if (!activeConv || !token) return
    setLoadingMsgs(true)
    setMessages([])
    apiFetch(
      `${apiBase()}/messages/conversation/${activeConv.partnerId}?limit=50`,
      token,
    )
      .then(r => r.ok ? r.json() : null)
      .then(body => {
        if (body?.data) {
          // API returns newest-first; reverse for oldest-at-top display
          setMessages([...body.data].reverse())
        }
        setLoadingMsgs(false)
        // Zero out unread badge for this conversation in the sidebar
        setConversations(prev =>
          prev.map(c => c.partnerId === activeConv.partnerId ? { ...c, unreadCount: 0 } : c),
        )
      })
      .catch(() => setLoadingMsgs(false))
  }, [activeConv?.partnerId, token])  // depend on partnerId, not the whole object

  // ── Auto-scroll to bottom ────────────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ── Send message ─────────────────────────────────────────────────────────
  const handleSend = async () => {
    const content = draft.trim()
    if (!content || !activeConv || !token || sending) return
    setDraft('')
    setSending(true)

    // Optimistic message — _id is a temp string, senderId is myId (plain string)
    const optimisticId = `opt-${Date.now()}`
    const optimistic: ChatMessage = {
      _id:         optimisticId,
      senderId:    myId ?? '',
      recipientId: activeConv.partnerId,
      content,
      createdAt:   new Date().toISOString(),
      isRead:      false,
    }
    setMessages(prev => [...prev, optimistic])

    try {
      const res = await apiFetch(`${apiBase()}/messages`, token, {
        method: 'POST',
        body: JSON.stringify({ recipientId: activeConv.partnerId, content }),
      })
      if (res.ok) {
        const body = await res.json()
        // body.data._id is now a plain string (fixed in backend send())
        const realId = String(body.data?._id ?? optimisticId)
        setMessages(prev =>
          prev.map(m => m._id === optimisticId ? { ...optimistic, _id: realId } : m),
        )
        // Update last message in sidebar and re-sort so this conversation
        // bubbles to the top of the list
        setConversations(prev => {
          const updated = prev.map(c =>
            c.partnerId === activeConv.partnerId
              ? { ...c, lastMessage: content, lastMessageAt: optimistic.createdAt, lastMessageMine: true }
              : c,
          )
          return [...updated].sort(
            (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime(),
          )
        })
      }
    } catch { /* keep optimistic */ }
    setSending(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  // ── Start new chat ───────────────────────────────────────────────────────
  const handleStartNewChat = (u: AvailableUser) => {
    const newConv: Conversation = {
      partnerId:       u._id,
      firstName:       u.firstName,
      lastName:        u.lastName,
      email:           u.email,
      lastMessage:     '',
      lastMessageAt:   new Date().toISOString(),
      lastMessageMine: false,
      unreadCount:     0,
    }
    setConversations(prev => {
      const exists = prev.find(c => c.partnerId === u._id)
      return exists ? prev : [newConv, ...prev]
    })
    setActiveConv(newConv)
    setShowNewChat(false)
  }

  // ── Filter ───────────────────────────────────────────────────────────────
  const filtered = conversations.filter(c => {
    if (sideSearch && !fullName(c).toLowerCase().includes(sideSearch.toLowerCase())) return false
    if (activeTab === 'Unread') return c.unreadCount > 0
    return true
  })

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`@keyframes spin { from { transform:rotate(0deg) } to { transform:rotate(360deg) } }`}</style>
      <div className="msg-root" style={{ margin: '-24px -28px', height: 'calc(100vh - 72px)', display: 'flex', overflow: 'hidden', backgroundColor: '#fff', borderTop: '1px solid #e4e7ec' }}>

        {/* ── LEFT PANEL ────────────────────────────────────── */}
        <div className={`msg-left${mobileView === 'chat' ? ' msg-mobile-hidden' : ''}`} style={{ width: 416, flexShrink: 0, display: 'flex', flexDirection: 'column', borderRight: '1px solid #e4e7ec', height: '100%' }}>

          {/* Search + compose */}
          <div style={{ padding: '16px 16px 0', display: 'flex', gap: 10, alignItems: 'center' }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, backgroundColor: '#fdfdfd', border: '1px solid #ebebef', borderRadius: 12, padding: '12px 16px', height: 50 }}>
              <img src={iconSearch} alt="" style={{ width: 20, height: 20, flexShrink: 0 }} />
              <input type="text" value={sideSearch} onChange={e => setSideSearch(e.target.value)}
                placeholder="Search" style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', ...font(16, 500, '#818183') }} />
            </div>
            <button onClick={() => setShowNewChat(true)} title="New chat"
              style={{ width: 50, height: 50, flexShrink: 0, backgroundColor: '#4f46e5', border: 'none', borderRadius: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0px 2px 8px rgba(79,70,229,0.3)' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#4338ca' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#4f46e5' }}>
              <img src={iconCompose} alt="New chat" style={{ width: 18, height: 18 }} />
            </button>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', alignItems: 'flex-end', borderBottom: '2px solid #ebebef' }}>
            {TABS.map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                style={{ height: 40, padding: '8px 16px', background: 'none', border: 'none', borderBottom: activeTab === tab ? '2px solid #4f46e5' : '2px solid transparent', marginBottom: -2, cursor: 'pointer', ...font(14, activeTab === tab ? 700 : 500, activeTab === tab ? '#1e293b' : '#818183'), whiteSpace: 'nowrap' as const }}>
                {tab}
              </button>
            ))}
          </div>

          {/* Conversation list */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {loadingConvs ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}><Spinner /></div>
            ) : filtered.length === 0 ? (
              <div style={{ padding: '32px 24px', textAlign: 'center' as const }}>
                <span style={{ ...font(14, 400, '#94a3b8') }}>
                  {sideSearch ? 'No matching conversations' : 'No conversations yet'}
                </span>
              </div>
            ) : filtered.map(conv => {
              const name     = fullName(conv)
              const isActive = activeConv?.partnerId === conv.partnerId && !showNewChat
              return (
                <div key={conv.partnerId}
                  onClick={() => { setActiveConv(conv); setShowNewChat(false) }}
                  style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: 16, borderBottom: '1px solid #e2e8f0', backgroundColor: isActive ? '#eef2ff' : '#fff', borderLeft: isActive ? '3px solid #4f46e5' : '3px solid transparent', cursor: 'pointer' }}>
                  <Avatar name={name} size={48} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
                      <span style={{ flex: 1, ...font(16, 700), lineHeight: '22px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{name}</span>
                      <span style={{ ...font(13, 500, '#94a3b8'), lineHeight: '20px', flexShrink: 0 }}>{fmtTime(conv.lastMessageAt)}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ flex: 1, ...font(14, 400, '#475569'), overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>
                        {conv.lastMessage
                          ? (conv.lastMessageMine ? `You: ${conv.lastMessage}` : conv.lastMessage)
                          : 'Start a conversation'}
                      </span>
                      {conv.unreadCount > 0 && (
                        <div style={{ backgroundColor: '#4f46e5', borderRadius: 9999, padding: '2px 7px', flexShrink: 0 }}>
                          <span style={{ ...font(12, 600, '#fff') }}>{conv.unreadCount}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── RIGHT PANEL ───────────────────────────────────── */}
        <div className={`msg-right${mobileView === 'list' ? ' msg-mobile-hidden' : ''}`} style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        {showNewChat ? (
          <NewChatPanel token={token ?? ''} onClose={() => setShowNewChat(false)} onStart={handleStartNewChat} />

        ) : !activeConv ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: '#fdfdfd' }}>
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none"><rect width="48" height="48" rx="14" fill="#eef2ff"/><path d="M16 18h16M16 24h10" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round"/><path d="M34 28l4 6-6-2-10 2a2 2 0 0 1-2-2v-2" stroke="#4f46e5" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
            <span style={{ ...font(17, 600, '#475569') }}>Select a conversation</span>
            <span style={{ ...font(14, 400, '#94a3b8') }}>or start a new one with the compose button</span>
          </div>

        ) : (
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', height: '100%' }}>

            {/* Chat header */}
            <div style={{ borderBottom: '1px solid #cbd5e1', padding: '14px 24px', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {/* Mobile back button — hidden on desktop via CSS */}
                <button className="msg-back-btn" onClick={() => setMobileView('list')}
                  style={{ display: 'none', width: 36, height: 36, borderRadius: '50%', border: '1px solid #e4e7ec', background: 'none', cursor: 'pointer', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M13 16l-6-6 6-6" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
                <Avatar name={fullName(activeConv)} size={44} />
                <div>
                  <div style={{ ...font(16, 700), lineHeight: '22px' }}>{fullName(activeConv)}</div>
                  <div style={{ ...font(13, 400, '#94a3b8'), lineHeight: '18px' }}>{activeConv.email}</div>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', backgroundColor: '#fdfdfd', padding: '20px 24px', display: 'flex', flexDirection: 'column' }}>
              {loadingMsgs ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                  <Spinner size={32} />
                </div>
              ) : messages.length === 0 ? (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ ...font(15, 400, '#94a3b8') }}>No messages yet — say hello! 👋</span>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {messages.map((msg, i) => {
                    // senderId is a plain string from API, myId is a plain string from session
                    const isMine  = msg.senderId === myId
                    const prevMsg = i > 0 ? messages[i - 1] : null
                    const showDay = !prevMsg || fmtDay(msg.createdAt) !== fmtDay(prevMsg.createdAt)
                    const isOpt   = msg._id.startsWith('opt-')

                    return (
                      <div key={msg._id}>
                        {showDay && (
                          <div style={{ textAlign: 'center' as const, margin: '16px 0 8px' }}>
                            <span style={{ ...font(12, 600, '#94a3b8'), backgroundColor: '#f1f5f9', padding: '3px 10px', borderRadius: 12 }}>
                              {fmtDay(msg.createdAt)}
                            </span>
                          </div>
                        )}
                        <div style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start', marginBottom: 2 }}>
                          <div style={{ backgroundColor: isMine ? '#4f46e5' : '#fff', border: isMine ? 'none' : '1px solid #e2e8f0', borderRadius: isMine ? '16px 16px 4px 16px' : '16px 16px 16px 4px', padding: '10px 14px', maxWidth: '72%', display: 'flex', alignItems: 'flex-end', gap: 8, opacity: isOpt ? 0.75 : 1 }}>
                            <span style={{ ...font(14, isMine ? 500 : 400, isMine ? '#fff' : '#1e293b'), whiteSpace: 'pre-wrap' as const, wordBreak: 'break-word' as const, lineHeight: '20px' }}>{msg.content}</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 3, flexShrink: 0, paddingBottom: 1 }}>
                              <span style={{ ...font(11, 400, isMine ? '#a5b4fc' : '#94a3b8'), whiteSpace: 'nowrap' as const }}>{fmtTime(msg.createdAt)}</span>
                              {isMine && !isOpt && (
                                <img src={msg.isRead ? iconDblCheck : iconCheck} alt="" style={{ width: msg.isRead ? 16 : 12, height: msg.isRead ? 16 : 12 }} />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  <div ref={bottomRef} />
                </div>
              )}
            </div>

            {/* Input bar */}
            <div style={{ backgroundColor: '#fff', padding: '14px 20px', flexShrink: 0, borderTop: '1px solid #e4e7ec' }}>
              <div style={{ backgroundColor: '#fff', border: '1px solid rgba(28,28,28,0.18)', borderRadius: 12, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <button style={{ width: 36, height: 36, borderRadius: '50%', border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <img src={iconPlus} alt="" style={{ width: 22, height: 22 }} />
                </button>
                <input type="text" value={draft} onChange={e => setDraft(e.target.value)} onKeyDown={handleKeyDown}
                  placeholder="Write your message…"
                  style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', ...font(15, 400, '#475569') }} />
                <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                  <button style={{ width: 36, height: 36, borderRadius: '50%', border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img src={iconMic} alt="" style={{ width: 22, height: 22 }} />
                  </button>
                  <button onClick={handleSend} disabled={!draft.trim() || sending}
                    style={{ width: 36, height: 36, borderRadius: '50%', border: 'none', background: draft.trim() ? 'rgba(79,70,229,0.1)' : 'none', cursor: draft.trim() && !sending ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s' }}>
                    {sending
                      ? <Spinner size={20} />
                      : <img src={iconSend} alt="send" style={{ width: 22, height: 22, opacity: draft.trim() ? 1 : 0.35 }} />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        </div>{/* /msg-right */}
      </div>
    </>
  )
}
