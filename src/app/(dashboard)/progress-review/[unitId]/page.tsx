'use client'

import { useState, Suspense } from 'react'
import { useRouter, useParams } from 'next/navigation'

const svg = (s: string) => `data:image/svg+xml,${encodeURIComponent(s)}`
const iconBack = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none"><circle cx="16" cy="16" r="15" stroke="#1c1c1c" stroke-width="1.5"/><path d="M18 11l-5 5 5 5" stroke="#1c1c1c" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`)
const iconCaret = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none"><path d="M2 4.5l4 4 4-4" stroke="#1c1c1c" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`)

const FF = { fontFamily: "'Inter', sans-serif", fontFeatureSettings: "'ss01' 1, 'cv01' 1, 'cv11' 1" } as const
const font = (size: number, weight = 400, color = '#1c1c1c', extra: React.CSSProperties = {}) =>
  ({ ...FF, fontSize: `${size}px`, fontWeight: weight, color, ...extra } as React.CSSProperties)

const TABS = [
  'Unit 01 Unit Summary',
  'Mock Knowledge Test',
  'Portfolio Based Mock Interview',
  'Project/Improvement Presentation',
  'EPA Confirmation',
]

const SUB_ITEMS = [
  { label: '[1] Mock Knowledge Test', progress: 0 },
  { label: '[2] Portfolio Based Mock Interview', progress: 0 },
  { label: '[3] Project/Improvement Presentation', progress: 0 },
  { label: '[4] EPA Confirmation', progress: 0 },
]

const TOOLBAR_BUTTONS = [
  { icon: '14', label: '' },
  { icon: 'T', label: '' },
  { icon: '●', label: '' },
  { icon: 'B', label: '' },
  { icon: 'I', label: '' },
  { icon: 'U', label: '' },
  { icon: 'S', label: '' },
  { icon: '≡', label: '' },
  { icon: '≣', label: '' },
  { icon: '⊡', label: '' },
  { icon: '⧉', label: '' },
  { icon: '🔗', label: '' },
]

