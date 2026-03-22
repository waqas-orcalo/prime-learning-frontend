'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

const svg = (s: string) => `data:image/svg+xml,${encodeURIComponent(s)}`
const iconChevronRight = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M7 5l5 5-5 5" stroke="#1c1c1c" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`)
const iconChevronRightWhite = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M7 5l5 5-5 5" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`)
const iconQuestion = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="8" stroke="#9291A5" stroke-width="1.2"/><path d="M7 7a2 2 0 1 1 2.5 1.94c-.5.14-.5.56-.5 1.06" stroke="#9291A5" stroke-width="1.2" stroke-linecap="round"/><circle cx="9" cy="13" r="0.75" fill="#9291A5"/></svg>`)

const FF = { fontFamily: "'Inter', sans-serif", fontFeatureSettings: "'ss01' 1, 'cv01' 1, 'cv11' 1" } as const
const font = (size: number, weight = 400, color = '#1c1c1c', extra: Record<string, unknown> = {}) => ({ ...FF, fontSize: `${size}px`, fontWeight: weight, color, ...extra })

const TABS = ['Evidence', 'Feedback & Comments', 'Visit', 'Leaning Journals', 'Declaration & Signatures']

function LeftSidebar({ activeTab, onTabChange }: { activeTab: string; onTabChange: (tab: string) => void }) {
  return (
    <div style={{ backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0px 2px 6px rgba(13,10,44,0.08)', padding: '16px', width: '280px', flexShrink: 0 }}>
      <div style={{ ...font(15, 700, '#1c1c1c'), marginBottom: '12px' }}>Information & Options</div>
      {TABS.map((tab) => {
        const active = activeTab === tab
        return (
          <div key={tab} onClick={() => onTabChange(tab)} style={{ display: 'flex', alignItems: 'center', padding: '12px', marginBottom: '4px', backgroundColor: active ? '#1c1c1c' : 'transparent', borderRadius: '8px', cursor: 'pointer' }}>
            <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: `2px solid ${active ? '#fff' : '#1c1c1c'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '12px', ...font(12, 700, active ? '#fff' : '#1c1c1c') }}>+</div>
            <span style={{ ...font(13, 400, active ? '#fff' : '#1c1c1c'), flex: 1 }}>{tab}</span>
            <img src={active ? iconChevronRightWhite : iconChevronRight} alt="" style={{ width: '16px', height: '16px' }} />
          </div>
        )
      })}
    </div>
  )
}

