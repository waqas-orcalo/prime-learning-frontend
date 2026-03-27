'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'

// ── SVG icons ─────────────────────────────────────────────────────────────────
const svg = (s: string) => `data:image/svg+xml,${encodeURIComponent(s)}`
const iconTimesheetTable = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1.5" y="1.5" width="13" height="13" rx="2" stroke="#1c1c1c" stroke-width="1.2"/><path d="M1.5 5.5h13M6 5.5v9" stroke="#1c1c1c" stroke-width="1.2" stroke-linecap="round"/></svg>`)
const iconExport = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 9V2M4.5 4.5l2.5-2.5 2.5 2.5" stroke="#1c1c1c" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/><path d="M2 9v2a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V9" stroke="#1c1c1c" stroke-width="1.3" stroke-linecap="round"/></svg>`)
const iconFilter = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1.5 3.5h11M3.5 7h7M5.5 10.5h3" stroke="#1c1c1c" stroke-width="1.3" stroke-linecap="round"/></svg>`)
const iconCaretDown = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M5 7.5l5 5 5-5" stroke="#1c1c1c" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`)
const iconCaretUp = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M5 12.5l5-5 5 5" stroke="#1c1c1c" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`)
const iconCalendar = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1.5" y="2.5" width="11" height="10" rx="1.5" stroke="#1c1c1c" stroke-width="1.2"/><path d="M1.5 5.5h11M4.5 1.5v2M9.5 1.5v2" stroke="#1c1c1c" stroke-width="1.2" stroke-linecap="round"/></svg>`)
const iconSortUpDown = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 2v10M4.5 9.5l2.5 2.5 2.5-2.5M4.5 4.5l2.5-2.5 2.5 2.5" stroke="rgba(28,28,28,0.5)" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`)
const iconQuestion = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="7.5" stroke="rgba(28,28,28,0.3)" stroke-width="1.2"/><path d="M7.5 7.2a1.8 1.8 0 1 1 2.16 1.75C9.2 9.1 9 9.55 9 10.2" stroke="rgba(28,28,28,0.3)" stroke-width="1.2" stroke-linecap="round"/><circle cx="9" cy="12.5" r="0.75" fill="rgba(28,28,28,0.3)"/></svg>`)
const iconFile = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M4.5 2.5h6.5l3.5 3.5V15a1 1 0 0 1-1 1h-9a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1z" stroke="#1c1c1c" stroke-width="1.2" stroke-linejoin="round"/><path d="M11 2.5v4h3.5" stroke="#1c1c1c" stroke-width="1.2" stroke-linejoin="round"/></svg>`)
const iconRocket = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 2.5S5 6 5 10h8c0-4-4-7.5-4-7.5z" stroke="#1c1c1c" stroke-width="1.2" stroke-linejoin="round"/><path d="M5 10c-1.5 0-2.5 1-2.5 2.5v.5h5M13 10c1.5 0 2.5 1 2.5 2.5v.5h-5" stroke="#1c1c1c" stroke-width="1.2" stroke-linecap="round"/><path d="M7.5 13v3M10.5 13v3" stroke="#1c1c1c" stroke-width="1.2" stroke-linecap="round"/></svg>`)
const iconCheckSquare = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="2" y="2" width="14" height="14" rx="2.5" stroke="#1c1c1c" stroke-width="1.2"/><path d="M5.5 9l2.5 2.5 5-5" stroke="#1c1c1c" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`)
const iconLock = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 13 13" fill="none"><rect x="2" y="5.5" width="9" height="6.5" rx="1.5" stroke="rgba(28,28,28,0.5)" stroke-width="1.1"/><path d="M4 5.5V4a2.5 2.5 0 0 1 5 0v1.5" stroke="rgba(28,28,28,0.5)" stroke-width="1.1" stroke-linecap="round"/></svg>`)
const iconCriteria = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 13 13" fill="none"><rect x="1" y="1" width="11" height="11" rx="2" stroke="#1c1c1c" stroke-width="1.1"/><path d="M3.5 6.5l2 2 4-4" stroke="#1c1c1c" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round"/></svg>`)
const iconLink = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M5 7a2.8 2.8 0 0 0 3.8.2l2-2a2.7 2.7 0 0 0-3.8-3.8l-1 1" stroke="#1c1c1c" stroke-width="1.1" stroke-linecap="round"/><path d="M8 6a2.8 2.8 0 0 0-3.8-.2l-2 2a2.7 2.7 0 0 0 3.8 3.8l1-1" stroke="#1c1c1c" stroke-width="1.1" stroke-linecap="round"/></svg>`)
const iconUpload = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M6.5 8.5V2.5M4 5l2.5-2.5 2.5 2.5" stroke="#fff" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/><path d="M2 9v1.5a1 1 0 0 0 1 1h7.5a1 1 0 0 0 1-1V9" stroke="#fff" stroke-width="1.2" stroke-linecap="round"/></svg>`)
const iconEdit = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M10.5 2l2.5 2.5-7.5 7.5H3v-2.5l7.5-7.5z" stroke="#1c1c1c" stroke-width="1.1" stroke-linejoin="round"/><path d="M9 3.5l2.5 2.5" stroke="#1c1c1c" stroke-width="1.1"/></svg>`)
const iconDelete = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M2.5 4h10M5.5 4V3h4v1M5.5 6.5v5M9.5 6.5v5M3.5 4l.75 8h7l.75-8" stroke="#1c1c1c" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round"/></svg>`)
const iconCheckboxOff = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 15 15" fill="none"><rect x="1" y="1" width="13" height="13" rx="2.5" stroke="rgba(28,28,28,0.25)" stroke-width="1.2"/></svg>`)
const iconCheckboxOn = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 15 15" fill="none"><rect width="15" height="15" rx="2.5" fill="#1c1c1c"/><path d="M3.5 7.5l3 3 5-5" stroke="#fff" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`)
const iconUserAvatar = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30" fill="none"><rect width="30" height="30" rx="15" fill="rgba(28,28,28,0.08)"/><circle cx="15" cy="11" r="4.5" fill="#9291A5"/><path d="M3 28c0-6.07 5.37-11 12-11s12 4.93 12 11" fill="#9291A5"/></svg>`)
const iconPlus = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 2v10M2 7h10" stroke="#1c1c1c" stroke-width="1.4" stroke-linecap="round"/></svg>`)
const iconClose = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 2l10 10M12 2L2 12" stroke="rgba(28,28,28,0.5)" stroke-width="1.4" stroke-linecap="round"/></svg>`)

