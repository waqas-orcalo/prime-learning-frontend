'use client'

import { useState, useEffect, Suspense, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { apiFetch } from '@/lib/api-client'

/* ── SVG helpers ── */
const svg = (s: string) => `data:image/svg+xml,${encodeURIComponent(s)}`
const iconChevR = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none"><path d="M7 5l5 5-5 5" stroke="#1c1c1c" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`)
const iconChevRW = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none"><path d="M7 5l5 5-5 5" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`)
const iconChevD = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none"><path d="M4 6l4 4 4-4" stroke="#1c1c1c" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`)
const iconChevDW = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none"><path d="M4 6l4 4 4-4" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`)
const iconClose = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none"><path d="M5 5l10 10M15 5L5 15" stroke="#1c1c1c" stroke-width="1.8" stroke-linecap="round"/></svg>`)
const iconPlusCircle = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none"><circle cx="10" cy="10" r="8.5" stroke="#1c1c1c" stroke-width="1.3"/><path d="M10 6.5v7M6.5 10h7" stroke="#1c1c1c" stroke-width="1.5" stroke-linecap="round"/></svg>`)
const iconCheckCircle = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none"><circle cx="10" cy="10" r="8.5" stroke="#22c55e" stroke-width="1.3"/><path d="M6.5 10l2.5 2.5 5-5" stroke="#22c55e" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`)
const iconPaperclip = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none"><path d="M11.5 6.5l-5.5 5.5a3.5 3.5 0 0 1-5-5l6-6a2 2 0 0 1 2.83 2.83L4 9.5a.5.5 0 0 1-.7-.7L8.5 3.5" stroke="#fff" stroke-width="1.2" stroke-linecap="round"/></svg>`)
const iconQuestion = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none"><circle cx="9" cy="9" r="8" stroke="#9291A5" stroke-width="1.2"/><path d="M7 7a2 2 0 1 1 2.5 1.94c-.5.14-.5.56-.5 1.06" stroke="#9291A5" stroke-width="1.2" stroke-linecap="round"/><circle cx="9" cy="13" r=".75" fill="#9291A5"/></svg>`)
const iconCal = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none"><rect x="2" y="3" width="12" height="11" rx="1.5" stroke="#1c1c1c" stroke-width="1.2"/><path d="M2 6.5h12M5.5 1.5v3M10.5 1.5v3" stroke="#1c1c1c" stroke-width="1.2" stroke-linecap="round"/></svg>`)

const FF = { fontFamily: "'Inter', sans-serif", fontFeatureSettings: "'ss01' 1, 'cv01' 1, 'cv11' 1" } as const
const font = (size: number, weight = 400, color = '#1c1c1c', extra: React.CSSProperties = {}) =>
  ({ ...FF, fontSize: `${size}px`, fontWeight: weight, color, ...extra } as React.CSSProperties)

/* ── Types ── */
type Tab = 'Evidence' | 'Feedback & Comments' | 'Visit' | 'Leaning Journals' | 'Declaration & Signatures'

interface CriterionItem {
  id: string
  name: string
  selected: boolean
  expanded: boolean
}

interface Attachment { name: string; size: string }

interface DeclarationSig { checked: boolean; signedAt: string }

/* ── Criteria master data ── */
const CRITERIA_MASTER: CriterionItem[] = [
  { id: 'c1', name: 'Business Administrator Apprenticeship Standard', selected: false, expanded: false },
  { id: 'c2', name: 'Business Administrator Gateway to End Point', selected: false, expanded: false },
  { id: 'c3', name: 'NCFE Level 2 Functional Skills Qualification in English (September 2019)', selected: false, expanded: false },
  { id: 'c4', name: 'NCFE Level 2 Functional Skills Qualification in Mathematics (September 2019)', selected: false, expanded: false },
  { id: 'c5', name: '~ Business Administrator End Point Assessment', selected: false, expanded: false },
]

const VISIT_TYPES = ['Observation', 'Progress Review', 'Employer Visit', 'Initial Assessment', 'EPA Readiness']
const JOURNAL_CATEGORIES = ['Training', 'Mentoring', 'Research', 'On the Job', 'Competition', 'E-Learning']
const PRIVACY_OPTIONS = ['Only Me', 'Everyone']
const METHODS = ['Assignment', 'Classroom Delivery', 'Workshop', 'Observation', 'Mentoring', 'E-Learning', 'Online Course', 'Competition', 'Self-Directed Study']

/* ── Rich Text Toolbar ── */
function Toolbar({ active, onToggle }: { active: string[]; onToggle: (f: string) => void }) {
  const buttons = [
    { key: 'bold', label: 'B', title: 'Bold', style: { fontWeight: 700 } },
    { key: 'italic', label: 'I', title: 'Italic', style: { fontStyle: 'italic' } },
    { key: 'underline', label: 'U', title: 'Underline', style: { textDecoration: 'underline' } },
    { key: 'strike', label: 'S', title: 'Strikethrough', style: { textDecoration: 'line-through' } },
  ]
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 0', borderTop: '1px solid rgba(28,28,28,0.1)', flexWrap: 'wrap' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', border: '1px solid rgba(28,28,28,0.1)', borderRadius: '4px', padding: '3px 6px' }}>
        <span style={{ ...font(12, 400, '#334155', { fontFamily: 'Roboto, sans-serif' }) }}>14</span>
        <img src={iconChevD} alt="" style={{ width: '12px', height: '12px' }} />
      </div>
      <div style={{ width: '1px', height: '20px', backgroundColor: 'rgba(28,28,28,0.1)' }} />
      {buttons.map(btn => (
        <button
          key={btn.key}
          title={btn.title}
          onClick={() => onToggle(btn.key)}
          style={{
            width: '22px', height: '22px', border: `1px solid ${active.includes(btn.key) ? '#1c1c1c' : 'rgba(28,28,28,0.1)'}`,
            borderRadius: '3px', cursor: 'pointer', ...font(12, 600, '#1c1c1c', btn.style),
            backgroundColor: active.includes(btn.key) ? 'rgba(28,28,28,0.08)' : 'transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          {btn.label}
        </button>
      ))}
      <div style={{ width: '1px', height: '20px', backgroundColor: 'rgba(28,28,28,0.1)' }} />
      {['≡', '⁜', '⊞', '</>'].map((lbl, i) => (
        <button key={i} style={{ minWidth: '22px', height: '22px', border: '1px solid rgba(28,28,28,0.1)', borderRadius: '3px', cursor: 'pointer', ...font(11, 400), backgroundColor: 'transparent', padding: '0 3px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{lbl}</button>
      ))}
    </div>
  )
}

/* ── Set Criteria Modal ── */
function SetCriteriaModal({ criteria, onChange, onClose, activityId, token }: {
  criteria: CriterionItem[]
  onChange: (criteria: CriterionItem[]) => void
  onClose: () => void
  activityId: string
  token: string | undefined
}) {
  const [local, setLocal] = useState(criteria)
  const [expandAll, setExpandAll] = useState(false)
  const [evidenceText, setEvidenceText] = useState('')
  const [toolbarActive, setToolbarActive] = useState<string[]>([])
  const [saving, setSaving] = useState(false)

  const toggle = (id: string, field: 'selected' | 'expanded') =>
    setLocal(prev => prev.map(c => c.id === id ? { ...c, [field]: !c[field] } : c))

  const toggleExpandAll = () => {
    setExpandAll(v => !v)
    setLocal(prev => prev.map(c => ({ ...c, expanded: !expandAll })))
  }

  const handleSave = async () => {
    onChange(local)
    setSaving(true)
    try {
      if (token && activityId && activityId !== 'default') {
        await apiFetch<any>(
          `/criteria/activity/${activityId}`,
          token,
          {
            method: 'POST',
            body: JSON.stringify({
              criteria: local
                .filter(c => c.selected)
                .map(c => ({ criteriaId: c.id, evidence: evidenceText || '' })),
            }),
          }
        )
      }
    } catch (err) {
      console.error('Failed to save criteria:', err)
    } finally {
      setSaving(false)
      onClose()
    }
  }

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 1000, backgroundColor: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '820px', maxHeight: '90vh', overflowY: 'auto', backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 8px 32px rgba(13,10,44,0.18)', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ backgroundColor: '#f4f4f4', height: '45px', padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: '12px 12px 0 0', flexShrink: 0 }}>
          <span style={{ ...font(18, 700, '#000', { letterSpacing: '-0.36px' }) }}>Set Criteria</span>
          <button onClick={onClose} style={{ width: '32px', height: '32px', border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px' }}>
            <img src={iconClose} alt="Close" style={{ width: '20px', height: '20px' }} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: '14px', flex: 1 }}>
          {/* Expand all */}
          <button onClick={toggleExpandAll} style={{ alignSelf: 'flex-start', backgroundColor: '#1c1c1c', border: 'none', borderRadius: '8px', padding: '4px 8px', height: '28px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ ...font(14, 400, '#fff') }}>Expand all</span>
            <img src={iconChevDW} alt="" style={{ width: '16px', height: '16px', transform: expandAll ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />
          </button>

          {/* Criteria list */}
          <div style={{ border: '1px solid rgba(28,28,28,0.1)', borderRadius: '8px', overflow: 'hidden' }}>
            {local.map((item, idx) => (
              <div key={item.id}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 12px', borderBottom: idx < local.length - 1 ? '1px solid rgba(28,28,28,0.08)' : 'none', cursor: 'pointer', backgroundColor: '#fff' }}
                  onClick={() => toggle(item.id, 'expanded')}
                >
                  {/* Select toggle */}
                  <button onClick={e => { e.stopPropagation(); toggle(item.id, 'selected') }} style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 0, display: 'flex', flexShrink: 0 }}>
                    <img src={item.selected ? iconCheckCircle : iconPlusCircle} alt="" style={{ width: '22px', height: '22px' }} />
                  </button>
                  <span style={{ ...font(14, item.selected ? 600 : 400, item.selected ? '#1c1c1c' : '#1c1c1c'), flex: 1 }}>{item.name}</span>
                  <img src={iconChevD} alt="" style={{ width: '16px', height: '16px', transform: item.expanded ? 'rotate(180deg)' : 'rotate(-90deg)', transition: 'transform .2s', flexShrink: 0 }} />
                </div>
                {item.expanded && (
                  <div style={{ backgroundColor: 'rgba(28,28,28,0.02)', padding: '12px 16px 12px 48px', borderBottom: idx < local.length - 1 ? '1px solid rgba(28,28,28,0.06)' : 'none' }}>
                    <p style={{ ...font(13, 400, 'rgba(28,28,28,0.6)'), margin: 0 }}>
                      This criterion covers the competencies and knowledge required for {item.name}. Select this to link this learning activity to the relevant apprenticeship standard criteria.
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Evidence sub-section */}
          <div style={{ backgroundColor: '#f4f4f4', borderRadius: '12px', height: '45px', padding: '0 16px', display: 'flex', alignItems: 'center' }}>
            <span style={{ ...font(18, 700, '#000', { letterSpacing: '-0.36px' }) }}>Evidence</span>
          </div>
          <div style={{ backgroundColor: 'rgba(28,28,28,0.05)', border: '1px solid rgba(28,28,28,0.1)', borderRadius: '8px', padding: '16px 20px 0', minHeight: '160px', display: 'flex', flexDirection: 'column' }}>
            <textarea
              value={evidenceText}
              onChange={e => setEvidenceText(e.target.value)}
              placeholder="Write here"
              style={{ flex: 1, minHeight: '100px', border: 'none', outline: 'none', resize: 'none', background: 'transparent', ...font(14, 400, evidenceText ? '#1c1c1c' : 'rgba(28,28,28,0.2)') }}
            />
            <Toolbar active={toolbarActive} onToggle={k => setToolbarActive(prev => prev.includes(k) ? prev.filter(x => x !== k) : [...prev, k])} />
          </div>

          {/* Footer */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px' }}>
            <button onClick={handleSave} style={{ backgroundColor: '#1c1c1c', border: 'none', borderRadius: '8px', height: '28px', padding: '0 12px', cursor: 'pointer', ...font(14, 400, '#fff') }}>Save &amp; Quit</button>
            <button onClick={handleSave} style={{ backgroundColor: '#1c1c1c', border: 'none', borderRadius: '8px', height: '28px', padding: '0 12px', cursor: 'pointer', ...font(14, 400, '#fff') }}>Save</button>
            <button onClick={onClose} style={{ border: '1px solid rgba(28,28,28,0.1)', borderRadius: '8px', height: '28px', padding: '0 12px', cursor: 'pointer', background: 'transparent', ...font(14, 400) }}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Sidebar ── */
function Sidebar({ activeTab, onTabChange }: { activeTab: Tab; onTabChange: (t: Tab) => void }) {
  const tabs: Tab[] = ['Evidence', 'Feedback & Comments', 'Visit', 'Leaning Journals', 'Declaration & Signatures']
  return (
    <div style={{ width: '260px', flexShrink: 0, backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 2px 6px rgba(13,10,44,0.08)', padding: '16px' }}>
      <div style={{ ...font(15, 700), marginBottom: '10px' }}>Information &amp; Options</div>
      {tabs.map(tab => {
        const active = activeTab === tab
        return (
          <div
            key={tab}
            onClick={() => onTabChange(tab)}
            style={{ display: 'flex', alignItems: 'center', padding: '10px 12px', marginBottom: '3px', backgroundColor: active ? '#1c1c1c' : 'transparent', borderRadius: '8px', cursor: 'pointer' }}
          >
            <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: `2px solid ${active ? '#fff' : '#1c1c1c'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '10px', flexShrink: 0 }}>
              <span style={{ ...font(10, 700, active ? '#fff' : '#1c1c1c') }}>+</span>
            </div>
            <span style={{ ...font(13, 400, active ? '#fff' : '#1c1c1c'), flex: 1 }}>{tab}</span>
            <img src={active ? iconChevRW : iconChevR} alt="" style={{ width: '14px', height: '14px' }} />
          </div>
        )
      })}
    </div>
  )
}

/* ── Tab: Evidence ── */
function TabEvidence({ data, onChange, activityId, token }: { data: { content: string; attachments: Attachment[]; toolbarActive: string[], evidenceId: string }; onChange: (d: any) => void; activityId: string; token: string | undefined }) {
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      if (token && activityId && activityId !== 'default') {
        const isUpdate = data.evidenceId
        if (isUpdate) {
          await apiFetch<any>(
            `/learning-activities/evidence/${data.evidenceId}`,
            token,
            {
              method: 'PATCH',
              body: JSON.stringify({ content: data.content }),
            }
          )
        } else {
          const response = await apiFetch<any>(
            '/learning-activities/evidence',
            token,
            {
              method: 'POST',
              body: JSON.stringify({
                learningActivityId: activityId,
                content: data.content,
              }),
            }
          )
          onChange({ ...data, evidenceId: response.data._id })
        }
      }
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      console.error('Failed to save evidence:', err)
    } finally {
      setSaving(false)
    }
  }
  return (
    <div style={{ padding: '20px' }}>
      <div style={{ ...font(16, 700), marginBottom: '14px' }}>Evidence</div>
      <div style={{ backgroundColor: 'rgba(28,28,28,0.04)', border: '1px solid rgba(28,28,28,0.1)', borderRadius: '8px', padding: '16px 20px 0', marginBottom: '14px' }}>
        <textarea
          value={data.content}
          onChange={e => onChange({ ...data, content: e.target.value })}
          placeholder="Write here"
          rows={6}
          style={{ width: '100%', border: 'none', outline: 'none', resize: 'none', background: 'transparent', boxSizing: 'border-box', ...font(14, 400, data.content ? '#1c1c1c' : 'rgba(28,28,28,0.3)') }}
        />
        <Toolbar active={data.toolbarActive} onToggle={k => onChange({ ...data, toolbarActive: data.toolbarActive.includes(k) ? data.toolbarActive.filter((x: string) => x !== k) : [...data.toolbarActive, k] })} />
      </div>

      {/* Attachments */}
      {data.attachments.length > 0 && (
        <div style={{ marginBottom: '12px' }}>
          <div style={{ ...font(12, 500, 'rgba(28,28,28,0.6)'), marginBottom: '6px' }}>Attached files</div>
          {data.attachments.map((a, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 10px', backgroundColor: 'rgba(28,28,28,0.04)', borderRadius: '6px', marginBottom: '4px' }}>
              <span style={{ ...font(13), flex: 1 }}>{a.name}</span>
              <span style={{ ...font(12, 400, 'rgba(28,28,28,0.5)') }}>{a.size}</span>
              <button onClick={() => onChange({ ...data, attachments: data.attachments.filter((_: any, j: number) => j !== i) })} style={{ border: 'none', background: 'transparent', cursor: 'pointer', ...font(14, 400, '#ef4444'), lineHeight: 1 }}>×</button>
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <label style={{ backgroundColor: '#1c1c1c', border: 'none', borderRadius: '8px', padding: '6px 14px', cursor: 'pointer', ...font(13, 500, '#fff'), display: 'flex', alignItems: 'center', gap: '5px' }}>
          <img src={iconPaperclip} alt="" style={{ width: '13px', height: '13px' }} />
          Add Attachments
          <input type="file" multiple hidden onChange={e => {
            const files = Array.from(e.target.files || []).map(f => ({ name: f.name, size: (f.size / 1024).toFixed(0) + 'KB' }))
            onChange({ ...data, attachments: [...data.attachments, ...files] })
            e.target.value = ''
          }} />
        </label>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={handleSave} disabled={saving} style={{ backgroundColor: saving ? 'rgba(28,28,28,0.4)' : '#1c1c1c', border: 'none', borderRadius: '8px', padding: '6px 16px', cursor: saving ? 'not-allowed' : 'pointer', ...font(13, 500, '#fff') }}>Save &amp; Quit</button>
          <button onClick={handleSave} disabled={saving} style={{ backgroundColor: saving ? 'rgba(28,28,28,0.4)' : '#1c1c1c', border: 'none', borderRadius: '8px', padding: '6px 16px', cursor: saving ? 'not-allowed' : 'pointer', ...font(13, 500, '#fff') }}>
            {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save'}
          </button>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px 12px', ...font(13, 500) }}>Cancel</button>
        </div>
      </div>
    </div>
  )
}

/* ── Tab: Feedback ── */
function TabFeedback({ data, onChange, activityId, token }: { data: { content: string; toolbarActive: string[] }; onChange: (d: any) => void; activityId: string; token: string | undefined }) {
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      if (token && activityId && activityId !== 'default') {
        await apiFetch<any>(
          '/learning-activities/feedback-comments',
          token,
          {
            method: 'POST',
            body: JSON.stringify({
              learningActivityId: activityId,
              content: data.content,
              type: 'FEEDBACK',
            }),
          }
        )
      }
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      console.error('Failed to save feedback:', err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ ...font(16, 700), marginBottom: '14px' }}>Feedback &amp; Comments</div>
      <div style={{ backgroundColor: 'rgba(28,28,28,0.04)', border: '1px solid rgba(28,28,28,0.1)', borderRadius: '8px', padding: '16px 20px 0', marginBottom: '14px' }}>
        <textarea value={data.content} onChange={e => onChange({ ...data, content: e.target.value })} placeholder="Write feedback here" rows={6} style={{ width: '100%', border: 'none', outline: 'none', resize: 'none', background: 'transparent', boxSizing: 'border-box', ...font(14, 400, data.content ? '#1c1c1c' : 'rgba(28,28,28,0.3)') }} />
        <Toolbar active={data.toolbarActive} onToggle={k => onChange({ ...data, toolbarActive: data.toolbarActive.includes(k) ? data.toolbarActive.filter((x: string) => x !== k) : [...data.toolbarActive, k] })} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
        <button onClick={handleSave} disabled={saving} style={{ backgroundColor: saving ? 'rgba(28,28,28,0.4)' : '#1c1c1c', border: 'none', borderRadius: '8px', padding: '6px 16px', cursor: saving ? 'not-allowed' : 'pointer', ...font(13, 500, '#fff') }}>Save &amp; Quit</button>
        <button onClick={handleSave} disabled={saving} style={{ backgroundColor: saving ? 'rgba(28,28,28,0.4)' : '#1c1c1c', border: 'none', borderRadius: '8px', padding: '6px 16px', cursor: saving ? 'not-allowed' : 'pointer', ...font(13, 500, '#fff') }}>{saving ? 'Saving…' : saved ? '✓ Saved' : 'Save'}</button>
        <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px 12px', ...font(13, 500) }}>Cancel</button>
      </div>
    </div>
  )
}

/* ── Tab: Visit ── */
interface VisitData { visitType: string; travelTime: string; notes: string }
function TabVisit({ data, onChange, activityId, token }: { data: VisitData; onChange: (d: VisitData) => void; activityId: string; token: string | undefined }) {
  const [typeOpen, setTypeOpen] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      if (token && activityId && activityId !== 'default') {
        await apiFetch<any>(
          '/learning-activities/visit',
          token,
          {
            method: 'POST',
            body: JSON.stringify({
              learningActivityId: activityId,
              visitType: mapVisitTypeToEnum(data.visitType),
              visitDate: new Date().toISOString().split('T')[0],
              durationMinutes: 0,
              travelTimeMinutes: Number(data.travelTime) || 0,
              transportMode: 'CAR',
              startLocation: '',
              endLocation: '',
              notes: data.notes,
            }),
          }
        )
      }
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      console.error('Failed to save visit:', err)
    } finally {
      setSaving(false)
    }
  }

  function mapVisitTypeToEnum(type: string): string {
    const map: Record<string, string> = {
      'Observation': 'OBSERVATION',
      'Progress Review': 'PROGRESS_REVIEW',
      'Employer Visit': 'EMPLOYER_VISIT',
      'Initial Assessment': 'INITIAL_ASSESSMENT',
      'EPA Readiness': 'EPA_READINESS',
      'Remote Visit': 'REMOTE_VISIT',
    }
    return map[type] || type
  }
  return (
    <div style={{ padding: '20px' }}>
      <div style={{ ...font(16, 700), marginBottom: '14px' }}>Visit</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
        {/* Visit Type */}
        <div style={{ position: 'relative' }}>
          <div style={{ ...font(12, 500, 'rgba(28,28,28,0.6)'), marginBottom: '5px' }}>Visit Type</div>
          <div onClick={() => setTypeOpen(v => !v)} style={{ backgroundColor: 'rgba(28,28,28,0.05)', border: '1px solid rgba(28,28,28,0.1)', borderRadius: '8px', padding: '10px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ ...font(14, 400, data.visitType ? '#1c1c1c' : 'rgba(28,28,28,0.4)') }}>{data.visitType || 'Select type'}</span>
            <img src={iconChevD} alt="" style={{ width: '14px', height: '14px' }} />
          </div>
          {typeOpen && (
            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '4px', backgroundColor: '#fff', border: '1px solid rgba(28,28,28,0.12)', borderRadius: '8px', boxShadow: '0 4px 16px rgba(0,0,0,0.1)', zIndex: 50, overflow: 'hidden' }}>
              {VISIT_TYPES.map(t => (
                <div key={t} onClick={() => { onChange({ ...data, visitType: t }); setTypeOpen(false) }} style={{ padding: '10px 14px', cursor: 'pointer', ...font(14, data.visitType === t ? 600 : 400), backgroundColor: data.visitType === t ? 'rgba(28,28,28,0.05)' : '#fff' }} onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(28,28,28,0.04)')} onMouseLeave={e => (e.currentTarget.style.backgroundColor = data.visitType === t ? 'rgba(28,28,28,0.05)' : '#fff')}>{t}</div>
              ))}
            </div>
          )}
        </div>

        {/* Travel Time */}
        <div>
          <div style={{ ...font(12, 500, 'rgba(28,28,28,0.6)'), marginBottom: '5px' }}>Travel Time (minutes)</div>
          <input type="number" min="0" value={data.travelTime} onChange={e => onChange({ ...data, travelTime: e.target.value })} placeholder="0" style={{ width: '100%', boxSizing: 'border-box', backgroundColor: 'rgba(28,28,28,0.05)', border: '1px solid rgba(28,28,28,0.1)', borderRadius: '8px', padding: '10px 12px', ...font(14), outline: 'none' }} />
        </div>
      </div>

      {/* Notes */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ ...font(12, 500, 'rgba(28,28,28,0.6)'), marginBottom: '5px' }}>Notes</div>
        <textarea value={data.notes} onChange={e => onChange({ ...data, notes: e.target.value })} placeholder="Add notes about this visit…" rows={4} style={{ width: '100%', boxSizing: 'border-box', backgroundColor: 'rgba(28,28,28,0.05)', border: '1px solid rgba(28,28,28,0.1)', borderRadius: '8px', padding: '10px 12px', ...font(14, 400, '#1c1c1c'), outline: 'none', resize: 'vertical' }} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
        <button onClick={handleSave} disabled={saving} style={{ backgroundColor: saving ? 'rgba(28,28,28,0.4)' : '#1c1c1c', border: 'none', borderRadius: '8px', padding: '6px 16px', cursor: saving ? 'not-allowed' : 'pointer', ...font(13, 500, '#fff') }}>Save &amp; Quit</button>
        <button onClick={handleSave} disabled={saving} style={{ backgroundColor: saving ? 'rgba(28,28,28,0.4)' : '#1c1c1c', border: 'none', borderRadius: '8px', padding: '6px 16px', cursor: saving ? 'not-allowed' : 'pointer', ...font(13, 500, '#fff') }}>{saving ? 'Saving…' : saved ? '✓ Saved' : 'Save'}</button>
        <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px 12px', ...font(13, 500) }}>Cancel</button>
      </div>
    </div>
  )
}

/* ── Tab: Leaning Journals ── */
interface JournalData { title: string; category: string; date: string; timeHH: string; timeMM: string; amPm: 'AM' | 'PM'; durationHH: string; durationMM: string; offJob: boolean; onJob: boolean; reflection: string; privacy: string }
function TabJournals({ data, onChange, activityId, token }: { data: JournalData; onChange: (d: JournalData) => void; activityId: string; token: string | undefined }) {
  const [catOpen, setCatOpen] = useState(false)
  const [privOpen, setPrivOpen] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const set = (k: keyof JournalData, v: any) => onChange({ ...data, [k]: v })

  const handleSave = async () => {
    setSaving(true)
    try {
      if (token && activityId && activityId !== 'default') {
        await apiFetch<any>(
          '/learning-journals',
          token,
          {
            method: 'POST',
            body: JSON.stringify({
              learningActivityId: activityId,
              title: data.title,
              category: data.category,
              date: data.date,
              timeHH: data.timeHH,
              timeMM: data.timeMM,
              amPm: data.amPm,
              durationHH: data.durationHH,
              durationMM: data.durationMM,
              offJob: data.offJob,
              onJob: data.onJob,
              reflection: data.reflection,
              privacy: data.privacy,
            }),
          }
        )
      }
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      console.error('Failed to save journal:', err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ ...font(16, 700), marginBottom: '14px' }}>Leaning Journals</div>

      {/* Title + Category */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
        <div style={{ backgroundColor: 'rgba(28,28,28,0.05)', border: '1px solid rgba(28,28,28,0.1)', borderRadius: '8px', padding: '10px 14px' }}>
          <div style={{ ...font(11, 400, 'rgba(28,28,28,0.6)'), marginBottom: '3px' }}>Title</div>
          <input type="text" value={data.title} onChange={e => set('title', e.target.value)} placeholder="Enter title" style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', ...font(14) }} />
        </div>
        <div style={{ position: 'relative' }}>
          <div onClick={() => setCatOpen(v => !v)} style={{ backgroundColor: 'rgba(28,28,28,0.05)', border: '1px solid rgba(28,28,28,0.1)', borderRadius: '8px', padding: '10px 14px', cursor: 'pointer', display: 'flex', flexDirection: 'column' }}>
            <div style={{ ...font(11, 400, 'rgba(28,28,28,0.6)'), marginBottom: '3px' }}>Select a category</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ ...font(14, 400, data.category ? '#1c1c1c' : 'rgba(28,28,28,0.4)') }}>{data.category || 'Category'}</span>
              <img src={iconChevD} alt="" style={{ width: '14px', height: '14px' }} />
            </div>
          </div>
          {catOpen && (
            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '4px', backgroundColor: '#fff', border: '1px solid rgba(28,28,28,0.12)', borderRadius: '8px', boxShadow: '0 4px 16px rgba(0,0,0,0.1)', zIndex: 50, overflow: 'hidden' }}>
              {JOURNAL_CATEGORIES.map(c => <div key={c} onClick={() => { set('category', c); setCatOpen(false) }} style={{ padding: '10px 14px', cursor: 'pointer', ...font(14, data.category === c ? 600 : 400), backgroundColor: data.category === c ? 'rgba(28,28,28,0.05)' : '#fff' }} onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(28,28,28,0.04)')} onMouseLeave={e => (e.currentTarget.style.backgroundColor = data.category === c ? 'rgba(28,28,28,0.05)' : '#fff')}>{c}</div>)}
            </div>
          )}
        </div>
      </div>

      {/* Date + Time + Duration */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
        <div style={{ backgroundColor: 'rgba(28,28,28,0.05)', border: '1px solid rgba(28,28,28,0.1)', borderRadius: '8px', padding: '10px 14px' }}>
          <div style={{ ...font(11, 400, 'rgba(28,28,28,0.6)'), marginBottom: '3px' }}>Date</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <img src={iconCal} alt="" style={{ width: '13px', height: '13px', opacity: .6 }} />
            <input type="date" value={data.date} onChange={e => set('date', e.target.value)} style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', ...font(13) }} />
          </div>
        </div>
        <div style={{ backgroundColor: 'rgba(28,28,28,0.05)', border: '1px solid rgba(28,28,28,0.1)', borderRadius: '8px', padding: '10px 14px' }}>
          <div style={{ ...font(11, 400, 'rgba(28,28,28,0.6)'), marginBottom: '3px' }}>Time started</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <input type="text" value={data.timeHH} onChange={e => set('timeHH', e.target.value)} placeholder="HH" maxLength={2} style={{ width: '28px', background: 'transparent', border: 'none', outline: 'none', ...font(13), textAlign: 'center' }} />
            <span style={{ ...font(13) }}>:</span>
            <input type="text" value={data.timeMM} onChange={e => set('timeMM', e.target.value)} placeholder="MM" maxLength={2} style={{ width: '28px', background: 'transparent', border: 'none', outline: 'none', ...font(13), textAlign: 'center' }} />
            <button onClick={() => set('amPm', data.amPm === 'AM' ? 'PM' : 'AM')} style={{ backgroundColor: '#1c1c1c', border: 'none', borderRadius: '4px', padding: '2px 6px', cursor: 'pointer', ...font(11, 600, '#fff') }}>{data.amPm}</button>
          </div>
        </div>
        <div style={{ backgroundColor: 'rgba(28,28,28,0.05)', border: '1px solid rgba(28,28,28,0.1)', borderRadius: '8px', padding: '10px 14px' }}>
          <div style={{ ...font(11, 400, 'rgba(28,28,28,0.6)'), marginBottom: '3px' }}>Duration</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <input type="text" value={data.durationHH} onChange={e => set('durationHH', e.target.value)} placeholder="HH" maxLength={2} style={{ width: '28px', background: 'transparent', border: 'none', outline: 'none', ...font(13), textAlign: 'center' }} />
            <span style={{ ...font(13) }}>:</span>
            <input type="text" value={data.durationMM} onChange={e => set('durationMM', e.target.value)} placeholder="MM" maxLength={2} style={{ width: '28px', background: 'transparent', border: 'none', outline: 'none', ...font(13), textAlign: 'center' }} />
            <span style={{ ...font(12, 400, 'rgba(28,28,28,0.5)') }}>hrs</span>
          </div>
        </div>
      </div>

      {/* Activity type */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '12px' }}>
        {([['offJob', 'Off the job'], ['onJob', 'On the job']] as const).map(([k, label]) => (
          <label key={k} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
            <input type="checkbox" checked={(data as any)[k]} onChange={e => set(k, e.target.checked)} style={{ width: '15px', height: '15px', accentColor: '#1c1c1c' }} />
            <span style={{ ...font(13) }}>{label}</span>
          </label>
        ))}
      </div>

      {/* Reflection */}
      <div style={{ position: 'relative', marginBottom: '12px' }}>
        <textarea value={data.reflection} onChange={e => set('reflection', e.target.value)} placeholder="Type your reflection here" rows={4} style={{ width: '100%', boxSizing: 'border-box', border: '1px solid rgba(28,28,28,0.1)', borderRadius: '8px', padding: '10px 34px 10px 12px', ...font(14, 400, '#1c1c1c'), outline: 'none', resize: 'none', backgroundColor: '#fff' }} />
        <img src={iconQuestion} alt="" style={{ position: 'absolute', top: '10px', right: '10px', width: '18px', height: '18px' }} />
      </div>

      {/* Bottom actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ position: 'relative' }}>
            <button onClick={() => setPrivOpen(v => !v)} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer', ...font(13) }}>
              🔒 Privacy: {data.privacy}
              <img src={iconChevD} alt="" style={{ width: '12px', height: '12px' }} />
            </button>
            {privOpen && (
              <div style={{ position: 'absolute', bottom: '100%', left: 0, marginBottom: '4px', backgroundColor: '#fff', border: '1px solid rgba(28,28,28,0.12)', borderRadius: '8px', boxShadow: '0 4px 16px rgba(0,0,0,0.1)', zIndex: 50, overflow: 'hidden', minWidth: '140px' }}>
                {PRIVACY_OPTIONS.map(p => <div key={p} onClick={() => { set('privacy', p); setPrivOpen(false) }} style={{ padding: '10px 14px', cursor: 'pointer', ...font(13, data.privacy === p ? 600 : 400) }} onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(28,28,28,0.04)')} onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#fff')}>{p}</div>)}
              </div>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px 12px', ...font(13, 500) }}>Cancel</button>
          <button onClick={handleSave} disabled={saving} style={{ backgroundColor: saving ? 'rgba(28,28,28,0.4)' : '#1c1c1c', border: 'none', borderRadius: '8px', padding: '6px 16px', cursor: saving ? 'not-allowed' : 'pointer', ...font(13, 500, '#fff') }}>{saving ? 'Saving…' : saved ? '✓ Saved' : 'Save'}</button>
        </div>
      </div>
    </div>
  )
}

/* ── Tab: Declaration & Signatures ── */
interface DeclarationData { learner: DeclarationSig; trainer: DeclarationSig; agreed: boolean }
function TabDeclaration({ data, onChange, activityId, token }: { data: DeclarationData; onChange: (d: DeclarationData) => void; activityId: string; token: string | undefined }) {
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  const handleSign = (role: 'learner' | 'trainer') => {
    if (data[role].checked) return
    onChange({ ...data, [role]: { checked: true, signedAt: new Date().toLocaleDateString('en-GB') } })
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      if (token && activityId && activityId !== 'default') {
        await apiFetch<any>(
          `/learning-activities/declaration/${activityId}`,
          token,
          {
            method: 'POST',
            body: JSON.stringify({
              learnerAgreed: data.learner.checked,
              trainerAgreed: data.trainer.checked,
              agreedToTerms: data.agreed,
            }),
          }
        )
      }
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      console.error('Failed to save declaration:', err)
    } finally {
      setSaving(false)
    }
  }
  return (
    <div style={{ padding: '20px' }}>
      <div style={{ ...font(16, 700), marginBottom: '10px' }}>Declaration &amp; Signatures</div>
      <p style={{ ...font(13, 400, 'rgba(28,28,28,0.7)'), marginBottom: '20px', lineHeight: '1.6' }}>Only sign here when you have finished with this learning activity and wish to send it to the next person.</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
        {(['learner', 'trainer'] as const).map(role => (
          <div key={role} style={{ backgroundColor: 'rgba(28,28,28,0.04)', border: '1px solid rgba(28,28,28,0.1)', borderRadius: '8px', padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <input type="checkbox" checked={data[role].checked} onChange={() => handleSign(role)} style={{ width: '15px', height: '15px', accentColor: '#1c1c1c', cursor: 'pointer' }} />
              <span style={{ ...font(13, 600) }}>Signature — {role === 'learner' ? 'Learner' : 'Trainer'}</span>
            </div>
            <p style={{ ...font(12, 400, 'rgba(28,28,28,0.55)', { fontStyle: 'italic' }), marginBottom: '12px', lineHeight: 1.5 }}>I agree that the information provided here is an accurate account of what has taken place.</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ ...font(13) }}>{role === 'learner' ? 'John Doe (Learner)' : 'Trainer'}</span>
              {data[role].signedAt
                ? <span style={{ ...font(12, 500, '#22c55e') }}>✓ Signed {data[role].signedAt}</span>
                : <button onClick={() => handleSign(role)} style={{ backgroundColor: '#1c1c1c', border: 'none', borderRadius: '6px', padding: '4px 10px', cursor: 'pointer', ...font(12, 500, '#fff') }}>Click to sign</button>
              }
            </div>
          </div>
        ))}
      </div>

      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', cursor: 'pointer' }}>
        <input type="checkbox" checked={data.agreed} onChange={e => onChange({ ...data, agreed: e.target.checked })} style={{ width: '15px', height: '15px', accentColor: '#1c1c1c' }} />
        <span style={{ ...font(13) }}>I have reviewed and agreed to the terms of this declaration</span>
      </label>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
        <button onClick={handleSave} disabled={saving} style={{ backgroundColor: saving ? 'rgba(28,28,28,0.4)' : '#1c1c1c', border: 'none', borderRadius: '8px', padding: '6px 16px', cursor: saving ? 'not-allowed' : 'pointer', ...font(13, 500, '#fff') }}>Save &amp; Quit</button>
        <button onClick={handleSave} disabled={saving} style={{ backgroundColor: saving ? 'rgba(28,28,28,0.4)' : '#1c1c1c', border: 'none', borderRadius: '8px', padding: '6px 16px', cursor: saving ? 'not-allowed' : 'pointer', ...font(13, 500, '#fff') }}>{saving ? 'Saving…' : saved ? '✓ Saved' : 'Save'}</button>
        <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px 12px', ...font(13, 500) }}>Cancel</button>
      </div>
    </div>
  )
}

/* ── Main page ── */
function EvidencePageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  const token = (session?.user as any)?.accessToken
  const activityId = searchParams.get('id') || 'default'

  const [activeTab, setActiveTab] = useState<Tab>('Evidence')
  const [showCriteria, setShowCriteria] = useState(false)
  const [methodOpen, setMethodOpen] = useState(false)

  // Activity header state
  const [activity, setActivity] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('currentActivity')
      if (stored) return JSON.parse(stored)
    }
    return { title: 'UI Design for one file', method: 'Assignment', date: '03/01/2025' }
  })

  // Criteria
  const [criteria, setCriteria] = useState<CriterionItem[]>(CRITERIA_MASTER)
  const selectedCriteria = criteria.filter(c => c.selected)

  // Tab data states
  const [evidenceData, setEvidenceData] = useState({ content: '', attachments: [] as Attachment[], toolbarActive: [] as string[], evidenceId: '' })
  const [feedbackData, setFeedbackData] = useState({ content: '', toolbarActive: [] as string[] })
  const [visitData, setVisitData] = useState<VisitData>({ visitType: '', travelTime: '', notes: '' })
  const [journalData, setJournalData] = useState<JournalData>({ title: '', category: '', date: '', timeHH: '', timeMM: '', amPm: 'AM', durationHH: '', durationMM: '', offJob: false, onJob: false, reflection: '', privacy: 'Only Me' })
  const [declarationData, setDeclarationData] = useState<DeclarationData>({ learner: { checked: false, signedAt: '' }, trainer: { checked: false, signedAt: '' }, agreed: false })

  // Load activity and criteria on mount
  useEffect(() => {
    const load = async () => {
      try {
        if (token && activityId && activityId !== 'default') {
          // Load activity
          try {
            const actResp = await apiFetch<any>(
              `/learning-activities/${activityId}`,
              token
            )
            setActivity(actResp.data)
          } catch (err) {
            console.error('Failed to load activity:', err)
          }

          // Load criteria master
          try {
            const critResp = await apiFetch<any>(
              '/criteria?limit=100',
              token
            )
            const loaded = (critResp.data.data || []).map((c: any) => ({
              id: c._id,
              name: c.name,
              selected: false,
              expanded: false,
            }))
            if (loaded.length > 0) setCriteria(loaded)
          } catch (err) {
            console.error('Failed to load criteria:', err)
          }

          // Load activity's selected criteria
          try {
            const actCritResp = await apiFetch<any>(
              `/criteria/activity/${activityId}`,
              token
            )
            const selectedIds = new Set((actCritResp.data.data || []).map((c: any) => c.criteriaId))
            setCriteria(prev => prev.map(c => ({ ...c, selected: selectedIds.has(c.id) })))
          } catch (err) {
            console.error('Failed to load activity criteria:', err)
          }
        }
      } catch (err) {
        console.error('Load error:', err)
      }
    }
    load()
  }, [token, activityId])

  const renderTab = () => {
    switch (activeTab) {
      case 'Evidence': return <TabEvidence data={evidenceData} onChange={setEvidenceData} activityId={activityId} token={token} />
      case 'Feedback & Comments': return <TabFeedback data={feedbackData} onChange={setFeedbackData} activityId={activityId} token={token} />
      case 'Visit': return <TabVisit data={visitData} onChange={setVisitData} activityId={activityId} token={token} />
      case 'Leaning Journals': return <TabJournals data={journalData} onChange={setJournalData} activityId={activityId} token={token} />
      case 'Declaration & Signatures': return <TabDeclaration data={declarationData} onChange={setDeclarationData} activityId={activityId} token={token} />
    }
  }

  return (
    <div>
      {showCriteria && <SetCriteriaModal criteria={criteria} onChange={setCriteria} onClose={() => setShowCriteria(false)} activityId={activityId} token={token} />}

      {/* Top card — Activity header */}
      <div style={{ backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 2px 6px rgba(13,10,44,0.08)', marginBottom: '20px', overflow: 'visible' }}>
        {/* Header bar */}
        <div style={{ backgroundColor: 'rgba(28,28,28,0.05)', padding: '0 20px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: '12px 12px 0 0' }}>
          <span style={{ ...font(15, 700) }}>Start New Learning Activity</span>
          <button onClick={() => setShowCriteria(true)} style={{ backgroundColor: '#1c1c1c', border: 'none', borderRadius: '8px', padding: '4px 8px', height: '28px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', ...font(14, 400, '#fff') }}>
            Set Criteria <span style={{ fontSize: '16px', lineHeight: 1 }}>+</span>
          </button>
        </div>

        {/* Fields row */}
        <div style={{ padding: '16px 20px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', borderBottom: selectedCriteria.length > 0 ? '1px solid rgba(28,28,28,0.08)' : 'none' }}>
          {/* Method */}
          <div style={{ position: 'relative' }}>
            <div onClick={() => setMethodOpen(v => !v)} style={{ backgroundColor: 'rgba(28,28,28,0.04)', border: '1px solid rgba(28,28,28,0.1)', borderRadius: '8px', padding: '10px 14px', cursor: 'pointer', display: 'flex', flexDirection: 'column' }}>
              <span style={{ ...font(11, 400, 'rgba(28,28,28,0.6)'), marginBottom: '3px' }}>Primary Method:</span>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ ...font(14, 500) }}>{activity.method}</span>
                <img src={iconChevD} alt="" style={{ width: '13px', height: '13px' }} />
              </div>
            </div>
            {methodOpen && (
              <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '4px', backgroundColor: '#fff', border: '1px solid rgba(28,28,28,0.12)', borderRadius: '8px', boxShadow: '0 4px 16px rgba(0,0,0,0.1)', zIndex: 50, overflow: 'hidden' }}>
                {METHODS.map(m => <div key={m} onClick={() => { setActivity((a: any) => ({ ...a, method: m })); setMethodOpen(false) }} style={{ padding: '10px 14px', cursor: 'pointer', ...font(14, activity.method === m ? 600 : 400), backgroundColor: activity.method === m ? 'rgba(28,28,28,0.05)' : '#fff' }} onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(28,28,28,0.04)')} onMouseLeave={e => (e.currentTarget.style.backgroundColor = activity.method === m ? 'rgba(28,28,28,0.05)' : '#fff')}>{m}</div>)}
              </div>
            )}
          </div>
          {/* Date */}
          <div style={{ backgroundColor: 'rgba(28,28,28,0.04)', border: '1px solid rgba(28,28,28,0.1)', borderRadius: '8px', padding: '10px 14px' }}>
            <span style={{ ...font(11, 400, 'rgba(28,28,28,0.6)'), display: 'block', marginBottom: '3px' }}>Date</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <img src={iconCal} alt="" style={{ width: '13px', height: '13px', opacity: .6 }} />
              <span style={{ ...font(14, 500) }}>{activity.date}</span>
            </div>
          </div>
          {/* Title */}
          <div style={{ backgroundColor: 'rgba(28,28,28,0.04)', border: '1px solid rgba(28,28,28,0.1)', borderRadius: '8px', padding: '10px 14px' }}>
            <span style={{ ...font(11, 400, 'rgba(28,28,28,0.6)'), display: 'block', marginBottom: '3px' }}>Title</span>
            <input type="text" value={activity.title} onChange={e => setActivity((a: any) => ({ ...a, title: e.target.value }))} style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', ...font(14, 500) }} />
          </div>
        </div>

        {/* Selected criteria badges */}
        {selectedCriteria.length > 0 && (
          <div style={{ padding: '12px 20px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            <span style={{ ...font(12, 500, 'rgba(28,28,28,0.5)'), marginRight: '4px' }}>Criteria:</span>
            {selectedCriteria.map(c => (
              <span key={c.id} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', backgroundColor: 'rgba(28,28,28,0.07)', borderRadius: '20px', padding: '3px 10px', ...font(12, 500) }}>
                {c.name.length > 50 ? c.name.slice(0, 50) + '…' : c.name}
                <button onClick={() => setCriteria(prev => prev.map(x => x.id === c.id ? { ...x, selected: false } : x))} style={{ border: 'none', background: 'transparent', cursor: 'pointer', ...font(14, 400, 'rgba(28,28,28,0.5)'), lineHeight: 1, padding: '0 1px' }}>×</button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Two-column layout */}
      <div style={{ display: 'flex', gap: '16px' }}>
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
        <div style={{ flex: 1, backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 2px 6px rgba(13,10,44,0.08)', overflow: 'hidden' }}>
          {renderTab()}
        </div>
      </div>
    </div>
  )
}

export default function EvidencePage() {
  return <Suspense fallback={<div />}><EvidencePageInner /></Suspense>
}
