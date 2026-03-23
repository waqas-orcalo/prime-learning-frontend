'use client'

import { Suspense } from 'react'
import { useRouter } from 'next/navigation'

const svg = (s: string) => `data:image/svg+xml,${encodeURIComponent(s)}`
const iconBack = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none"><circle cx="16" cy="16" r="15" stroke="#1c1c1c" stroke-width="1.5"/><path d="M18 11l-5 5 5 5" stroke="#1c1c1c" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`)
const iconUser = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none"><circle cx="7" cy="5" r="3" stroke="#888" stroke-width="1.2"/><path d="M1.5 13c0-3.038 2.462-5.5 5.5-5.5s5.5 2.462 5.5 5.5" stroke="#888" stroke-width="1.2" stroke-linecap="round"/></svg>`)

const FF = { fontFamily: "'Inter', sans-serif", fontFeatureSettings: "'ss01' 1, 'cv01' 1, 'cv11' 1" } as const
const font = (size: number, weight = 400, color = '#1c1c1c', extra: React.CSSProperties = {}) =>
  ({ ...FF, fontSize: `${size}px`, fontWeight: weight, color, lineHeight: '20px', ...extra } as React.CSSProperties)

const SECTION_HDR: React.CSSProperties = { padding: '12px 16px', background: '#f0f0f0', ...font(13, 600), borderBottom: '1px solid rgba(28,28,28,0.08)', borderTop: '1px solid rgba(28,28,28,0.08)' }
const FIELD_WRAP: React.CSSProperties = { background: '#fafafa', border: '1px solid rgba(28,28,28,0.1)', borderRadius: 8, padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 4, minHeight: 80 }
const FIELD_LABEL: React.CSSProperties = { ...font(11, 400, '#888'), marginBottom: 2, lineHeight: '16px' }
const FIELD_VALUE: React.CSSProperties = { ...font(13), lineHeight: '20px' }

const PE_QA_PAIRS = [
  ['Can you describe any specific skills or knowledge you\'ve acquired?', 'I have developed strong IT skills including spreadsheet management and document production.'],
  ['How has your apprenticeship contributed to your understanding of your chosen field?', 'I now have a much deeper understanding of business administration processes and procedures.'],
  ['In what ways has your apprenticeship influenced your career goals?', 'I am now aiming to pursue a management role in business administration.'],
  ['How has your confidence grown?', 'I feel significantly more confident in client-facing situations and managing complex tasks.'],
  ['Can you identify any challenges you\'ve overcome?', 'Managing multiple deadlines and learning new software systems were my biggest challenges.'],
]

function ViewExitReviewInner() {
  const router = useRouter()

  return (
    <div style={{ padding: '24px 28px', maxWidth: 980, ...FF }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, lineHeight: 0 }}>
          <img src={iconBack} width={32} height={32} alt="Back" />
        </button>
        <h1 style={font(22, 600)}>Exit review and Programme Evaluation</h1>
      </div>

      <div style={{ border: '1px solid rgba(28,28,28,0.12)', borderRadius: 12, overflow: 'hidden' }}>

        <div style={SECTION_HDR}>Learner Name and Date</div>
        <div style={{ padding: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div style={{ ...FIELD_WRAP, minHeight: 'auto' }}><span style={FIELD_LABEL}>Learners Name*</span><span style={FIELD_VALUE}>John Doe</span></div>
          <div style={{ ...FIELD_WRAP, minHeight: 'auto' }}><span style={FIELD_LABEL}>Start Date:</span><span style={FIELD_VALUE}>03/01/2025</span></div>
        </div>

        <div style={SECTION_HDR}>Programme Evaluation</div>
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {PE_QA_PAIRS.map(([q, a], i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={FIELD_WRAP}><span style={FIELD_LABEL}>{q}</span><span style={FIELD_VALUE}>{a}</span></div>
              <div style={FIELD_WRAP}><span style={FIELD_LABEL}>{q} (follow-up)</span><span style={{ ...font(13, 400, '#aaa') }}>—</span></div>
            </div>
          ))}
        </div>

        <div style={SECTION_HDR}>Signature</div>
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ border: '1px solid rgba(28,28,28,0.1)', borderRadius: 8, padding: '12px 16px', background: '#fff' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <input type="checkbox" checked={true} readOnly style={{ width: 14, height: 14 }} />
                <span style={font(13, 500)}>Signature</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <img src={iconUser} width={14} height={14} alt="" /><span style={font(12, 400, '#555')}>John Doe (Learner)</span><span style={font(11, 400, '#aaa')}>2025/03/03</span>
              </div>
            </div>
            <p style={{ ...font(11, 400, '#888'), margin: '6px 0 0 24px' }}>I agree that the information provided here is an accurate account of what has taken place.</p>
          </div>
          <div style={{ border: '1px solid rgba(28,28,28,0.08)', borderRadius: 8, padding: '12px 16px', background: '#fafafa' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <input type="checkbox" checked={false} readOnly style={{ width: 14, height: 14 }} />
                <span style={{ ...font(13, 500, '#888') }}>Signature</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <img src={iconUser} width={14} height={14} alt="" /><span style={font(12, 400, '#888')}>Trainer</span>
              </div>
            </div>
            <p style={{ ...font(11, 400, '#aaa'), margin: '6px 0 0 24px' }}>I agree that the information provided here is an accurate account of what has taken place.</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderTop: '1px solid rgba(28,28,28,0.08)' }}>
          <div style={{ display: 'flex', gap: 10 }}>
            <button style={{ padding: '9px 22px', background: '#1c1c1c', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', ...font(13, 500, '#fff') }}>Save</button>
            <button onClick={() => router.back()} style={{ padding: '9px 22px', background: '#fff', color: '#1c1c1c', border: '1px solid rgba(28,28,28,0.25)', borderRadius: 8, cursor: 'pointer', ...font(13, 500) }}>Cancel</button>
          </div>
          <button style={{ padding: '9px 22px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', ...font(13, 500, '#fff') }}>Delete</button>
        </div>
      </div>
    </div>
  )
}

export default function Page() { return <Suspense><ViewExitReviewInner /></Suspense> }