// ── Typography ────────────────────────────────────────────────────────────────
const FF: React.CSSProperties = { fontFamily: "'Inter', sans-serif", fontFeatureSettings: "'ss01' 1, 'cv01' 1, 'cv11' 1" }
const font = (size: number, weight = 400, color = '#1c1c1c', extra: React.CSSProperties = {}): React.CSSProperties => ({ ...FF, fontSize: `${size}px`, fontWeight: weight, color, ...extra })

// ── Shared styles ─────────────────────────────────────────────────────────────
const fieldBox: React.CSSProperties = { backgroundColor: 'rgba(28,28,28,0.05)', border: '1px solid rgba(28,28,28,0.08)', borderRadius: '8px', padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: '3px' }
const fieldLabel: React.CSSProperties = { ...font(11, 400, 'rgba(28,28,28,0.45)'), lineHeight: '15px' }

// ── Types ─────────────────────────────────────────────────────────────────────
interface JournalEntry {
  id: string
  title: string
  category: string
  date: string        // YYYY-MM-DD
  timeHH: string      // 01-12
  timeMM: string      // 00-59
  amPm: 'AM' | 'PM'
  durationHH: string
  durationMM: string
  offJob: boolean
  onJob: boolean
  reflection: string
  privacy: 'only_me' | 'everyone'
  files: string[]
  createdAt: string   // ISO
}

const CATEGORIES = ['Competition', 'On the Job', 'Off the Job', 'Training', 'Mentoring', 'Assessment', 'Research']

const emptyForm = (): Omit<JournalEntry, 'id' | 'createdAt'> => ({
  title: '', category: '', date: '', timeHH: '', timeMM: '', amPm: 'AM',
  durationHH: '', durationMM: '', offJob: false, onJob: false,
  reflection: '', privacy: 'only_me', files: [],
})

const INITIAL_ENTRIES: JournalEntry[] = [
  {
    id: '1', title: 'Development task 1', category: 'Competition',
    date: '2024-12-27', timeHH: '10', timeMM: '22', amPm: 'AM',
    durationHH: '21', durationMM: '20',
    offJob: false, onJob: true,
    reflection: '', privacy: 'only_me', files: [],
    createdAt: '2024-12-27T10:22:00Z',
  },
]