function TabEvidence() {
  return (
    <div style={{ padding: '20px' }}>
      <div style={{ ...font(15, 700, '#1c1c1c'), marginBottom: '16px' }}>Evidence</div>
      <textarea placeholder="Write here" style={{ width: '100%', minHeight: '120px', boxSizing: 'border-box', border: '1px solid rgba(28,28,28,0.1)', borderRadius: '8px', padding: '12px', backgroundColor: '#fff', ...font(14, 400, 'rgba(28,28,28,0.3)'), outline: 'none', resize: 'none' }} />

      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderTop: '1px solid rgba(28,28,28,0.1)', padding: '8px 0', marginTop: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid rgba(28,28,28,0.1)', borderRadius: '4px', padding: '4px 8px' }}>
          <span style={{ ...font(12, 400, '#1c1c1c') }}>14</span>
          <span style={{ ...font(10, 400, '#1c1c1c') }}>▼</span>
        </div>
        {[{ label: 'T', title: 'Text' }, { label: '●', title: 'Color' }, { label: 'B', title: 'Bold' }, { label: 'I', title: 'Italic' }, { label: 'U', title: 'Underline' }, { label: 'S̶', title: 'Strikethrough' }].map(btn => (
          <button key={btn.label} style={{ width: '24px', height: '24px', border: '1px solid rgba(28,28,28,0.1)', borderRadius: '4px', backgroundColor: '#fff', cursor: 'pointer', ...font(12, 600, '#1c1c1c'), display: 'flex', alignItems: 'center', justifyContent: 'center' }} title={btn.title}>{btn.label}</button>
        ))}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
          {['≡', '≡', '≡'].map((_, i) => <div key={i} style={{ width: '3px', height: '14px', backgroundColor: '#1c1c1c', borderRadius: '1px', margin: '0 1px' }} />)}
        </div>
        <button style={{ width: '24px', height: '24px', border: '1px solid rgba(28,28,28,0.1)', borderRadius: '4px', backgroundColor: '#fff', cursor: 'pointer', ...font(10, 600, '#1c1c1c'), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>&lt;/&gt;</button>
        <button style={{ width: '24px', height: '24px', border: '1px solid rgba(28,28,28,0.1)', borderRadius: '4px', backgroundColor: '#fff', cursor: 'pointer', ...font(12, 600, '#1c1c1c'), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>☰</button>
        <button style={{ width: '24px', height: '24px', border: '1px solid rgba(28,28,28,0.1)', borderRadius: '4px', backgroundColor: '#fff', cursor: 'pointer', ...font(12, 600, '#1c1c1c'), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🖼</button>
        <button style={{ width: '24px', height: '24px', border: '1px solid rgba(28,28,28,0.1)', borderRadius: '4px', backgroundColor: '#fff', cursor: 'pointer', ...font(12, 600, '#1c1c1c'), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🔗</button>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'space-between' }}>
        <button style={{ backgroundColor: '#1c1c1c', border: 'none', borderRadius: '8px', padding: '8px 16px', cursor: 'pointer', ...font(14, 600, '#fff') }}>Add Attachments 📎</button>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button style={{ backgroundColor: '#1c1c1c', border: 'none', borderRadius: '8px', padding: '8px 20px', cursor: 'pointer', ...font(14, 600, '#fff') }}>Save & Quit</button>
          <button style={{ backgroundColor: '#1c1c1c', border: 'none', borderRadius: '8px', padding: '8px 20px', cursor: 'pointer', ...font(14, 600, '#fff') }}>Save</button>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px 20px', ...font(14, 600, '#1c1c1c') }}>Cancel</button>
        </div>
      </div>
    </div>
  )
}

function TabFeedback() {
  return (
    <div style={{ padding: '20px' }}>
      <div style={{ ...font(15, 700, '#1c1c1c'), marginBottom: '16px' }}>Feedback & Comments</div>
      <textarea placeholder="Write here" style={{ width: '100%', minHeight: '120px', boxSizing: 'border-box', border: '1px solid rgba(28,28,28,0.1)', borderRadius: '8px', padding: '12px', backgroundColor: '#fff', ...font(14, 400, 'rgba(28,28,28,0.3)'), outline: 'none', resize: 'none' }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderTop: '1px solid rgba(28,28,28,0.1)', padding: '8px 0', marginTop: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid rgba(28,28,28,0.1)', borderRadius: '4px', padding: '4px 8px' }}>
          <span style={{ ...font(12, 400, '#1c1c1c') }}>14</span>
          <span style={{ ...font(10, 400, '#1c1c1c') }}>▼</span>
        </div>
        {[{ label: 'T', title: 'Text' }, { label: '●', title: 'Color' }, { label: 'B', title: 'Bold' }, { label: 'I', title: 'Italic' }, { label: 'U', title: 'Underline' }, { label: 'S̶', title: 'Strikethrough' }].map(btn => (
          <button key={btn.label} style={{ width: '24px', height: '24px', border: '1px solid rgba(28,28,28,0.1)', borderRadius: '4px', backgroundColor: '#fff', cursor: 'pointer', ...font(12, 600, '#1c1c1c'), display: 'flex', alignItems: 'center', justifyContent: 'center' }} title={btn.title}>{btn.label}</button>
        ))}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
          {['≡', '≡', '≡'].map((_, i) => <div key={i} style={{ width: '3px', height: '14px', backgroundColor: '#1c1c1c', borderRadius: '1px', margin: '0 1px' }} />)}
        </div>
        <button style={{ width: '24px', height: '24px', border: '1px solid rgba(28,28,28,0.1)', borderRadius: '4px', backgroundColor: '#fff', cursor: 'pointer', ...font(10, 600, '#1c1c1c'), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>&lt;/&gt;</button>
        <button style={{ width: '24px', height: '24px', border: '1px solid rgba(28,28,28,0.1)', borderRadius: '4px', backgroundColor: '#fff', cursor: 'pointer', ...font(12, 600, '#1c1c1c'), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>☰</button>
        <button style={{ width: '24px', height: '24px', border: '1px solid rgba(28,28,28,0.1)', borderRadius: '4px', backgroundColor: '#fff', cursor: 'pointer', ...font(12, 600, '#1c1c1c'), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🖼</button>
        <button style={{ width: '24px', height: '24px', border: '1px solid rgba(28,28,28,0.1)', borderRadius: '4px', backgroundColor: '#fff', cursor: 'pointer', ...font(12, 600, '#1c1c1c'), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🔗</button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'space-between' }}>
        <div></div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button style={{ backgroundColor: '#1c1c1c', border: 'none', borderRadius: '8px', padding: '8px 20px', cursor: 'pointer', ...font(14, 600, '#fff') }}>Save & Quit</button>
          <button style={{ backgroundColor: '#1c1c1c', border: 'none', borderRadius: '8px', padding: '8px 20px', cursor: 'pointer', ...font(14, 600, '#fff') }}>Save</button>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px 20px', ...font(14, 600, '#1c1c1c') }}>Cancel</button>
        </div>
      </div>
    </div>
  )
}

function TabVisit() {
  return (
    <div style={{ padding: '20px' }}>
      <div style={{ ...font(15, 700, '#1c1c1c'), marginBottom: '16px' }}>Visit</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
        <div style={{ backgroundColor: 'rgba(28,28,28,0.05)', border: '1px solid rgba(28,28,28,0.1)', borderRadius: '8px', padding: '12px' }}>
          <div style={{ ...font(12, 400, 'rgba(28,28,28,0.6)'), marginBottom: '6px' }}>Visit Type:</div>
          <div style={{ ...font(14, 400, '#1c1c1c') }}>Not Specified</div>
        </div>
        <div style={{ backgroundColor: 'rgba(28,28,28,0.05)', border: '1px solid rgba(28,28,28,0.1)', borderRadius: '8px', padding: '12px' }}>
          <div style={{ ...font(12, 400, 'rgba(28,28,28,0.6)'), marginBottom: '6px' }}>Travel Time:</div>
          <div style={{ ...font(14, 400, '#1c1c1c') }}>00 Minutes</div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end' }}>
        <button style={{ backgroundColor: '#1c1c1c', border: 'none', borderRadius: '8px', padding: '8px 20px', cursor: 'pointer', ...font(14, 600, '#fff') }}>Save & Quit</button>
        <button style={{ backgroundColor: '#1c1c1c', border: 'none', borderRadius: '8px', padding: '8px 20px', cursor: 'pointer', ...font(14, 600, '#fff') }}>Save</button>
        <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px 20px', ...font(14, 600, '#1c1c1c') }}>Cancel</button>
      </div>
    </div>
  )
}

function TabJournals() {
  return (
    <div style={{ padding: '20px' }}>
      <div style={{ ...font(15, 700, '#1c1c1c'), marginBottom: '16px' }}>Leaning Journals <span style={{ color: '#e74c3c' }}>*</span></div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
        <div style={{ backgroundColor: 'rgba(28,28,28,0.05)', border: '1px solid rgba(28,28,28,0.1)', borderRadius: '8px', padding: '12px' }}>
          <div style={{ ...font(12, 400, 'rgba(28,28,28,0.6)'), marginBottom: '6px' }}>Title</div>
          <input type="text" style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', ...font(14, 400, '#1c1c1c') }} />
        </div>
        <div style={{ backgroundColor: 'rgba(28,28,28,0.05)', border: '1px solid rgba(28,28,28,0.1)', borderRadius: '8px', padding: '12px' }}>
          <div style={{ ...font(12, 400, 'rgba(28,28,28,0.6)'), marginBottom: '6px' }}>Category</div>
          <select style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', ...font(14, 400, '#1c1c1c') }}><option>Select</option></select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
        <div style={{ backgroundColor: 'rgba(28,28,28,0.05)', border: '1px solid rgba(28,28,28,0.1)', borderRadius: '8px', padding: '12px' }}>
          <div style={{ ...font(12, 400, 'rgba(28,28,28,0.6)'), marginBottom: '6px' }}>Date</div>
          <input type="text" placeholder="Pick a date" style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', ...font(14, 400, 'rgba(28,28,28,0.4)') }} />
        </div>
        <div style={{ backgroundColor: 'rgba(28,28,28,0.05)', border: '1px solid rgba(28,28,28,0.1)', borderRadius: '8px', padding: '12px' }}>
          <div style={{ ...font(12, 400, 'rgba(28,28,28,0.6)'), marginBottom: '6px' }}>Time started</div>
          <input type="text" placeholder="HH:MM AM" style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', ...font(14, 400, 'rgba(28,28,28,0.4)') }} />
        </div>
        <div style={{ backgroundColor: 'rgba(28,28,28,0.05)', border: '1px solid rgba(28,28,28,0.1)', borderRadius: '8px', padding: '12px' }}>
          <div style={{ ...font(12, 400, 'rgba(28,28,28,0.6)'), marginBottom: '6px' }}>Duration</div>
          <input type="text" placeholder="HH:MM" style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', ...font(14, 400, 'rgba(28,28,28,0.4)') }} />
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <input type="checkbox" style={{ width: '15px', height: '15px', accentColor: '#1c1c1c', cursor: 'pointer' }} />
          <span style={{ ...font(13, 400, '#1c1c1c') }}>Off the job</span>
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <input type="checkbox" defaultChecked style={{ width: '15px', height: '15px', accentColor: '#1c1c1c', cursor: 'pointer' }} />
          <span style={{ ...font(13, 400, '#1c1c1c') }}>On the job</span>
        </label>
      </div>

      <div style={{ position: 'relative', marginBottom: '16px' }}>
        <textarea placeholder="Reflection" style={{ width: '100%', minHeight: '80px', boxSizing: 'border-box', border: '1px solid rgba(28,28,28,0.1)', borderRadius: '8px', padding: '12px', backgroundColor: '#fff', ...font(14, 400, 'rgba(28,28,28,0.4)'), outline: 'none', paddingRight: '32px' }} />
        <img src={iconQuestion} alt="" style={{ position: 'absolute', top: '12px', right: '12px', width: '18px', height: '18px' }} />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end', marginBottom: '16px' }}>
        <button style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', padding: '8px 12px', ...font(13, 400, '#1c1c1c') }}>Criteria</button>
        <button style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', padding: '8px 12px', ...font(13, 400, '#1c1c1c') }}>Link activity</button>
        <button style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', padding: '8px 12px', ...font(13, 400, '#1c1c1c') }}>Privacy: Only me</button>
        <button style={{ backgroundColor: '#1c1c1c', border: 'none', borderRadius: '8px', padding: '8px 12px', cursor: 'pointer', ...font(13, 600, '#fff'), display: 'flex', alignItems: 'center', gap: '6px' }}>Upload file</button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end' }}>
        <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px 20px', ...font(14, 600, '#1c1c1c') }}>Cancel</button>
        <button style={{ backgroundColor: '#1c1c1c', border: 'none', borderRadius: '8px', padding: '8px 20px', cursor: 'pointer', ...font(14, 600, '#fff') }}>Save</button>
      </div>
    </div>
  )
}

function TabDeclaration() {
  return (
    <div style={{ padding: '20px' }}>
      <div style={{ ...font(15, 700, '#1c1c1c'), marginBottom: '16px' }}>Declaration & Signatures</div>

      <div style={{ ...font(14, 400, '#1c1c1c'), marginBottom: '20px' }}>Only sign here when you have finished with this learning activity and wish to send it to the next person.</div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
        {[{ role: 'John Doe (Learner)', date: '2025/03/03' }, { role: 'Trainer', date: '' }].map((sig, i) => (
          <div key={i} style={{ backgroundColor: 'rgba(28,28,28,0.05)', border: '1px solid rgba(28,28,28,0.1)', borderRadius: '8px', padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <input type="checkbox" style={{ width: '15px', height: '15px', accentColor: '#1c1c1c', cursor: 'pointer' }} />
              <span style={{ ...font(13, 600, '#1c1c1c') }}>Signature</span>
            </div>
            <div style={{ ...font(12, 400, 'rgba(28,28,28,0.5)', { fontStyle: 'italic' }), marginBottom: '12px' }}>I agree that the information provided here is an accurate account of what has taken place.</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ ...font(13, 400, '#1c1c1c') }}>{sig.role}</span>
              <span style={{ ...font(13, 400, '#1c1c1c') }}>{sig.date}</span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end' }}>
        <button style={{ backgroundColor: '#1c1c1c', border: 'none', borderRadius: '8px', padding: '8px 20px', cursor: 'pointer', ...font(14, 600, '#fff') }}>Save & Quit</button>
        <button style={{ backgroundColor: '#1c1c1c', border: 'none', borderRadius: '8px', padding: '8px 20px', cursor: 'pointer', ...font(14, 600, '#fff') }}>Save</button>
        <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px 20px', ...font(14, 600, '#1c1c1c') }}>Cancel</button>
      </div>
    </div>
  )
}

function EvidencePageInner() {
  const searchParams = useSearchParams()
  const currentTab = searchParams.get('tab') || 'Evidence'
  const [activeTab, setActiveTab] = useState(currentTab)

  const renderTabContent = () => {
    switch(activeTab) {
      case 'Evidence':
        return <TabEvidence />
      case 'Feedback & Comments':
        return <TabFeedback />
      case 'Visit':
        return <TabVisit />
      case 'Leaning Journals':
        return <TabJournals />
      case 'Declaration & Signatures':
        return <TabDeclaration />
      default:
        return <TabEvidence />
    }
  }

  return (
    <div>
      {/* Top Header Card */}
      <div style={{ backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0px 2px 6px rgba(13,10,44,0.08)', marginBottom: '20px', overflow: 'hidden' }}>
        <div style={{ backgroundColor: 'rgba(28,28,28,0.05)', height: '45px', paddingLeft: '20px', paddingRight: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ ...font(15, 700, '#1c1c1c') }}>Start New Learning Activity</span>
          <button style={{ backgroundColor: '#1c1c1c', border: 'none', borderRadius: '8px', padding: '8px 16px', cursor: 'pointer', ...font(14, 600, '#fff') }}>Set Criteria +</button>
        </div>

        <div style={{ padding: '16px 20px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', borderBottom: '1px solid rgba(28,28,28,0.1)' }}>
          <div style={{ ...font(13, 400, '#1c1c1c') }}>Primary Method: <strong>Assignment ▼</strong></div>
          <div style={{ ...font(13, 400, '#1c1c1c') }}>Date: <strong>📅 03/01/2025 ▼</strong></div>
          <div style={{ ...font(13, 400, '#1c1c1c') }}>Title: <strong>UI Design for one file</strong></div>
        </div>

        {activeTab !== 'Evidence' && (
          <div style={{ padding: '16px 20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {[{ title: 'Assessment Criteria', badges: ['[Unit 01] Skills', '[1] IT'], links: ['[1.1b] Create proposals!', '[1.1c] Perform financial processes'] }, { title: 'Assessment Criteria', badges: ['[Unit 02] Knowledge', '[2] Business'], links: ['[2.1a] Analyze markets'] }].map((card, i) => (
              <div key={i} style={{ backgroundColor: '#fff', border: '1px solid rgba(28,28,28,0.1)', borderRadius: '8px', padding: '12px' }}>
                <div style={{ ...font(13, 700, '#1c1c1c'), marginBottom: '8px' }}>Assessment Criteria</div>
                <div style={{ display: 'flex', gap: '6px', marginBottom: '8px', flexWrap: 'wrap' }}>
                  {card.badges.map((badge, j) => (
                    <span key={j} style={{ backgroundColor: '#e8a9f5', padding: '4px 8px', borderRadius: '4px', ...font(11, 600, '#1c1c1c') }}>{badge}</span>
                  ))}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {card.links.map((link, j) => (
                    <span key={j} style={{ ...font(13, 400, '#4169e1'), cursor: 'pointer' }}>{link}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Two-Column Body */}
      <div style={{ display: 'flex', gap: '16px' }}>
        <LeftSidebar activeTab={activeTab} onTabChange={setActiveTab} />
        <div style={{ flex: 1, backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0px 2px 6px rgba(13,10,44,0.08)', overflow: 'hidden' }}>
          {renderTabContent()}
        </div>
      </div>
    </div>
  )
}

export default function EvidencePage() {
  return (
    <Suspense fallback={<div />}>
      <EvidencePageInner />
    </Suspense>
  )
}