function ProgressUnitDetailsInner() {
  const router = useRouter()
  const params = useParams()
  const [activeTab, setActiveTab] = useState(0)
  const [selectedUnit, setSelectedUnit] = useState(1)
  const [comment, setComment] = useState('')

  return (
    <div style={{ padding: '24px 28px', maxWidth: 1060, ...FF }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, lineHeight: 0 }}>
          <img src={iconBack} width={32} height={32} alt="Back" />
        </button>
        <h1 style={font(22, 600)}>Progress Unit Details</h1>
      </div>

      {/* Unit selector + signed badge */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 16px', background: '#f8f9fa', borderRadius: 10,
        border: '1px solid rgba(28,28,28,0.08)', marginBottom: 16
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={font(13, 500)}>Unit: {selectedUnit}</span>
          <div style={{ position: 'relative' }}>
            <select
              value={selectedUnit}
              onChange={e => setSelectedUnit(Number(e.target.value))}
              style={{ padding: '3px 24px 3px 8px', border: '1px solid rgba(28,28,28,0.2)', borderRadius: 6, ...font(12), background: '#fff', appearance: 'none', cursor: 'pointer' }}
            >
              {[1, 2, 3, 4, 5].map(u => <option key={u} value={u}>{u}</option>)}
            </select>
            <img src={iconCaret} width={10} height={10} alt="" style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          </div>
        </div>
        <span style={font(12, 500, '#16a34a')}>This plan of activity/action has already been signed.</span>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid rgba(28,28,28,0.1)', marginBottom: 20, overflowX: 'auto' }}>
        {TABS.map((tab, i) => (
          <button
            key={i}
            onClick={() => setActiveTab(i)}
            style={{
              padding: '10px 16px', background: 'none', border: 'none',
              borderBottom: activeTab === i ? '2px solid #1c1c1c' : '2px solid transparent',
              cursor: 'pointer', whiteSpace: 'nowrap', marginBottom: -1,
              ...font(13, activeTab === i ? 600 : 400, activeTab === i ? '#1c1c1c' : '#888')
            }}
          >{tab}</button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Meta row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {[
              { label: 'Learner Name', value: 'John doe' },
              { label: 'Learning Aim', value: 'Business Administrator Gateway to End Point' },
              { label: 'Awarding Body Reg.', value: 'Pending' },
            ].map(({ label, value }) => (
              <div key={label}>
                <p style={{ ...font(11, 400, '#888'), margin: '0 0 3px' }}>{label}</p>
                <p style={{ ...font(13), margin: 0 }}>{value}</p>
              </div>
            ))}
          </div>

          {/* Unit heading */}
          <h3 style={{ ...font(14, 600), margin: 0 }}>[Unit 01] Gateway to End Point Assessment</h3>

          {/* Sub-items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {SUB_ITEMS.map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: '1px solid rgba(28,28,28,0.05)' }}>
                <span style={font(13)}>{item.label}</span>
                <span style={font(12, 400, '#888')}>Progress: {item.progress}%</span>
              </div>
            ))}
          </div>

          {/* Related Learning Activities */}
          <div>
            <h4 style={{ ...font(13, 600), margin: '0 0 6px' }}>Related Learning Activities</h4>
            <p style={{ ...font(12, 400, '#888'), margin: '0 0 4px', lineHeight: '18px' }}>
              NB. Secondary methods are encapsulated with square brackets, e.g. [OB1]
            </p>
            <p style={{ ...font(12, 400, '#888'), margin: 0, lineHeight: '18px' }}>
              There are no related learning activities for this Unit - pending learning activities are not included in your portfolio.
            </p>
          </div>

          {/* Attachments */}
          <div>
            <h4 style={{ ...font(13, 600), margin: '0 0 6px' }}>Attachments</h4>
            <p style={font(12, 400, '#aaa')}>Nothing is attached</p>
          </div>

          {/* Feedback & Comments */}
          <div>
            <h4 style={{ ...font(13, 600), margin: '0 0 12px' }}>Feedback &amp; Comments</h4>
            <div style={{ padding: '10px 0', borderTop: '1px solid rgba(28,28,28,0.07)', marginBottom: 12 }}>
              <p style={{ ...font(12, 400, '#555'), margin: '0 0 4px' }}>
                From: Tahmidul Hassan (Trainer) on 10/02/2025 19:49 To: John doe (Learner) Unread
              </p>
              <p style={{ ...font(13), margin: 0 }}>Good job</p>
            </div>

            {/* Rich text area */}
            <div style={{ border: '1px solid rgba(28,28,28,0.15)', borderRadius: 8, overflow: 'hidden' }}>
              <textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="Write here"
                rows={4}
                style={{
                  width: '100%', padding: '12px', border: 'none', outline: 'none',
                  resize: 'none', ...font(13), background: '#fff', boxSizing: 'border-box'
                }}
              />
              {/* Toolbar */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 4, padding: '6px 10px',
                borderTop: '1px solid rgba(28,28,28,0.08)', background: '#fafafa', flexWrap: 'wrap'
              }}>
                {['14 ▾', 'T', '●', 'B', 'I', 'U', 'S', '≡', '≡', '≡', '⊡', '⧉', '🔗'].map((btn, i) => (
                  <button key={i} style={{
                    padding: '3px 6px', background: 'none', border: 'none', cursor: 'pointer',
                    ...font(12), borderRadius: 4, color: '#444'
                  }}>{btn}</button>
                ))}
              </div>
            </div>
          </div>

          {/* Send/Cancel */}
          <div style={{ display: 'flex', gap: 10 }}>
            <button style={{ padding: '9px 20px', background: '#1c1c1c', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', ...font(13, 500, '#fff') }}>
              Send
            </button>
            <button onClick={() => setComment('')} style={{ padding: '9px 20px', background: '#fff', color: '#1c1c1c', border: '1px solid rgba(28,28,28,0.25)', borderRadius: 8, cursor: 'pointer', ...font(13, 500) }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Other tabs placeholder */}
      {activeTab > 0 && (
        <div style={{ padding: '32px', textAlign: 'center' }}>
          <p style={font(14, 400, '#aaa')}>{TABS[activeTab]} — content coming soon</p>
        </div>
      )}
    </div>
  )
}

export default function Page() {
  return <Suspense><ProgressUnitDetailsInner /></Suspense>
}