// ── Format helpers ────────────────────────────────────────────────────────────
function formatDate(iso: string) {
  if (!iso) return ''
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}
function timelineDate(iso: string) {
  if (!iso) return { day: '--', month: '---', year: '----' }
  const d = new Date(iso + 'T00:00:00')
  return {
    day: d.getDate().toString().padStart(2, '0'),
    month: d.toLocaleString('en-GB', { month: 'short' }),
    year: d.getFullYear().toString(),
  }
}

// ── Category dropdown ─────────────────────────────────────────────────────────
function CategoryDropdown({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])
  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <div
        onClick={() => setOpen(!open)}
        style={{ ...fieldBox, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          <span style={fieldLabel}>Select a category</span>
          <span style={{ ...font(13, 400, value ? '#1c1c1c' : 'rgba(28,28,28,0.4)'), lineHeight: '19px' }}>{value || 'Select'}</span>
        </div>
        <img src={iconSortUpDown} alt="" style={{ width: '14px', height: '14px', flexShrink: 0 }} />
      </div>
      {open && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50,
          backgroundColor: '#fff', border: '1px solid rgba(28,28,28,0.12)',
          borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          marginTop: '4px', overflow: 'hidden',
        }}>
          {CATEGORIES.map(cat => (
            <div
              key={cat}
              onClick={() => { onChange(cat); setOpen(false) }}
              style={{
                padding: '10px 14px', cursor: 'pointer',
                backgroundColor: value === cat ? 'rgba(28,28,28,0.06)' : 'transparent',
                ...font(13, value === cat ? 600 : 400, '#1c1c1c'),
              }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(28,28,28,0.04)')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = value === cat ? 'rgba(28,28,28,0.06)' : 'transparent')}
            >
              {cat}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Entry Form (used for both new and edit) ───────────────────────────────────
function EntryForm({
  form, onChange, onCancel, onSave, saveLabel, saving = false,
}: {
  form: Omit<JournalEntry, 'id' | 'createdAt'>
  onChange: (patch: Partial<typeof form>) => void
  onCancel: () => void
  onSave: () => void
  saveLabel: string
  saving?: boolean
}) {
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).map(f => f.name)
    onChange({ files: [...form.files, ...files] })
    e.target.value = ''
  }
  const removeFile = (name: string) => onChange({ files: form.files.filter(f => f !== name) })

  return (
    <div style={{ padding: '0 14px 14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>

      {/* Title */}
      <div style={fieldBox}>
        <span style={fieldLabel}>Title</span>
        <input
          value={form.title}
          onChange={e => onChange({ title: e.target.value })}
          placeholder="Text"
          style={{ border: 'none', outline: 'none', background: 'transparent', ...font(13, 400, '#1c1c1c'), lineHeight: '19px', padding: 0 }}
        />
      </div>

      {/* Category */}
      <CategoryDropdown value={form.category} onChange={v => onChange({ category: v })} />

      {/* Date / Time / Duration / Activity type */}
      <div className="l-grid-4" style={{ gap: '8px' }}>

        {/* Date */}
        <div style={{ ...fieldBox, position: 'relative' }}>
          <span style={fieldLabel}>Date</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <img src={iconCalendar} alt="" style={{ width: '13px', height: '13px', opacity: 0.5 }} />
            <input
              type="date"
              value={form.date}
              onChange={e => onChange({ date: e.target.value })}
              style={{ border: 'none', outline: 'none', background: 'transparent', ...font(12, 400, '#1c1c1c'), flex: 1, padding: 0, cursor: 'pointer' }}
            />
          </div>
        </div>

        {/* Time started */}
        <div style={fieldBox}>
          <span style={fieldLabel}>Time started</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
            <input
              value={form.timeHH}
              onChange={e => onChange({ timeHH: e.target.value.replace(/\D/g, '').slice(0, 2) })}
              placeholder="HH"
              maxLength={2}
              style={{ border: 'none', outline: 'none', background: 'transparent', ...font(13, 400, '#1c1c1c'), width: '20px', padding: 0, textAlign: 'center' as const }}
            />
            <span style={font(13, 400, 'rgba(28,28,28,0.4)')}>:</span>
            <input
              value={form.timeMM}
              onChange={e => onChange({ timeMM: e.target.value.replace(/\D/g, '').slice(0, 2) })}
              placeholder="MM"
              maxLength={2}
              style={{ border: 'none', outline: 'none', background: 'transparent', ...font(13, 400, '#1c1c1c'), width: '20px', padding: 0, textAlign: 'center' as const }}
            />
            <button
              onClick={() => onChange({ amPm: form.amPm === 'AM' ? 'PM' : 'AM' })}
              style={{ backgroundColor: '#1c1c1c', borderRadius: '4px', padding: '1px 5px', border: 'none', cursor: 'pointer', marginLeft: '3px' }}
            >
              <span style={font(11, 600, '#fff')}>{form.amPm}</span>
            </button>
          </div>
        </div>

        {/* Duration */}
        <div style={fieldBox}>
          <span style={fieldLabel}>Duration</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
            <input
              value={form.durationHH}
              onChange={e => onChange({ durationHH: e.target.value.replace(/\D/g, '').slice(0, 2) })}
              placeholder="HH"
              maxLength={2}
              style={{ border: 'none', outline: 'none', background: 'transparent', ...font(13, 400, '#1c1c1c'), width: '20px', padding: 0, textAlign: 'center' as const }}
            />
            <span style={font(13, 400, 'rgba(28,28,28,0.4)')}>:</span>
            <input
              value={form.durationMM}
              onChange={e => onChange({ durationMM: e.target.value.replace(/\D/g, '').slice(0, 2) })}
              placeholder="MM"
              maxLength={2}
              style={{ border: 'none', outline: 'none', background: 'transparent', ...font(13, 400, '#1c1c1c'), width: '20px', padding: 0, textAlign: 'center' as const }}
            />
          </div>
        </div>

        {/* Activity type */}
        <div style={fieldBox}>
          <span style={fieldLabel}>Activity type</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
              <img src={form.offJob ? iconCheckboxOn : iconCheckboxOff} alt="" style={{ width: '15px', height: '15px' }} onClick={() => onChange({ offJob: !form.offJob })} />
              <span style={font(12, 400, '#1c1c1c')}>Off the job</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
              <img src={form.onJob ? iconCheckboxOn : iconCheckboxOff} alt="" style={{ width: '15px', height: '15px' }} onClick={() => onChange({ onJob: !form.onJob })} />
              <span style={font(12, 400, '#1c1c1c')}>On the job</span>
            </label>
          </div>
        </div>
      </div>

      {/* Reflection */}
      <div style={{ ...fieldBox, flexDirection: 'row', gap: '8px', minHeight: '90px', alignItems: 'flex-start' }}>
        <textarea
          value={form.reflection}
          onChange={e => onChange({ reflection: e.target.value })}
          placeholder="Type your reflection here"
          style={{ flex: 1, border: 'none', outline: 'none', resize: 'none', background: 'transparent', minHeight: '68px', ...font(13, 400, '#1c1c1c', { lineHeight: '19px' }), padding: 0 }}
        />
        <img src={iconQuestion} alt="" style={{ width: '18px', height: '18px', flexShrink: 0, marginTop: '1px' }} />
      </div>

      {/* Attached files */}
      {form.files.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {form.files.map(f => (
            <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: 'rgba(28,28,28,0.06)', borderRadius: '6px', padding: '4px 8px' }}>
              <img src={iconFile} alt="" style={{ width: '12px', height: '12px' }} />
              <span style={font(12, 400, '#1c1c1c')}>{f}</span>
              <img src={iconClose} alt="" style={{ width: '12px', height: '12px', cursor: 'pointer' }} onClick={() => removeFile(f)} />
            </div>
          ))}
        </div>
      )}

      {/* Action bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '2px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
          {[
            { icon: iconCriteria, label: 'Criteria' },
            { icon: iconLink, label: 'Link activity' },
          ].map(btn => (
            <button key={btn.label} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 7px', borderRadius: '6px' }}>
              <img src={btn.icon} alt="" style={{ width: '13px', height: '13px' }} />
              <span style={font(12, 400, '#1c1c1c')}>{btn.label}</span>
            </button>
          ))}
          {/* Privacy toggle */}
          <button
            onClick={() => onChange({ privacy: form.privacy === 'only_me' ? 'everyone' : 'only_me' })}
            style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 7px', borderRadius: '6px' }}
          >
            <img src={iconLock} alt="" style={{ width: '13px', height: '13px' }} />
            <span style={font(12, 400, '#1c1c1c')}>Privacy: {form.privacy === 'only_me' ? 'Only me' : 'Everyone'}</span>
          </button>
          {/* Upload file */}
          <input ref={fileRef} type="file" multiple style={{ display: 'none' }} onChange={handleFileChange} />
          <button
            onClick={() => fileRef.current?.click()}
            style={{ display: 'flex', alignItems: 'center', gap: '5px', backgroundColor: '#1c1c1c', border: 'none', borderRadius: '6px', padding: '5px 10px', cursor: 'pointer', marginLeft: '4px' }}
          >
            <img src={iconUpload} alt="" style={{ width: '13px', height: '13px' }} />
            <span style={font(12, 500, '#fff')}>Upload file</span>
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button onClick={onCancel} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '5px 10px', ...font(13, 400, 'rgba(28,28,28,0.7)') }}>
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={!form.title.trim() || saving}
            style={{ backgroundColor: (form.title.trim() && !saving) ? '#1c1c1c' : 'rgba(28,28,28,0.3)', border: 'none', borderRadius: '8px', padding: '5px 16px', cursor: (form.title.trim() && !saving) ? 'pointer' : 'not-allowed', ...font(13, 500, '#fff'), transition: 'background 0.15s' }}
          >
            {saving ? 'Saving…' : saveLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Entry view (read-only) ────────────────────────────────────────────────────
function EntryView({ entry, onEdit, onDelete }: { entry: JournalEntry; onEdit: () => void; onDelete: () => void }) {
  return (
    <div style={{ padding: '0 14px 14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {/* Title */}
      <div style={fieldBox}>
        <span style={fieldLabel}>Title</span>
        <span style={{ ...font(13, 400, '#1c1c1c'), lineHeight: '19px' }}>{entry.title}</span>
      </div>

      {/* Category */}
      <div style={{ ...fieldBox, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          <span style={fieldLabel}>Select a category</span>
          <span style={{ ...font(13, 400, '#1c1c1c'), lineHeight: '19px' }}>{entry.category}</span>
        </div>
        <img src={iconSortUpDown} alt="" style={{ width: '14px', height: '14px' }} />
      </div>

      {/* Date / Time / Duration / Activity type */}
      <div className="l-grid-4" style={{ gap: '8px' }}>
        <div style={fieldBox}>
          <span style={fieldLabel}>Date</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <img src={iconCalendar} alt="" style={{ width: '13px', height: '13px', opacity: 0.55 }} />
            <span style={{ ...font(13, 400, '#1c1c1c'), lineHeight: '19px' }}>{formatDate(entry.date)}</span>
          </div>
        </div>
        <div style={fieldBox}>
          <span style={fieldLabel}>Time</span>
          <span style={{ ...font(13, 400, '#1c1c1c'), lineHeight: '19px' }}>{entry.timeHH}:{entry.timeMM} {entry.amPm}</span>
        </div>
        <div style={fieldBox}>
          <span style={fieldLabel}>Duration</span>
          <span style={{ ...font(13, 400, '#1c1c1c'), lineHeight: '19px' }}>{entry.durationHH}:{entry.durationMM.padStart(2,'0')} hrs</span>
        </div>
        <div style={fieldBox}>
          <span style={fieldLabel}>Activity type</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <img src={entry.offJob ? iconCheckboxOn : iconCheckboxOff} alt="" style={{ width: '15px', height: '15px' }} />
              <span style={font(12, 400, '#1c1c1c')}>Off the job</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <img src={entry.onJob ? iconCheckboxOn : iconCheckboxOff} alt="" style={{ width: '15px', height: '15px' }} />
              <span style={font(12, 400, '#1c1c1c')}>On the job</span>
            </div>
          </div>
        </div>
      </div>

      {/* Reflection */}
      <div style={{ ...fieldBox, minHeight: '60px' }}>
        <span style={fieldLabel}>Reflection</span>
        <span style={{ ...font(13, 400, entry.reflection ? '#1c1c1c' : 'rgba(28,28,28,0.35)'), lineHeight: '19px' }}>
          {entry.reflection || 'No reflection added'}
        </span>
      </div>

      {/* Files */}
      {entry.files.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {entry.files.map(f => (
            <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: 'rgba(28,28,28,0.06)', borderRadius: '6px', padding: '4px 8px' }}>
              <img src={iconFile} alt="" style={{ width: '12px', height: '12px' }} />
              <span style={font(12, 400, '#1c1c1c')}>{f}</span>
            </div>
          ))}
        </div>
      )}

      {/* Accordion rows */}
      {[
        { icon: iconFile, label: 'Files', count: entry.files.length },
        { icon: iconRocket, label: 'Learning Activities', count: 1 },
        { icon: iconCheckSquare, label: 'Criteria', count: 1 },
      ].map((row) => (
        <div key={row.label} style={{ backgroundColor: 'rgba(28,28,28,0.05)', borderRadius: '8px', padding: '9px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', border: '1px solid rgba(28,28,28,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img src={row.icon} alt="" style={{ width: '18px', height: '18px', opacity: 0.8 }} />
            <span style={font(13, 500, '#1c1c1c')}>{row.label}</span>
          </div>
          {row.count > 0 && (
            <div style={{ backgroundColor: '#c6c7f8', minWidth: '20px', height: '20px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 6px' }}>
              <span style={font(12, 600, '#1c1c1c')}>{row.count}</span>
            </div>
          )}
        </div>
      ))}

      {/* Bottom: Privacy + edit/delete */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '2px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <img src={iconLock} alt="" style={{ width: '13px', height: '13px' }} />
          <span style={font(12, 400, 'rgba(28,28,28,0.55)')}>Privacy: {entry.privacy === 'only_me' ? 'Only me' : 'Everyone'}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <button onClick={onEdit} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', borderRadius: '6px' }} title="Edit">
            <img src={iconEdit} alt="Edit" style={{ width: '15px', height: '15px' }} />
          </button>
          <button onClick={onDelete} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', borderRadius: '6px' }} title="Delete">
            <img src={iconDelete} alt="Delete" style={{ width: '15px', height: '15px' }} />
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Entry card ────────────────────────────────────────────────────────────────
function EntryCard({
  entry, expanded, onToggle, onEdit, onDelete, editForm, onEditChange, onSaveEdit, onCancelEdit, isEditing, saving,
}: {
  entry: JournalEntry; expanded: boolean; onToggle: () => void
  onEdit: () => void; onDelete: () => void
  editForm: Omit<JournalEntry, 'id' | 'createdAt'>
  onEditChange: (p: Partial<typeof editForm>) => void
  onSaveEdit: () => void; onCancelEdit: () => void
  isEditing: boolean; saving?: boolean
}) {
  const tl = timelineDate(entry.date)
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '58px 30px 1fr', marginBottom: '10px' }}>
      {/* Date */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', paddingRight: '10px', paddingTop: '11px' }}>
        <span style={{ ...font(22, 700, '#1c1c1c'), lineHeight: '26px' }}>{tl.day}</span>
        <span style={{ ...font(11, 400, '#1c1c1c'), lineHeight: '15px', opacity: 0.7 }}>{tl.month}</span>
        <span style={{ ...font(11, 400, '#1c1c1c'), lineHeight: '15px', opacity: 0.7 }}>{tl.year}</span>
      </div>
      {/* Dot + line */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ width: '2px', height: '14px', backgroundColor: 'transparent' }} />
        <div style={{ width: '11px', height: '11px', borderRadius: '50%', backgroundColor: '#fff', border: '2px solid rgba(28,28,28,0.35)', flexShrink: 0 }} />
        <div style={{ width: '2px', flex: 1, backgroundColor: 'rgba(28,28,28,0.12)', minHeight: '10px' }} />
      </div>
      {/* Card */}
      <div style={{ paddingLeft: '12px' }}>
        <div style={{ backgroundColor: '#fff', borderRadius: '10px', boxShadow: '0px 1px 4px 0px rgba(13,10,44,0.1)', border: '1px solid rgba(28,28,28,0.07)', overflow: 'hidden' }}>
          <button onClick={onToggle} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' as const }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
              <img src={iconUserAvatar} alt="" style={{ width: '30px', height: '30px', borderRadius: '50%', flexShrink: 0 }} />
              <span style={font(13, 600, '#1c1c1c')}>John Doe</span>
              {!expanded && <span style={{ ...font(12, 400, 'rgba(28,28,28,0.5)'), overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{entry.title}</span>}
            </div>
            <img src={expanded ? iconCaretUp : iconCaretDown} alt="" style={{ width: '20px', height: '20px', flexShrink: 0 }} />
          </button>
          {expanded && <div style={{ height: '1px', backgroundColor: 'rgba(28,28,28,0.07)', margin: '0 14px' }} />}
          {expanded && (
            <div style={{ paddingTop: '12px' }}>
              {isEditing
                ? <EntryForm form={editForm} onChange={onEditChange} onCancel={onCancelEdit} onSave={onSaveEdit} saveLabel="Save" saving={saving} />
                : <EntryView entry={entry} onEdit={onEdit} onDelete={onDelete} />
              }
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── API helpers ───────────────────────────────────────────────────────────────
const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'https://gateway.primecollege.org/api/v1')
const API = `${API_BASE}/learning-journals`

function normaliseEntry(e: any): JournalEntry {
  return { ...e, id: e.id || String(e._id || '') }
}

async function apiFetch<T>(url: string, token?: string, opts?: RequestInit): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json', ...(opts?.headers as Record<string, string> || {}) }
  if (token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch(url, { ...opts, headers })
  const json = await res.json()
  if (!res.ok) throw new Error(json.message || json.error || 'Request failed')
  return json
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function LearningJournalsPage() {
  const { data: session } = useSession()
  const token = (session?.user as any)?.accessToken as string | undefined

  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({})
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForms, setEditForms] = useState<Record<string, Omit<JournalEntry, 'id' | 'createdAt'>>>({})
  const [saving, setSaving] = useState(false)

  // New entry state
  const [showNew, setShowNew] = useState(false)
  const [newForm, setNewForm] = useState(emptyForm())

  // ── Load entries from API ──
  const loadEntries = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await apiFetch<{ data: JournalEntry[] }>(API, token)
      const normalised = (res.data || []).map(normaliseEntry)
      setEntries(normalised)
      // Auto-expand first entry
      if (normalised.length > 0) setExpandedIds({ [normalised[0].id]: true })
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => { loadEntries() }, [loadEntries])

  const toggleExpand = (id: string) => setExpandedIds(p => ({ ...p, [id]: !p[id] }))

  const startEdit = (entry: JournalEntry) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, createdAt, updatedAt, ...rest } = entry as JournalEntry & { updatedAt: string }
    setEditForms(p => ({ ...p, [id]: { ...rest } }))
    setEditingId(id)
    setExpandedIds(p => ({ ...p, [id]: true }))
  }

  const cancelEdit = () => setEditingId(null)

  const saveEdit = async (id: string) => {
    const f = editForms[id]
    if (!f || !f.title.trim()) return
    try {
      setSaving(true)
      const res = await apiFetch<{ data: JournalEntry }>(`${API}/${id}`, token, { method: 'PATCH', body: JSON.stringify(f) })
      setEntries(p => p.map(e => e.id === id ? normaliseEntry(res.data) : e))
      setEditingId(null)
    } catch (e) {
      alert('Failed to save: ' + (e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  const deleteEntry = async (id: string) => {
    if (!confirm('Delete this journal entry?')) return
    try {
      await apiFetch(`${API}/${id}`, token, { method: 'DELETE' })
      setEntries(p => p.filter(e => e.id !== id))
    } catch (e) {
      alert('Failed to delete: ' + (e as Error).message)
    }
  }

  const createEntry = async () => {
    if (!newForm.title.trim()) return
    try {
      setSaving(true)
      const body = { ...newForm, date: newForm.date || new Date().toISOString().slice(0, 10) }
      const res = await apiFetch<{ data: JournalEntry }>(`${API}`, token, { method: 'POST', body: JSON.stringify(body) })
      const created = normaliseEntry(res.data)
      setEntries(p => [created, ...p])
      setExpandedIds(p => ({ ...p, [created.id]: true }))
      setNewForm(emptyForm())
      setShowNew(false)
    } catch (e) {
      alert('Failed to create: ' + (e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  // Compute today's date for timeline
  const todayDate = new Date().toISOString().slice(0, 10)
  const todayTl = timelineDate(todayDate)

  return (
    <div>
      {/* ── Top action bar ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Link href="/learning-journals/timesheet" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: '#fff', border: '1px solid rgba(28,28,28,0.15)', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', boxShadow: '0px 1px 3px rgba(0,0,0,0.06)', textDecoration: 'none' }}>
            <img src={iconTimesheetTable} alt="" style={{ width: '14px', height: '14px' }} />
            <span style={font(13, 500, '#1c1c1c')}>Show Timesheet</span>
          </Link>
          <button
            onClick={() => setShowNew(true)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: '#1c1c1c', border: 'none', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer' }}
          >
            <img src={iconPlus} alt="" style={{ width: '14px', height: '14px', filter: 'invert(1)' }} />
            <span style={font(13, 500, '#fff')}>New Journal</span>
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#fff', border: '1px solid rgba(28,28,28,0.15)', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', boxShadow: '0px 1px 3px rgba(0,0,0,0.06)' }}>
            <span style={font(13, 500, '#1c1c1c')}>Export</span>
            <img src={iconExport} alt="" style={{ width: '13px', height: '13px' }} />
          </button>
          <button style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#fff', border: '1px solid rgba(28,28,28,0.15)', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', boxShadow: '0px 1px 3px rgba(0,0,0,0.06)' }}>
            <span style={font(13, 500, '#1c1c1c')}>Filters</span>
            <img src={iconFilter} alt="" style={{ width: '13px', height: '13px' }} />
          </button>
        </div>
      </div>

      {/* ── New entry card (shown at top when adding) ── */}
      {showNew && (
        <div style={{ display: 'grid', gridTemplateColumns: '58px 30px 1fr', marginBottom: '10px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', paddingRight: '10px', paddingTop: '11px' }}>
            <span style={{ ...font(22, 700, '#1c1c1c'), lineHeight: '26px' }}>{todayTl.day}</span>
            <span style={{ ...font(11, 400, '#1c1c1c'), lineHeight: '15px', opacity: 0.7 }}>{todayTl.month}</span>
            <span style={{ ...font(11, 400, '#1c1c1c'), lineHeight: '15px', opacity: 0.7 }}>{todayTl.year}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: '2px', height: '14px', backgroundColor: 'transparent' }} />
            <div style={{ width: '11px', height: '11px', borderRadius: '50%', backgroundColor: '#1c1c1c', flexShrink: 0 }} />
            <div style={{ width: '2px', flex: 1, backgroundColor: 'rgba(28,28,28,0.12)', minHeight: '10px' }} />
          </div>
          <div style={{ paddingLeft: '12px' }}>
            <div style={{ backgroundColor: '#fff', borderRadius: '10px', boxShadow: '0px 1px 4px 0px rgba(13,10,44,0.1)', border: '1px solid rgba(28,28,28,0.07)', overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderBottom: '1px solid rgba(28,28,28,0.07)' }}>
                <img src={iconUserAvatar} alt="" style={{ width: '30px', height: '30px', borderRadius: '50%' }} />
                <span style={font(13, 600, '#1c1c1c')}>John Doe</span>
                <div style={{ backgroundColor: '#dcfce7', borderRadius: '20px', padding: '3px 10px' }}>
                  <span style={font(12, 400, '#166534')}>New journal entry</span>
                </div>
              </div>
              <div style={{ paddingTop: '12px' }}>
                <EntryForm form={newForm} onChange={p => setNewForm(prev => ({ ...prev, ...p }))} onCancel={() => { setShowNew(false); setNewForm(emptyForm()) }} onSave={createEntry} saveLabel="Create" saving={saving} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Loading / Error ── */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '60px 0', ...font(14, 400, 'rgba(28,28,28,0.4)') }}>Loading journal entries…</div>
      )}
      {error && (
        <div style={{ padding: '16px', backgroundColor: '#fef2f2', borderRadius: '8px', border: '1px solid #fecaca', ...font(13, 400, '#dc2626'), marginBottom: '16px' }}>
          Error: {error} — <button onClick={loadEntries} style={{ background: 'none', border: 'none', cursor: 'pointer', ...font(13, 600, '#dc2626'), textDecoration: 'underline' }}>Retry</button>
        </div>
      )}

      {/* ── Existing entries ── */}
      {!loading && entries.length === 0 && !showNew && (
        <div style={{ textAlign: 'center', padding: '60px 0', ...font(14, 400, 'rgba(28,28,28,0.4)') }}>
          No journal entries yet. Click <strong>New Journal</strong> to add one.
        </div>
      )}

      {entries.map((entry) => (
        <EntryCard
          key={entry.id}
          entry={entry}
          expanded={!!expandedIds[entry.id]}
          onToggle={() => toggleExpand(entry.id)}
          onEdit={() => startEdit(entry)}
          onDelete={() => deleteEntry(entry.id)}
          editForm={editForms[entry.id] || emptyForm()}
          onEditChange={p => setEditForms(prev => ({ ...prev, [entry.id]: { ...(prev[entry.id] || emptyForm()), ...p } }))}
          onSaveEdit={() => saveEdit(entry.id)}
          onCancelEdit={() => cancelEdit()}
          isEditing={editingId === entry.id}
          saving={saving}
        />
      ))}
    </div>
  )
}
