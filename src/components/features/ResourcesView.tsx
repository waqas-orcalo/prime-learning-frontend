'use client'

import { useState, useRef, useEffect } from 'react'
import {
  useResources,
  useCreateResource,
  useDeleteResource,
  useToggleBookmark,
  useRecordView,
  useRecordDownload,
  type Resource,
  type ResourceType,
  type ListResourcesParams,
} from '@/hooks/use-resources'

// ── SVG icons ─────────────────────────────────────────────────────────────────
const svg = (s: string) => `data:image/svg+xml,${encodeURIComponent(s)}`

const iconSearch     = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="6.5" cy="6.5" r="4.5" stroke="rgba(28,28,28,0.4)" stroke-width="1.3"/><path d="M10 10l3 3" stroke="rgba(28,28,28,0.4)" stroke-width="1.3" stroke-linecap="round"/></svg>`)
const iconPlus       = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 2v10M2 7h10" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/></svg>`)
const iconFilter     = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1.5 3.5h11M3.5 7h7M5.5 10.5h3" stroke="#1c1c1c" stroke-width="1.3" stroke-linecap="round"/></svg>`)
const iconDownload   = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 9V2M4.5 6.5L7 9l2.5-2.5" stroke="#1c1c1c" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/><path d="M2 10.5v1a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1" stroke="#1c1c1c" stroke-width="1.3" stroke-linecap="round"/></svg>`)
const iconLink       = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5.5 7.5a3 3 0 0 0 4 .3l2-2a2.8 2.8 0 0 0-4-4l-1 1" stroke="#1c1c1c" stroke-width="1.3" stroke-linecap="round"/><path d="M8.5 6.5a3 3 0 0 0-4-.3l-2 2a2.8 2.8 0 0 0 4 4l1-1" stroke="#1c1c1c" stroke-width="1.3" stroke-linecap="round"/></svg>`)
const iconEye        = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 7s2-4.5 6-4.5S13 7 13 7s-2 4.5-6 4.5S1 7 1 7z" stroke="#1c1c1c" stroke-width="1.3"/><circle cx="7" cy="7" r="1.5" stroke="#1c1c1c" stroke-width="1.3"/></svg>`)
const iconDots       = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="3" r="1.2" fill="rgba(28,28,28,0.5)"/><circle cx="8" cy="8" r="1.2" fill="rgba(28,28,28,0.5)"/><circle cx="8" cy="13" r="1.2" fill="rgba(28,28,28,0.5)"/></svg>`)
const iconClose      = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 2l10 10M12 2L2 12" stroke="rgba(28,28,28,0.5)" stroke-width="1.4" stroke-linecap="round"/></svg>`)
const iconCaretDown  = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 6l4 4 4-4" stroke="#1c1c1c" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>`)
const iconEdit       = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9.5 2l2.5 2.5L5.5 11H3v-2.5L9.5 2z" stroke="#1c1c1c" stroke-width="1.1" stroke-linejoin="round"/><path d="M8 3.5l2.5 2.5" stroke="#1c1c1c" stroke-width="1.1"/></svg>`)
const iconDeleteIcon = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 3.5h10M5 3.5V2.5h4v1M5 5.5v5M9 5.5v5M3.5 3.5l.5 8h6l.5-8" stroke="#f43f5e" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round"/></svg>`)
const iconUpload     = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 13V4M7 7l3-3 3 3" stroke="rgba(28,28,28,0.4)" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/><path d="M3 14v2a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2" stroke="rgba(28,28,28,0.4)" stroke-width="1.4" stroke-linecap="round"/></svg>`)
const iconFile       = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M5 2h8.5l4.5 4.5V19a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/><path d="M13.5 2v5H18" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/><path d="M7 10h8M7 13h8M7 16h5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>`)
const iconVideo      = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22" fill="none"><rect x="2" y="4" width="14" height="14" rx="2" stroke="currentColor" stroke-width="1.3"/><path d="M16 8.5l4-2v7l-4-2V8.5z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>`)
const iconLinkLg     = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M9 12a4 4 0 0 0 5.5.4l3-3a4 4 0 0 0-5.7-5.7l-1.5 1.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><path d="M13 10a4 4 0 0 0-5.5-.4l-3 3a4 4 0 0 0 5.7 5.7l1.5-1.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>`)
const iconTemplate   = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22" fill="none"><rect x="2" y="2" width="18" height="18" rx="2" stroke="currentColor" stroke-width="1.3"/><path d="M2 7h18M7 7v13" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>`)
const iconPresent    = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22" fill="none"><rect x="2" y="4" width="18" height="13" rx="2" stroke="currentColor" stroke-width="1.3"/><path d="M11 17v3M8 20h6" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><path d="M7 9l3 3 5-5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>`)
const iconFolder     = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 18 18" fill="none"><path d="M2 4.5A1.5 1.5 0 0 1 3.5 3H7l2 2h5.5A1.5 1.5 0 0 1 16 6.5v7A1.5 1.5 0 0 1 14.5 15h-11A1.5 1.5 0 0 1 2 13.5v-9z" stroke="#f59e0b" stroke-width="1.2" fill="rgba(245,158,11,0.1)"/></svg>`)
const iconBookmark   = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 2h8a1 1 0 0 1 1 1v9l-5-3-5 3V3a1 1 0 0 1 1-1z" stroke="#1c1c1c" stroke-width="1.2" stroke-linejoin="round"/></svg>`)
const iconBmFilled   = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 2h8a1 1 0 0 1 1 1v9l-5-3-5 3V3a1 1 0 0 1 1-1z" stroke="#4f46e5" stroke-width="1.2" fill="#4f46e5" stroke-linejoin="round"/></svg>`)
const iconStar       = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M6.5 1l1.56 3.16L11.5 4.7l-2.5 2.43.59 3.44L6.5 9l-3.09 1.62.59-3.44L1.5 4.7l3.44-.54L6.5 1z" fill="#f59e0b" stroke="#f59e0b" stroke-width="0.8" stroke-linejoin="round"/></svg>`)
const iconSpinner    = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="7" stroke="rgba(28,28,28,0.1)" stroke-width="2.5"/><path d="M10 3a7 7 0 0 1 7 7" stroke="#4f46e5" stroke-width="2.5" stroke-linecap="round"/></svg>`)

// ── Typography & shared styles ─────────────────────────────────────────────────
const FF: React.CSSProperties = { fontFamily: "'Inter', sans-serif", fontFeatureSettings: "'ss01' 1, 'cv01' 1, 'cv11' 1" }
const font = (size: number, weight = 400, color = '#1c1c1c', extra: React.CSSProperties = {}): React.CSSProperties => ({ ...FF, fontSize: `${size}px`, fontWeight: weight, color, ...extra })
const cardStyle: React.CSSProperties = { backgroundColor: '#fff', borderRadius: '16px', boxShadow: '0px 2px 6px 0px rgba(13,10,44,0.08)', overflow: 'hidden' }

function Divider() {
  return <div style={{ width: '100%', height: '1px', backgroundColor: 'rgba(28,28,28,0.08)' }} />
}

// ── Type config ───────────────────────────────────────────────────────────────
const TYPE_CONFIG: Record<ResourceType, { label: string; color: string; bg: string; icon: string }> = {
  DOCUMENT:     { label: 'Document',     color: '#3b82f6', bg: 'rgba(59,130,246,0.1)',  icon: iconFile },
  VIDEO:        { label: 'Video',        color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)',  icon: iconVideo },
  LINK:         { label: 'Link',         color: '#0ea5e9', bg: 'rgba(14,165,233,0.1)',  icon: iconLinkLg },
  TEMPLATE:     { label: 'Template',     color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  icon: iconTemplate },
  PRESENTATION: { label: 'Presentation', color: '#22c55e', bg: 'rgba(34,197,94,0.1)',   icon: iconPresent },
}

type TabCategory = 'All' | 'Documents' | 'Videos' | 'Links' | 'Templates' | 'Presentations'
const TABS: TabCategory[] = ['All', 'Documents', 'Videos', 'Links', 'Templates', 'Presentations']
const TAB_TYPE_MAP: Partial<Record<TabCategory, ResourceType>> = {
  Documents: 'DOCUMENT', Videos: 'VIDEO', Links: 'LINK', Templates: 'TEMPLATE', Presentations: 'PRESENTATION',
}

// ── Subcomponents ─────────────────────────────────────────────────────────────
function TypeBadge({ type }: { type: ResourceType }) {
  const cfg = TYPE_CONFIG[type]
  return (
    <span style={{ ...font(11, 600, cfg.color), backgroundColor: cfg.bg, borderRadius: '20px', padding: '3px 10px', display: 'inline-flex', alignItems: 'center', whiteSpace: 'nowrap' }}>
      {cfg.label}
    </span>
  )
}

function StatCard({ label, value, accent }: { label: string; value: number; accent?: string }) {
  return (
    <div style={{ ...cardStyle, overflow: 'visible', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, minWidth: '130px' }}>
      <span style={{ ...font(12, 500, '#9291A5') }}>{label}</span>
      <span style={{ ...font(26, 700, accent || '#1E1B39'), lineHeight: '32px' }}>{value}</span>
    </div>
  )
}

function ContextMenu({ onEdit, onDelete, onClose }: { onEdit: () => void; onDelete: () => void; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) onClose() }
    document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h)
  }, [onClose])

  const item = (label: string, icon: string, color: string, onClick: () => void) => (
    <button onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px', background: 'none', border: 'none', cursor: 'pointer', width: '100%', ...font(13, 400, color) }}
      onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(28,28,28,0.04)')}
      onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
      <img src={icon} alt="" style={{ width: '14px', height: '14px' }} />{label}
    </button>
  )
  return (
    <div ref={ref} style={{ position: 'absolute', top: '100%', right: 0, zIndex: 50, backgroundColor: '#fff', border: '1px solid rgba(28,28,28,0.1)', borderRadius: '10px', boxShadow: '0px 8px 24px rgba(13,10,44,0.12)', minWidth: '150px', padding: '4px 0', marginTop: '4px' }}>
      {item('Edit', iconEdit, '#1c1c1c', onEdit)}
      {item('Delete', iconDeleteIcon, '#f43f5e', onDelete)}
    </div>
  )
}

// ── Add Resource Modal ─────────────────────────────────────────────────────────
function AddResourceModal({ onClose, onAdd }: { onClose: () => void; onAdd: (payload: Partial<Resource>) => void }) {
  const [form, setForm] = useState({ title: '', description: '', type: 'DOCUMENT' as ResourceType, category: '', tags: '', externalUrl: '' })
  const [dragOver, setDragOver] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim()) return
    onAdd({
      title:       form.title,
      description: form.description,
      type:        form.type,
      category:    form.category || 'General',
      tags:        form.tags.split(',').map((t: string) => t.trim()).filter(Boolean),
      externalUrl: form.externalUrl || undefined,
    })
  }

  const inputStyle: React.CSSProperties = { ...font(14, 400), width: '100%', height: '40px', border: '1px solid #e4e7ec', borderRadius: '10px', padding: '0 14px', backgroundColor: '#fdfdfd', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s ease' }
  const labelStyle: React.CSSProperties = { ...font(12, 500, 'rgba(28,28,28,0.6)'), marginBottom: '6px', display: 'block' }

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.35)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ backgroundColor: '#fff', borderRadius: '16px', width: '100%', maxWidth: '520px', boxShadow: '0px 8px 32px rgba(13,10,44,0.16)', overflow: 'hidden' }}>
        <div style={{ padding: '18px 24px', backgroundColor: '#f4f4f4', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(28,28,28,0.08)' }}>
          <span style={{ ...font(15, 600) }}>Add Resource</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex' }}>
            <img src={iconClose} alt="Close" style={{ width: '14px', height: '14px' }} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={e => { e.preventDefault(); setDragOver(false) }}
            style={{ border: `2px dashed ${dragOver ? '#4f46e5' : 'rgba(28,28,28,0.15)'}`, borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', backgroundColor: dragOver ? 'rgba(79,70,229,0.03)' : 'rgba(28,28,28,0.02)', transition: 'all 0.15s ease', cursor: 'pointer' }}
          >
            <img src={iconUpload} alt="" style={{ width: '32px', height: '32px' }} />
            <span style={{ ...font(13, 500, 'rgba(28,28,28,0.5)') }}>Drag & drop a file, or <span style={{ color: '#4f46e5' }}>browse</span></span>
            <span style={{ ...font(11, 400, 'rgba(28,28,28,0.35)') }}>PDF, DOCX, PPTX, MP4, ZIP up to 200 MB</span>
          </div>

          <div>
            <label style={labelStyle}>Title <span style={{ color: '#f43f5e' }}>*</span></label>
            <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Apprenticeship Standards Handbook"
              style={inputStyle} onFocus={e => (e.target.style.borderColor = '#4f46e5')} onBlur={e => (e.target.style.borderColor = '#e4e7ec')} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={labelStyle}>Type</label>
              <div style={{ position: 'relative' }}>
                <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value as ResourceType }))}
                  style={{ ...inputStyle, appearance: 'none', paddingRight: '32px', cursor: 'pointer' }}>
                  {(Object.keys(TYPE_CONFIG) as ResourceType[]).map(t => <option key={t} value={t}>{TYPE_CONFIG[t].label}</option>)}
                </select>
                <img src={iconCaretDown} alt="" style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', width: '16px', pointerEvents: 'none' }} />
              </div>
            </div>
            <div>
              <label style={labelStyle}>Category</label>
              <input value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} placeholder="e.g. Guides, Policies"
                style={inputStyle} onFocus={e => (e.target.style.borderColor = '#4f46e5')} onBlur={e => (e.target.style.borderColor = '#e4e7ec')} />
            </div>
          </div>

          {form.type === 'LINK' && (
            <div>
              <label style={labelStyle}>External URL</label>
              <input value={form.externalUrl} onChange={e => setForm(p => ({ ...p, externalUrl: e.target.value }))} placeholder="https://…"
                style={inputStyle} onFocus={e => (e.target.style.borderColor = '#4f46e5')} onBlur={e => (e.target.style.borderColor = '#e4e7ec')} />
            </div>
          )}

          <div>
            <label style={labelStyle}>Description</label>
            <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Brief description…" rows={3}
              style={{ ...font(14, 400), width: '100%', border: '1px solid #e4e7ec', borderRadius: '10px', padding: '10px 14px', backgroundColor: '#fdfdfd', outline: 'none', resize: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s ease' }}
              onFocus={e => (e.target.style.borderColor = '#4f46e5')} onBlur={e => (e.target.style.borderColor = '#e4e7ec')} />
          </div>

          <div>
            <label style={labelStyle}>Tags <span style={{ ...font(11, 400, 'rgba(28,28,28,0.4)') }}>(comma separated)</span></label>
            <input value={form.tags} onChange={e => setForm(p => ({ ...p, tags: e.target.value }))} placeholder="e.g. standards, KSB, compliance"
              style={inputStyle} onFocus={e => (e.target.style.borderColor = '#4f46e5')} onBlur={e => (e.target.style.borderColor = '#e4e7ec')} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '4px' }}>
            <button type="button" onClick={onClose}
              style={{ ...font(14, 500), padding: '0 20px', height: '40px', borderRadius: '10px', border: '1px solid rgba(28,28,28,0.15)', backgroundColor: 'transparent', cursor: 'pointer', transition: 'all 0.15s ease' }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(28,28,28,0.04)')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>Cancel
            </button>
            <button type="submit"
              style={{ ...font(14, 600, '#fff'), padding: '0 24px', height: '40px', borderRadius: '10px', border: 'none', backgroundColor: '#1c1c1c', cursor: 'pointer', transition: 'background 0.15s ease' }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#333')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#1c1c1c')}>Add Resource
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Resource Card ─────────────────────────────────────────────────────────────
function ResourceCard({ resource, onBookmark, onDelete, onView, onDownload }: {
  resource: Resource
  onBookmark: (id: string) => void
  onDelete: (id: string) => void
  onView: (id: string) => void
  onDownload: (id: string) => void
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [hovered, setHovered]   = useState(false)
  const cfg = TYPE_CONFIG[resource.type]

  const uploaderName = resource.uploadedBy
    ? `${resource.uploadedBy.firstName} ${resource.uploadedBy.lastName}`
    : 'Unknown'

  const formattedDate = resource.createdAt
    ? new Date(resource.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : ''

  const fileSize = resource.fileSize
    ? resource.fileSize > 1_000_000
      ? `${(resource.fileSize / 1_000_000).toFixed(1)} MB`
      : `${Math.round(resource.fileSize / 1_000)} KB`
    : null

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ ...cardStyle, padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px', transition: 'box-shadow 0.2s ease', boxShadow: hovered ? '0px 4px 16px rgba(13,10,44,0.14)' : '0px 2px 6px rgba(13,10,44,0.08)', position: 'relative' }}
    >
      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
        <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <img src={cfg.icon} alt="" style={{ width: '22px', height: '22px' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' }}>
          {resource.featured && (
            <span style={{ ...font(11, 600, '#f59e0b'), backgroundColor: 'rgba(245,158,11,0.1)', borderRadius: '20px', padding: '2px 8px', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
              <img src={iconStar} alt="" style={{ width: '10px', height: '10px' }} />Featured
            </span>
          )}
          <TypeBadge type={resource.type} />
          <div style={{ position: 'relative' }}>
            <button onClick={() => setMenuOpen(o => !o)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', borderRadius: '6px', display: 'flex', backgroundColor: menuOpen ? 'rgba(28,28,28,0.06)' : 'transparent', transition: 'background 0.15s ease' }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(28,28,28,0.06)')}
              onMouseLeave={e => { if (!menuOpen) e.currentTarget.style.backgroundColor = 'transparent' }}>
              <img src={iconDots} alt="Options" style={{ width: '16px', height: '16px' }} />
            </button>
            {menuOpen && (
              <ContextMenu
                onEdit={() => setMenuOpen(false)}
                onDelete={() => { onDelete(resource._id); setMenuOpen(false) }}
                onClose={() => setMenuOpen(false)}
              />
            )}
          </div>
        </div>
      </div>

      {/* Title + description */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <span style={{ ...font(15, 600, '#1E1B39'), lineHeight: '21px' }}>{resource.title}</span>
        {resource.description && (
          <span style={{ ...font(13, 400, '#9291A5'), lineHeight: '19px' }}>{resource.description}</span>
        )}
      </div>

      {/* Tags */}
      {resource.tags?.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {resource.tags.slice(0, 3).map((tag: string) => (
            <span key={tag} style={{ ...font(11, 400, 'rgba(28,28,28,0.5)'), backgroundColor: 'rgba(28,28,28,0.05)', borderRadius: '6px', padding: '2px 8px' }}>{tag}</span>
          ))}
        </div>
      )}

      <Divider />

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span style={{ ...font(11, 400, '#9291A5') }}>{formattedDate} · {uploaderName}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ ...font(11, 400, 'rgba(28,28,28,0.4)'), display: 'flex', alignItems: 'center', gap: '3px' }}>
              <img src={iconEye} alt="" style={{ width: '11px', height: '11px', opacity: 0.5 }} />{resource.views ?? 0}
            </span>
            {(resource.downloads ?? 0) > 0 && (
              <span style={{ ...font(11, 400, 'rgba(28,28,28,0.4)'), display: 'flex', alignItems: 'center', gap: '3px' }}>
                <img src={iconDownload} alt="" style={{ width: '11px', height: '11px', opacity: 0.5 }} />{resource.downloads}
              </span>
            )}
            {fileSize && <span style={{ ...font(11, 400, 'rgba(28,28,28,0.4)') }}>{fileSize}</span>}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button onClick={() => onBookmark(resource._id)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: '8px', display: 'flex', transition: 'background 0.15s ease' }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(28,28,28,0.06)')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
            <img src={resource.bookmarked ? iconBmFilled : iconBookmark} alt="Bookmark" style={{ width: '14px', height: '14px' }} />
          </button>

          {resource.type === 'LINK' ? (
            <button onClick={() => onView(resource._id)}
              style={{ ...font(12, 500), display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(28,28,28,0.15)', backgroundColor: 'transparent', cursor: 'pointer', transition: 'all 0.15s ease' }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(28,28,28,0.04)')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
              <img src={iconLink} alt="" style={{ width: '12px', height: '12px' }} />Open Link
            </button>
          ) : (
            <button onClick={() => onDownload(resource._id)}
              style={{ ...font(12, 500), display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(28,28,28,0.15)', backgroundColor: 'transparent', cursor: 'pointer', transition: 'all 0.15s ease' }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(28,28,28,0.04)')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
              <img src={iconDownload} alt="" style={{ width: '12px', height: '12px' }} />Download
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function SkeletonCard() {
  const pulse: React.CSSProperties = { backgroundColor: 'rgba(28,28,28,0.06)', borderRadius: '8px', animation: 'pulse 1.5s ease-in-out infinite' }
  return (
    <div style={{ ...cardStyle, padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
        <div style={{ ...pulse, width: '44px', height: '44px', borderRadius: '12px', flexShrink: 0 }} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ ...pulse, height: '14px', width: '60%' }} /><div style={{ ...pulse, height: '12px', width: '30%' }} />
        </div>
      </div>
      <div style={{ ...pulse, height: '13px', width: '90%' }} />
      <div style={{ ...pulse, height: '13px', width: '75%' }} />
      <div style={{ ...pulse, height: '1px', width: '100%' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ ...pulse, height: '12px', width: '40%' }} />
        <div style={{ ...pulse, height: '28px', width: '90px', borderRadius: '8px' }} />
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}`}</style>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ResourcesView() {
  const [activeTab,      setActiveTab]  = useState<TabCategory>('All')
  const [search,         setSearch]     = useState('')
  const [debounced,      setDebounced]  = useState('')
  const [showBookmarked, setBookmarked] = useState(false)
  const [showModal,      setShowModal]  = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 350)
    return () => clearTimeout(t)
  }, [search])

  const params: ListResourcesParams = {
    limit: 50,
    ...(debounced     && { search:     debounced }),
    ...(activeTab !== 'All' && { type: TAB_TYPE_MAP[activeTab] }),
    ...(showBookmarked && { bookmarked: 'true' }),
  }

  const { data, isLoading, isError }  = useResources(params)
  const { data: allData }             = useResources({ limit: 200 })
  const createResource  = useCreateResource()
  const deleteResource  = useDeleteResource()
  const toggleBookmark  = useToggleBookmark()
  const recordView      = useRecordView()
  const recordDownload  = useRecordDownload()

  const resources      = data?.data ?? []
  const all            = allData?.data ?? []
  const countBy        = (t: ResourceType) => all.filter((r: Resource) => r.type === t).length
  const bookmarkedCount = all.filter((r: Resource) => r.bookmarked).length

  const featured = resources.filter((r: Resource) => r.featured)
  const regular  = resources.filter((r: Resource) => !r.featured)
  const showFeaturedSection = featured.length > 0 && !showBookmarked && !debounced && activeTab === 'All'

  return (
    <div style={{ padding: '28px', backgroundColor: '#f7f9fb', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ ...font(22, 700, '#1E1B39'), margin: 0, lineHeight: '30px' }}>Resources</h1>
          <p style={{ ...font(14, 400, '#9291A5'), margin: '4px 0 0', lineHeight: '20px' }}>Browse, share and manage learning materials for your programme.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button onClick={() => setBookmarked(b => !b)}
            style={{ ...font(13, 500, showBookmarked ? '#4f46e5' : '#1c1c1c'), display: 'flex', alignItems: 'center', gap: '6px', padding: '0 16px', height: '40px', borderRadius: '10px', border: `1.5px solid ${showBookmarked ? '#4f46e5' : 'rgba(28,28,28,0.15)'}`, backgroundColor: showBookmarked ? 'rgba(79,70,229,0.06)' : 'transparent', cursor: 'pointer', transition: 'all 0.15s ease' }}>
            <img src={showBookmarked ? iconBmFilled : iconBookmark} alt="" style={{ width: '14px', height: '14px' }} />
            Saved {bookmarkedCount > 0 && `(${bookmarkedCount})`}
          </button>
          <button onClick={() => setShowModal(true)}
            style={{ ...font(13, 600, '#fff'), display: 'flex', alignItems: 'center', gap: '6px', padding: '0 18px', height: '40px', borderRadius: '10px', border: 'none', backgroundColor: '#1c1c1c', cursor: 'pointer', transition: 'background 0.15s ease' }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#333')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#1c1c1c')}>
            <img src={iconPlus} alt="" style={{ width: '14px', height: '14px' }} />Add Resource
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <StatCard label="Total Resources" value={all.length} />
        <StatCard label="Documents"   value={countBy('DOCUMENT')}     accent="#3b82f6" />
        <StatCard label="Videos"      value={countBy('VIDEO')}        accent="#8b5cf6" />
        <StatCard label="Links"       value={countBy('LINK')}         accent="#0ea5e9" />
        <StatCard label="Templates"   value={countBy('TEMPLATE') + countBy('PRESENTATION')} accent="#f59e0b" />
      </div>

      {/* Filter bar */}
      <div style={{ ...cardStyle, overflow: 'visible', padding: '0 20px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap', minHeight: '60px' }}>
        <div style={{ display: 'flex', gap: '2px', overflowX: 'auto' }}>
          {TABS.map(tab => {
            const active = activeTab === tab
            return (
              <button key={tab} onClick={() => setActiveTab(tab)}
                style={{ ...font(13, active ? 600 : 400, active ? '#1c1c1c' : '#9291A5'), padding: '8px 14px', borderRadius: '8px', border: 'none', backgroundColor: active ? 'rgba(28,28,28,0.07)' : 'transparent', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.15s ease' }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.backgroundColor = 'rgba(28,28,28,0.04)' }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.backgroundColor = 'transparent' }}>
                {tab}
              </button>
            )
          })}
        </div>
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <img src={iconSearch} alt="" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '16px', pointerEvents: 'none' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search resources…"
            style={{ ...font(13, 400), height: '36px', paddingLeft: '36px', paddingRight: search ? '32px' : '14px', border: '1px solid rgba(28,28,28,0.12)', borderRadius: '9px', backgroundColor: 'rgba(28,28,28,0.04)', outline: 'none', width: '220px', transition: 'border-color 0.15s ease' }}
            onFocus={e => (e.target.style.borderColor = '#4f46e5')} onBlur={e => (e.target.style.borderColor = 'rgba(28,28,28,0.12)')} />
          {search && (
            <button onClick={() => setSearch('')} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: '2px', display: 'flex' }}>
              <img src={iconClose} alt="Clear" style={{ width: '12px', height: '12px' }} />
            </button>
          )}
        </div>
      </div>

      {/* Results count */}
      {(debounced || showBookmarked || activeTab !== 'All') && !isLoading && (
        <p style={{ ...font(13, 400, '#9291A5'), marginBottom: '16px', marginTop: '-8px' }}>
          {data?.pagination?.total ?? resources.length} result{(data?.pagination?.total ?? resources.length) !== 1 ? 's' : ''}{debounced && ` for "${debounced}"`}
        </p>
      )}

      {/* Error */}
      {isError && (
        <div style={{ ...cardStyle, padding: '40px 24px', textAlign: 'center' }}>
          <span style={{ ...font(14, 400, '#f43f5e') }}>Failed to load resources. Please try again.</span>
        </div>
      )}

      {/* Loading skeletons */}
      {isLoading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !isError && resources.length === 0 && (
        <div style={{ ...cardStyle, padding: '60px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', textAlign: 'center' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '16px', backgroundColor: 'rgba(28,28,28,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src={iconFolder} alt="" style={{ width: '28px', height: '28px' }} />
          </div>
          <span style={{ ...font(16, 600, '#1E1B39') }}>No resources found</span>
          <span style={{ ...font(13, 400, '#9291A5'), maxWidth: '320px', lineHeight: '20px' }}>
            {debounced ? 'Try adjusting your search or filters.' : 'No resources have been added yet. Click "Add Resource" to get started.'}
          </span>
        </div>
      )}

      {/* Featured section */}
      {!isLoading && showFeaturedSection && (
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <img src={iconStar} alt="" style={{ width: '14px', height: '14px' }} />
            <span style={{ ...font(14, 600, '#1E1B39') }}>Featured</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
            {featured.map((r: Resource) => (
              <ResourceCard key={r._id} resource={r} onBookmark={id => toggleBookmark.mutate(id)} onDelete={id => deleteResource.mutate(id)} onView={id => recordView.mutate(id)} onDownload={id => recordDownload.mutate(id)} />
            ))}
          </div>
        </div>
      )}

      {/* All resources */}
      {!isLoading && regular.length > 0 && (
        <div>
          {showFeaturedSection && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <img src={iconFilter} alt="" style={{ width: '14px', height: '14px' }} />
              <span style={{ ...font(14, 600, '#1E1B39') }}>All Resources</span>
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
            {regular.map((r: Resource) => (
              <ResourceCard key={r._id} resource={r} onBookmark={id => toggleBookmark.mutate(id)} onDelete={id => deleteResource.mutate(id)} onView={id => recordView.mutate(id)} onDownload={id => recordDownload.mutate(id)} />
            ))}
          </div>
        </div>
      )}

      {/* Mutation spinner */}
      {(createResource.isPending || deleteResource.isPending) && (
        <div style={{ position: 'fixed', bottom: '24px', right: '24px', backgroundColor: '#fff', borderRadius: '12px', padding: '12px 16px', boxShadow: '0px 4px 16px rgba(13,10,44,0.14)', display: 'flex', alignItems: 'center', gap: '10px', zIndex: 200 }}>
          <img src={iconSpinner} alt="" style={{ width: '20px', height: '20px', animation: 'spin 0.8s linear infinite' }} />
          <span style={{ ...font(13, 500) }}>{createResource.isPending ? 'Adding resource…' : 'Deleting…'}</span>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      )}

      {showModal && <AddResourceModal onClose={() => setShowModal(false)} onAdd={payload => { createResource.mutate(payload); setShowModal(false) }} />}
    </div>
  )
}
