'use client'

import { useState, Suspense } from 'react'
import { useRouter } from 'next/navigation'

const svg = (s: string) => `data:image/svg+xml,${encodeURIComponent(s)}`
const iconBack = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none"><circle cx="16" cy="16" r="15" stroke="#1c1c1c" stroke-width="1.5"/><path d="M18 11l-5 5 5 5" stroke="#1c1c1c" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`)
const iconCaret = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none"><path d="M2 4.5l4 4 4-4" stroke="#1c1c1c" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`)
const iconCaretWhite = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none"><path d="M2 4.5l4 4 4-4" stroke="#fff" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`)

const FF = { fontFamily: "'Inter', sans-serif", fontFeatureSettings: "'ss01' 1, 'cv01' 1, 'cv11' 1" } as const
const font = (size: number, weight = 400, color = '#1c1c1c', extra: React.CSSProperties = {}) =>
  ({ ...FF, fontSize: `${size}px`, fontWeight: weight, color, ...extra } as React.CSSProperties)

/* ── Progress badge ── */
type ProgressType = 'C' | 'N' | 'X' | 'P'
const PROGRESS_COLORS: Record<ProgressType, { bg: string; color: string; label: string }> = {
  C: { bg: '#22c55e', color: '#fff', label: 'Counting towards progress' },
  N: { bg: '#ef4444', color: '#fff', label: 'Not required to count towards progress' },
  X: { bg: '#6b7280', color: '#fff', label: 'No progress (Not covered by an learning activity)' },
  P: { bg: '#f59e0b', color: '#fff', label: 'Progress pending (Covered by an learning activity but not yet signed)' },
}

function ProgressBadge({ type }: { type: ProgressType }) {
  const c = PROGRESS_COLORS[type]
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: 24, height: 24, borderRadius: '50%',
      background: c.bg, color: c.color,
      ...font(11, 700, c.color)
    }}>{type}</span>
  )
}

function EvidenceBadge({ label }: { label: string }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      padding: '2px 7px', borderRadius: 4, background: '#1c1c1c',
      ...font(11, 500, '#fff'), whiteSpace: 'nowrap'
    }}>{label}</span>
  )
}

/* ── Tree data ── */
interface Criterion { id: string; text: string; evidence: string[]; progress: ProgressType }
interface SubUnit { id: string; name: string; criteria: Criterion[] }
interface Unit { id: string; name: string; subUnits: SubUnit[] }
interface Section { id: string; name: string; units: Unit[] }

const TREE_DATA: Section[] = [
  {
    id: 's1', name: 'Business Administrator Apprenticeship Standard',
    units: [
      {
        id: 'u1', name: '[Unit 01] Skills',
        subUnits: [
          {
            id: 'su1', name: '[1] IT',
            criteria: [
              { id: 'c1', text: '1.1a. Skilled in the use of multiple IT packages and systems relevant to the organisation in order to: Write letters or email', evidence: ['PRJ 1', 'Q1'], progress: 'C' },
              { id: 'c2', text: '1.1b Create proposals', evidence: ['AS 2'], progress: 'N' },
              { id: 'c3', text: '1.1c Perform financial processes', evidence: ['PRJ 1', 'Q1', 'AS 1'], progress: 'X' },
              { id: 'c4', text: '1.1d Record and analyse data', evidence: ['PRJ 1'], progress: 'P' },
            ]
          },
          { id: 'su2', name: '[2] Record and Document Production', criteria: [] },
          { id: 'su3', name: '[3] Decision Making', criteria: [] },
        ]
      },
      { id: 'u2', name: '[Unit 02] Knowledge', subUnits: [] },
      { id: 'u3', name: '[Unit 03] Behaviours', subUnits: [] },
    ]
  },
  { id: 's2', name: 'Business Administrator Gateway to End Point', units: [] },
  { id: 's3', name: 'NCFE Level 2 Functional Skills Qualification in English (September 2019)', units: [] },
  { id: 's4', name: 'NCFE Level 2 Functional Skills Qualification in Mathematics (September 2019)', units: [] },
  { id: 's5', name: '~ Business Administrator End Point Assessment', units: [] },
]

const BASED_ON_OPTIONS = ['All', 'Criteria', 'Range', 'Knowledge', 'Scop']
const STATUS_OPTIONS = ['Not Complete', 'Not completed', 'Completed', 'Not required', 'Show all']

