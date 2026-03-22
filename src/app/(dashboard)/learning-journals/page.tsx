'use client'

import { useState } from 'react'
import Link from 'next/link'

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

// ── Typography helper ─────────────────────────────────────────────────────────
const FF: React.CSSProperties = { fontFamily: "'Inter', sans-serif", fontFeatureSettings: "'ss01' 1, 'cv01' 1, 'cv11' 1" }
const font = (size: number, weight = 400, color = '#1c1c1c', extra: React.CSSProperties = {}): React.CSSProperties => ({
  ...FF, fontSize: `${size}px`, fontWeight: weight, color, ...extra,
})

// ── Shared field wrapper ──────────────────────────────────────────────────────
const fieldBox: React.CSSProperties = {
  backgroundColor: 'rgba(28,28,28,0.05)',
  border: '1px solid rgba(28,28,28,0.08)',
  borderRadius: '8px',
  padding: '8px 12px',
  display: 'flex', flexDirection: 'column', gap: '3px',
}
const fieldLabel: React.CSSProperties = { ...font(11, 400, 'rgba(28,28,28,0.45)'), lineHeight: '15px' }

// ── New Entry form ────────────────────────────────────────────────────────────
function NewEntryForm({ onCancel }: { onCancel: () => void }) {
  const [offJob, setOffJob] = useState(false)
  const [onJob, setOnJob] = useState(true)

  return (
    <div style={{ padding: '0 14px 14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>

      {/* Title */}
      <div style={fieldBox}>
        <span style={fieldLabel}>Title</span>
        <input
          placeholder="Text"
          style={{ border: 'none', outline: 'none', background: 'transparent', ...font(13, 400, 'rgba(28,28,28,0.4)'), lineHeight: '19px', padding: 0 }}
        />
      </div>

      {/* Category */}
      <div style={{ ...fieldBox, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          <span style={fieldLabel}>Select a category</span>
          <span style={{ ...font(13, 400, 'rgba(28,28,28,0.4)'), lineHeight: '19px' }}>Select</span>
        </div>
        <img src={iconSortUpDown} alt="" style={{ width: '14px', height: '14px', flexShrink: 0 }} />
      </div>

      {/* Date / Time started / Duration / Activity type */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.15fr 1fr 1.25fr', gap: '8px' }}>
        {/* Date */}
        <div style={{ ...fieldBox, cursor: 'pointer' }}>
          <span style={fieldLabel}>Date</span>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <img src={iconCalendar} alt="" style={{ width: '13px', height: '13px', opacity: 0.45 }} />
              <span style={{ ...font(13, 400, 'rgba(28,28,28,0.4)'), lineHeight: '19px' }}>Pick a date</span>
            </div>
            <img src={iconCaretDown} alt="" style={{ width: '14px', height: '14px', opacity: 0.35, flexShrink: 0 }} />
          </div>
        </div>

        {/* Time started */}
        <div style={fieldBox}>
          <span style={fieldLabel}>Time started</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
            <span style={font(13, 400, 'rgba(28,28,28,0.4)')}>HH</span>
            <span style={font(13, 400, 'rgba(28,28,28,0.35)')}>:</span>
            <span style={font(13, 400, 'rgba(28,28,28,0.4)')}>MM</span>
            <div style={{ backgroundColor: '#1c1c1c', borderRadius: '4px', padding: '1px 5px', marginLeft: '5px' }}>
              <span style={font(11, 600, '#fff')}>AM</span>
            </div>
          </div>
        </div>

        {/* Duration */}
        <div style={fieldBox}>
          <span style={fieldLabel}>Duration</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
            <span style={font(13, 400, 'rgba(28,28,28,0.4)')}>HH</span>
            <span style={font(13, 400, 'rgba(28,28,28,0.35)')}>:</span>
            <span style={font(13, 400, 'rgba(28,28,28,0.4)')}>MM</span>
          </div>
        </div>

        {/* Activity type */}
        <div style={fieldBox}>
          <span style={fieldLabel}>Activity type</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
              <img src={offJob ? iconCheckboxOn : iconCheckboxOff} alt="" style={{ width: '15px', height: '15px' }} onClick={() => setOffJob(!offJob)} />
              <span style={font(12, 400, '#1c1c1c')}>Off the job</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
              <img src={onJob ? iconCheckboxOn : iconCheckboxOff} alt="" style={{ width: '15px', height: '15px' }} onClick={() => setOnJob(!onJob)} />
              <span style={font(12, 400, '#1c1c1c')}>On the job</span>
            </label>
          </div>
        </div>
      </div>

      {/* Reflection */}
      <div style={{ ...fieldBox, flexDirection: 'row', gap: '8px', minHeight: '90px', alignItems: 'flex-start' }}>
        <textarea
          placeholder="Type your reflection here"
          style={{
            flex: 1, border: 'none', outline: 'none', resize: 'none',
            background: 'transparent', minHeight: '68px',
            ...font(13, 400, 'rgba(28,28,28,0.4)', { lineHeight: '19px' }),
            padding: 0,
          }}
        />
        <img src={iconQuestion} alt="" style={{ width: '18px', height: '18px', flexShrink: 0, marginTop: '1px' }} />
      </div>

      {/* Action bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '2px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
          {[
            { icon: iconCriteria, label: 'Criteria' },
            { icon: iconLink, label: 'Link activity' },
            { icon: iconLock, label: 'Privacy: Only me' },
          ].map(btn => (
            <button key={btn.label} style={{
              display: 'flex', alignItems: 'center', gap: '4px',
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '4px 7px', borderRadius: '6px',
            }}>
              <img src={btn.icon} alt="" style={{ width: '13px', height: '13px' }} />
              <span style={font(12, 400, '#1c1c1c')}>{btn.label}</span>
            </button>
          ))}
          <button style={{
            display: 'flex', alignItems: 'center', gap: '5px',
            backgroundColor: '#1c1c1c', border: 'none', borderRadius: '6px',
            padding: '5px 10px', cursor: 'pointer', marginLeft: '4px',
          }}>
            <img src={iconUpload} alt="" style={{ width: '13px', height: '13px' }} />
            <span style={font(12, 500, '#fff')}>Upload file</span>
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button onClick={onCancel} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '5px 10px', ...font(13, 400, 'rgba(28,28,28,0.7)') }}>
            Cancel
          </button>
          <button style={{ backgroundColor: '#1c1c1c', border: 'none', borderRadius: '8px', padding: '5px 16px', cursor: 'pointer', ...font(13, 500, '#fff') }}>
            Create
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Existing entry view ───────────────────────────────────────────────────────
function ExistingEntry() {
  return (
    <div style={{ padding: '0 14px 14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {/* Title */}
      <div style={fieldBox}>
        <span style={fieldLabel}>Title</span>
        <span style={{ ...font(13, 400, '#1c1c1c'), lineHeight: '19px' }}>Development task 1</span>
      </div>

      {/* Category */}
      <div style={{ ...fieldBox, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          <span style={fieldLabel}>Select a category</span>
          <span style={{ ...font(13, 400, '#1c1c1c'), lineHeight: '19px' }}>Competition</span>
        </div>
        <img src={iconSortUpDown} alt="" style={{ width: '14px', height: '14px', flexShrink: 0 }} />
      </div>

      {/* Date / Time / Duration / Activity type */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.15fr 1fr 1.25fr', gap: '8px' }}>
        {/* Date */}
        <div style={{ ...fieldBox, cursor: 'pointer' }}>
          <span style={fieldLabel}>Date</span>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <img src={iconCalendar} alt="" style={{ width: '13px', height: '13px', opacity: 0.55 }} />
              <span style={{ ...font(13, 400, '#1c1c1c'), lineHeight: '19px' }}>27 Dec, 2024</span>
            </div>
            <img src={iconCaretDown} alt="" style={{ width: '14px', height: '14px', opacity: 0.4, flexShrink: 0 }} />
          </div>
        </div>

        {/* Time */}
        <div style={fieldBox}>
          <span style={fieldLabel}>Time</span>
          <span style={{ ...font(13, 400, '#1c1c1c'), lineHeight: '19px' }}>10:22 AM</span>
        </div>

        {/* Duration */}
        <div style={fieldBox}>
          <span style={fieldLabel}>Duration</span>
          <span style={{ ...font(13, 400, '#1c1c1c'), lineHeight: '19px' }}>1280 minutes</span>
        </div>

        {/* Activity type */}
        <div style={fieldBox}>
          <span style={fieldLabel}>Activity type</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <img src={iconCheckboxOff} alt="" style={{ width: '15px', height: '15px' }} />
              <span style={font(12, 400, '#1c1c1c')}>Off the job</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <img src={iconCheckboxOn} alt="" style={{ width: '15px', height: '15px' }} />
              <span style={font(12, 400, '#1c1c1c')}>On the job</span>
            </label>
          </div>
        </div>
      </div>

      {/* Reflection */}
      <div style={{ ...fieldBox, flexDirection: 'row', gap: '8px', minHeight: '90px', alignItems: 'flex-start' }}>
        <textarea
          placeholder="Type your reflection here"
          style={{
            flex: 1, border: 'none', outline: 'none', resize: 'none',
            background: 'transparent', minHeight: '68px',
            ...font(13, 400, 'rgba(28,28,28,0.4)', { lineHeight: '19px' }),
            padding: 0,
          }}
        />
        <img src={iconQuestion} alt="" style={{ width: '18px', height: '18px', flexShrink: 0, marginTop: '1px' }} />
      </div>

      {/* Accordion rows */}
      {[
        { icon: iconFile, label: 'Files' },
        { icon: iconRocket, label: 'Learning Activities' },
        { icon: iconCheckSquare, label: 'Criteria' },
      ].map((row, i) => (
        <div key={i} style={{
          backgroundColor: 'rgba(28,28,28,0.05)',
          borderRadius: '8px', padding: '9px 14px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          cursor: 'pointer', border: '1px solid rgba(28,28,28,0.06)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img src={row.icon} alt="" style={{ width: '18px', height: '18px', opacity: 0.8 }} />
            <span style={font(13, 500, '#1c1c1c')}>{row.label}</span>
          </div>
          <div style={{
            backgroundColor: '#c6c7f8',
            minWidth: '20px', height: '20px',
            borderRadius: '10px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '0 6px',
          }}>
            <span style={font(12, 600, '#1c1c1c')}>1</span>
          </div>
        </div>
      ))}

      {/* Bottom: Privacy + edit/delete */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '2px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <img src={iconLock} alt="" style={{ width: '13px', height: '13px' }} />
          <span style={font(12, 400, 'rgba(28,28,28,0.55)')}>Privacy: Only me</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', borderRadius: '6px' }}>
            <img src={iconEdit} alt="Edit" style={{ width: '15px', height: '15px' }} />
          </button>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', borderRadius: '6px' }}>
            <img src={iconDelete} alt="Delete" style={{ width: '15px', height: '15px' }} />
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Entry card ────────────────────────────────────────────────────────────────
function EntryCard({
  expanded,
  onToggle,
  isNew,
  showWelcomeBanner,
}: {
  expanded: boolean
  onToggle: () => void
  isNew?: boolean
  showWelcomeBanner?: boolean
}) {
  return (
    <div style={{
      backgroundColor: '#fff',
      borderRadius: '10px',
      boxShadow: '0px 1px 4px 0px rgba(13,10,44,0.1)',
      border: '1px solid rgba(28,28,28,0.07)',
      overflow: 'hidden',
    }}>
      {/* Header row */}
      <button
        onClick={onToggle}
        style={{
          width: '100%', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', padding: '10px 14px',
          background: 'none', border: 'none', cursor: 'pointer',
          textAlign: 'left' as const,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
          <img src={iconUserAvatar} alt="" style={{ width: '30px', height: '30px', borderRadius: '50%', flexShrink: 0 }} />
          <span style={font(13, 600, '#1c1c1c')}>John Doe</span>
          {showWelcomeBanner && (
            <div style={{
              backgroundColor: '#dcfce7',
              borderRadius: '20px',
              padding: '3px 10px',
              flexShrink: 0,
            }}>
              <span style={font(12, 400, '#166534')}>Welcome back John! Click here to addd a new journal!</span>
            </div>
          )}
        </div>
        <img src={expanded ? iconCaretUp : iconCaretDown} alt="" style={{ width: '20px', height: '20px', flexShrink: 0 }} />
      </button>

      {/* Separator when expanded */}
      {expanded && <div style={{ height: '1px', backgroundColor: 'rgba(28,28,28,0.07)', margin: '0 14px' }} />}

      {/* Expanded body */}
      {expanded && (
        <div style={{ paddingTop: '12px' }}>
          {isNew ? <NewEntryForm onCancel={onToggle} /> : <ExistingEntry />}
        </div>
      )}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function LearningJournalsPage() {
  const [expanded, setExpanded] = useState<Record<number, boolean>>({ 0: false, 1: true, 2: true })
  const toggle = (i: number) => setExpanded(prev => ({ ...prev, [i]: !prev[i] }))

  const items = [
    { date: { day: '24', month: 'Dec', year: '2025' }, idx: 0, isNew: false, showWelcome: true },
    { date: { day: '24', month: 'Dec', year: '2025' }, idx: 1, isNew: true,  showWelcome: false },
    { date: { day: '24', month: 'Dec', year: '2025' }, idx: 2, isNew: false, showWelcome: false },
  ]

  return (
    <div>
      {/* ── Top action bar ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <Link href="/learning-activities/timesheet" style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          backgroundColor: '#fff',
          border: '1px solid rgba(28,28,28,0.15)',
          borderRadius: '8px', padding: '6px 12px',
          cursor: 'pointer', boxShadow: '0px 1px 3px rgba(0,0,0,0.06)',
          textDecoration: 'none',
        }}>
          <img src={iconTimesheetTable} alt="" style={{ width: '14px', height: '14px' }} />
          <span style={font(13, 500, '#1c1c1c')}>Show Timesheet</span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            backgroundColor: '#fff', border: '1px solid rgba(28,28,28,0.15)',
            borderRadius: '8px', padding: '6px 12px', cursor: 'pointer',
            boxShadow: '0px 1px 3px rgba(0,0,0,0.06)',
          }}>
            <span style={font(13, 500, '#1c1c1c')}>Export</span>
            <img src={iconExport} alt="" style={{ width: '13px', height: '13px' }} />
          </button>
          <button style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            backgroundColor: '#fff', border: '1px solid rgba(28,28,28,0.15)',
            borderRadius: '8px', padding: '6px 12px', cursor: 'pointer',
            boxShadow: '0px 1px 3px rgba(0,0,0,0.06)',
          }}>
            <span style={font(13, 500, '#1c1c1c')}>Filters</span>
            <img src={iconFilter} alt="" style={{ width: '13px', height: '13px' }} />
          </button>
        </div>
      </div>

      {/* ── Timeline ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
        {items.map((item, rowIdx) => (
          <div key={item.idx} style={{ display: 'grid', gridTemplateColumns: '58px 30px 1fr', alignItems: 'stretch', marginBottom: '10px' }}>

            {/* Date column */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', paddingRight: '10px', paddingTop: '11px' }}>
              <span style={{ ...font(22, 700, '#1c1c1c'), lineHeight: '26px' }}>{item.date.day}</span>
              <span style={{ ...font(11, 400, '#1c1c1c'), lineHeight: '15px', opacity: 0.7 }}>{item.date.month}</span>
              <span style={{ ...font(11, 400, '#1c1c1c'), lineHeight: '15px', opacity: 0.7 }}>{item.date.year}</span>
            </div>

            {/* Dot + vertical line column */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {/* line above dot */}
              <div style={{
                width: '2px',
                height: rowIdx === 0 ? '14px' : '0',
                backgroundColor: rowIdx === 0 ? 'transparent' : 'rgba(28,28,28,0.15)',
              }} />
              {/* dot */}
              <div style={{
                width: '11px', height: '11px',
                borderRadius: '50%',
                backgroundColor: '#fff',
                border: '2px solid rgba(28,28,28,0.35)',
                flexShrink: 0,
                marginTop: rowIdx === 0 ? '14px' : '0',
              }} />
              {/* line below dot — grows to fill remaining height */}
              <div style={{
                width: '2px',
                flex: 1,
                backgroundColor: rowIdx < items.length - 1 ? 'rgba(28,28,28,0.12)' : 'transparent',
                minHeight: '10px',
              }} />
            </div>

            {/* Card column */}
            <div style={{ paddingLeft: '12px', paddingBottom: '0' }}>
              <EntryCard
                expanded={expanded[item.idx]}
                onToggle={() => toggle(item.idx)}
                isNew={item.isNew}
                showWelcomeBanner={item.showWelcome}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
