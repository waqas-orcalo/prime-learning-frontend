'use client'

import { useState, Suspense } from 'react'
import { useRouter } from 'next/navigation'

const svg = (s: string) => `data:image/svg+xml,${encodeURIComponent(s)}`
const iconBack = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none"><circle cx="16" cy="16" r="15" stroke="#1c1c1c" stroke-width="1.5"/><path d="M18 11l-5 5 5 5" stroke="#1c1c1c" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`)
const iconCaret = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none"><path d="M2 4.5l4 4 4-4" stroke="#1c1c1c" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`)

const FF = { fontFamily: "'Inter', sans-serif", fontFeatureSettings: "'ss01' 1, 'cv01' 1, 'cv11' 1" } as const
const font = (size: number, weight = 400, color = '#1c1c1c', extra: React.CSSProperties = {}) =>
  ({ ...FF, fontSize: `${size}px`, fontWeight: weight, color, ...extra } as React.CSSProperties)

const SECTIONS = [
  {
    id: 'skills', label: 'Skills',
    items: [
      { id: '1', label: '1. IT', criteria: ['1.1a - Skilled in the use of multiple IT packages', '1.1b - Create proposals', '1.1c - Perform financial processes', '1.1d - Record and analyse data', '1.2 - Examples include ms office or equivalent packages', '1.3 - Able to choose the most appropriate IT solution', '1.4 - Able to update and review databases'] },
      { id: '2', label: '2. Record and Document Production', criteria: ['2.1a - Produces accurate records', '2.1b - Follows procedures for creation', '2.2 - Uses appropriate software'] },
      { id: '3', label: '3. Decision Making', criteria: ['3.1 - Exercises proactivity', '3.2 - Identifies and coordinates solutions'] },
    ]
  },
  {
    id: 'knowledge', label: 'Knowledge',
    items: [
      { id: 'k1', label: 'K1. Organisational Purpose', criteria: ['K1.1 - Understands organisational purpose', 'K1.2 - Business aims and objectives'] },
    ]
  },
  {
    id: 'behaviours', label: 'Behaviours',
    items: [
      { id: 'b1', label: 'B1. Professional', criteria: ['B1.1 - Acts professionally', 'B1.2 - Manages self effectively'] },
    ]
  },
]

function CreateScorecardInner() {
  const router = useRouter()
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())

  const toggleSection = (id: string) => setExpandedSections(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n })
  const toggleItem = (id: string) => setExpandedItems(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n })

  return (
    <div style={{ padding: '24px 28px', maxWidth: 960, ...FF }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, lineHeight: 0 }}>
          <img src={iconBack} width={32} height={32} alt="Back" />
        </button>
        <div>
          <p style={{ ...font(12, 400, '#888'), margin: 0 }}>Scorecard / Create new scorecard</p>
        </div>
      </div>

      {/* Info card */}
      <div style={{ border: '1px solid rgba(28,28,28,0.12)', borderRadius: 12, overflow: 'hidden' }}>

        {/* Card header */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '12px 16px', background: '#f8f9fa', borderBottom: '1px solid rgba(28,28,28,0.08)'
        }}>
          <button onClick={() => router.back()} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, lineHeight: 0 }}>
            <img src={iconBack} width={24} height={24} alt="Back" />
          </button>
          <div>
            <p style={{ ...font(14, 600), margin: 0 }}>Scorecard 1</p>
            <p style={{ ...font(12, 400, '#888'), margin: 0 }}>
              The current scores have been copied from the previous scorecard. Criteria with new journal entries will be highlighted
            </p>
          </div>
        </div>

        {/* Sections */}
        {SECTIONS.map(section => {
          const sExp = expandedSections.has(section.id)
          return (
            <div key={section.id} style={{ borderTop: '1px solid rgba(28,28,28,0.08)' }}>
              <button
                onClick={() => toggleSection(section.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                  padding: '12px 16px', background: '#fff', border: 'none',
                  cursor: 'pointer', justifyContent: 'space-between'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{
                    width: 22, height: 22, borderRadius: '50%', border: '1.5px solid rgba(28,28,28,0.3)',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    ...font(13, 500), flexShrink: 0
                  }}>{sExp ? '−' : '+'}</span>
                  <span style={font(14, 500)}>{section.label}</span>
                </div>
                <img src={iconCaret} width={14} height={14} alt="" style={{ transform: sExp ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
              </button>

              {sExp && section.items.map(item => {
                const iExp = expandedItems.has(item.id)
                return (
                  <div key={item.id} style={{ borderTop: '1px solid rgba(28,28,28,0.05)' }}>
                    <button
                      onClick={() => toggleItem(item.id)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                        padding: '10px 16px 10px 40px', background: '#fafafa', border: 'none',
                        cursor: 'pointer', justifyContent: 'space-between'
                      }}
                    >
                      <span style={font(13, 500)}>{item.label}</span>
                      <img src={iconCaret} width={12} height={12} alt="" style={{ transform: iExp ? 'rotate(180deg)' : 'none' }} />
                    </button>
                    {iExp && (
                      <div style={{ borderTop: '1px solid rgba(28,28,28,0.04)', padding: '8px 0' }}>
                        {item.criteria.map((c, ci) => (
                          <div key={ci} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 16px 8px 56px', borderBottom: '1px solid rgba(28,28,28,0.04)' }}>
                            <span style={font(12, 400, '#444')}>{c}</span>
                            <span style={{ ...font(11, 400, '#aaa'), whiteSpace: 'nowrap' }}>Not scored</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )
        })}

        {/* Footer */}
        <div style={{ padding: '16px', borderTop: '1px solid rgba(28,28,28,0.08)', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button
            onClick={() => router.push('/scorecard')}
            style={{ padding: '9px 20px', background: '#fff', color: '#1c1c1c', border: '1px solid rgba(28,28,28,0.25)', borderRadius: 8, cursor: 'pointer', ...font(13, 500) }}
          >
            Cancel
          </button>
          <button
            style={{ padding: '9px 20px', background: '#1c1c1c', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', ...font(13, 500, '#fff') }}
          >
            Save &amp; Quit
          </button>
          <button
            style={{ padding: '9px 20px', background: '#1c1c1c', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', ...font(13, 500, '#fff') }}
          >
            Submit Scorecard
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Page() {
  return <Suspense><CreateScorecardInner /></Suspense>
}