function Dropdown({
  value, options, onChange, white = false
}: { value: string; options: string[]; onChange: (v: string) => void; white?: boolean }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '5px 10px', borderRadius: 6,
          background: white ? '#fff' : '#1c1c1c',
          border: white ? '1px solid rgba(28,28,28,0.2)' : 'none',
          cursor: 'pointer', ...font(12, 500, white ? '#1c1c1c' : '#fff')
        }}
      >
        {value}
        <img src={white ? iconCaret : iconCaretWhite} width={12} height={12} alt="" />
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, zIndex: 50, marginTop: 4,
          background: '#fff', border: '1px solid rgba(28,28,28,0.12)', borderRadius: 8,
          boxShadow: '0 4px 16px rgba(0,0,0,0.1)', minWidth: 160, overflow: 'hidden'
        }}>
          {options.map(opt => (
            <button
              key={opt}
              onClick={() => { onChange(opt); setOpen(false) }}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                width: '100%', padding: '8px 12px', background: 'none',
                border: 'none', cursor: 'pointer', textAlign: 'left',
                ...font(12, opt === value ? 600 : 400)
              }}
            >
              <span style={{
                width: 14, height: 14, borderRadius: 3,
                border: '1.5px solid rgba(28,28,28,0.3)',
                background: opt === value ? '#1c1c1c' : 'transparent',
                display: 'inline-block', flexShrink: 0
              }} />
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function GapAnalysisInner() {
  const router = useRouter()
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['s1']))
  const [expandedUnits, setExpandedUnits] = useState<Set<string>>(new Set(['u1']))
  const [expandedSubUnits, setExpandedSubUnits] = useState<Set<string>>(new Set(['su1']))
  const [basedOn, setBasedOn] = useState('All')
  const [status, setStatus] = useState('Not Complete')
  const [expandAll, setExpandAll] = useState(false)

  const toggleSection = (id: string) => setExpandedSections(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n })
  const toggleUnit = (id: string) => setExpandedUnits(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n })
  const toggleSubUnit = (id: string) => setExpandedSubUnits(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n })

  const handleExpandAll = () => {
    if (!expandAll) {
      setExpandedSections(new Set(TREE_DATA.map(s => s.id)))
      setExpandedUnits(new Set(TREE_DATA.flatMap(s => s.units.map(u => u.id))))
      setExpandedSubUnits(new Set(TREE_DATA.flatMap(s => s.units.flatMap(u => u.subUnits.map(su => su.id)))))
    } else {
      setExpandedSections(new Set())
      setExpandedUnits(new Set())
      setExpandedSubUnits(new Set())
    }
    setExpandAll(e => !e)
  }

  return (
    <div style={{ padding: '24px 28px', maxWidth: 1100, ...FF }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, lineHeight: 0 }}>
          <img src={iconBack} width={32} height={32} alt="Back" />
        </button>
        <h1 style={font(22, 600)}>Gap Analysis</h1>
      </div>

      {/* Filters bar */}
      <div style={{
        border: '1px solid rgba(28,28,28,0.12)', borderRadius: 10, marginBottom: 16,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 16px', background: '#fafafa'
      }}>
        <span style={font(13, 600)}>Filters</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={font(12, 400, '#555')}>Based on:</span>
          <Dropdown value={basedOn} options={BASED_ON_OPTIONS} onChange={setBasedOn} />
          <span style={font(12, 400, '#555')}>Status:</span>
          <Dropdown value={status} options={STATUS_OPTIONS} onChange={setStatus} />
        </div>
      </div>

      {/* Legend */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 24px',
        border: '1px solid rgba(28,28,28,0.1)', borderRadius: 10, padding: '12px 16px',
        marginBottom: 16
      }}>
        {(Object.entries(PROGRESS_COLORS) as [ProgressType, typeof PROGRESS_COLORS[ProgressType]][]).map(([type, c]) => (
          <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ProgressBadge type={type} />
            <span style={font(12, 400, '#444')}>{c.label}</span>
          </div>
        ))}
      </div>

      {/* Expand all */}
      <div style={{ marginBottom: 12 }}>
        <button
          onClick={handleExpandAll}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '6px 14px', borderRadius: 8, background: '#1c1c1c',
            border: 'none', cursor: 'pointer', ...font(13, 500, '#fff')
          }}
        >
          {expandAll ? 'Collapse all' : 'Expand all'}
          <img src={iconCaretWhite} width={12} height={12} alt="" style={{ transform: expandAll ? 'rotate(180deg)' : 'none' }} />
        </button>
      </div>

      {/* Tree */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {TREE_DATA.map(section => {
          const sExpanded = expandedSections.has(section.id)
          return (
            <div key={section.id} style={{ border: '1px solid rgba(28,28,28,0.1)', borderRadius: 10, overflow: 'hidden' }}>
              {/* Section header */}
              <button
                onClick={() => toggleSection(section.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                  padding: '12px 16px', background: '#fff', border: 'none', cursor: 'pointer',
                  justifyContent: 'space-between'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{
                    width: 22, height: 22, borderRadius: '50%', border: '1.5px solid rgba(28,28,28,0.4)',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    ...font(14, 500, '#1c1c1c'), flexShrink: 0
                  }}>{sExpanded ? '−' : '+'}</span>
                  <span style={font(14, 500)}>{section.name}</span>
                </div>
                <img src={iconCaret} width={14} height={14} alt="" style={{ transform: sExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
              </button>

              {/* Units */}
              {sExpanded && section.units.map(unit => {
                const uExpanded = expandedUnits.has(unit.id)
                return (
                  <div key={unit.id} style={{ borderTop: '1px solid rgba(28,28,28,0.07)' }}>
                    <button
                      onClick={() => toggleUnit(unit.id)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                        padding: '10px 16px 10px 40px', background: '#fafafa', border: 'none',
                        cursor: 'pointer', justifyContent: 'space-between'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{
                          width: 20, height: 20, borderRadius: '50%', border: '1.5px solid rgba(28,28,28,0.3)',
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                          ...font(13, 500), flexShrink: 0
                        }}>{uExpanded ? '−' : '+'}</span>
                        <span style={font(13, 500)}>{unit.name}</span>
                      </div>
                      <img src={iconCaret} width={12} height={12} alt="" style={{ transform: uExpanded ? 'rotate(180deg)' : 'none' }} />
                    </button>

                    {/* Sub-units */}
                    {uExpanded && unit.subUnits.map(sub => {
                      const suExpanded = expandedSubUnits.has(sub.id)
                      return (
                        <div key={sub.id} style={{ borderTop: '1px solid rgba(28,28,28,0.05)' }}>
                          <button
                            onClick={() => toggleSubUnit(sub.id)}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                              padding: '10px 16px 10px 64px', background: '#fff', border: 'none',
                              cursor: 'pointer', justifyContent: 'space-between'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <span style={{
                                width: 18, height: 18, borderRadius: '50%', border: '1.5px solid rgba(28,28,28,0.25)',
                                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                ...font(11, 500), flexShrink: 0
                              }}>{suExpanded ? '−' : '+'}</span>
                              <span style={font(13)}>{sub.name}</span>
                            </div>
                            <img src={iconCaret} width={12} height={12} alt="" style={{ transform: suExpanded ? 'rotate(180deg)' : 'none' }} />
                          </button>

                          {/* Criteria table */}
                          {suExpanded && sub.criteria.length > 0 && (
                            <div style={{ borderTop: '1px solid rgba(28,28,28,0.05)' }}>
                              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                  <tr style={{ background: '#f5f5f5' }}>
                                    <th style={{ padding: '8px 16px 8px 80px', ...font(12, 500, '#555'), textAlign: 'left', borderBottom: '1px solid rgba(28,28,28,0.07)' }}>Criteria</th>
                                    <th style={{ padding: '8px 16px', ...font(12, 500, '#555'), textAlign: 'center', borderBottom: '1px solid rgba(28,28,28,0.07)', whiteSpace: 'nowrap' }}>Supporting Evidence</th>
                                    <th style={{ padding: '8px 16px', ...font(12, 500, '#555'), textAlign: 'center', borderBottom: '1px solid rgba(28,28,28,0.07)' }}>Progress</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {sub.criteria.map(c => (
                                    <tr key={c.id} style={{ borderBottom: '1px solid rgba(28,28,28,0.05)' }}>
                                      <td style={{ padding: '10px 16px 10px 80px', ...font(12), lineHeight: '18px' }}>{c.text}</td>
                                      <td style={{ padding: '10px 16px', textAlign: 'center' }}>
                                        <div style={{ display: 'flex', gap: 4, justifyContent: 'center', flexWrap: 'wrap' }}>
                                          {c.evidence.map((ev, i) => <EvidenceBadge key={i} label={ev} />)}
                                        </div>
                                      </td>
                                      <td style={{ padding: '10px 16px', textAlign: 'center' }}>
                                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                                          <ProgressBadge type={c.progress} />
                                        </div>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function Page() {
  return <Suspense><GapAnalysisInner /></Suspense>
}
