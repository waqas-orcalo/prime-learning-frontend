'use client'

import { Suspense } from 'react'
import { useRouter, useParams } from 'next/navigation'

const svg = (s: string) => `data:image/svg+xml,${encodeURIComponent(s)}`
const iconBack = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none"><circle cx="16" cy="16" r="15" stroke="#1c1c1c" stroke-width="1.5"/><path d="M18 11l-5 5 5 5" stroke="#1c1c1c" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`)
const iconUser = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none"><circle cx="7" cy="5" r="3" stroke="#888" stroke-width="1.2"/><path d="M1.5 13c0-3.038 2.462-5.5 5.5-5.5s5.5 2.462 5.5 5.5" stroke="#888" stroke-width="1.2" stroke-linecap="round"/></svg>`)

const FF = { fontFamily: "'Inter', sans-serif", fontFeatureSettings: "'ss01' 1, 'cv01' 1, 'cv11' 1" } as const
const font = (size: number, weight = 400, color = '#1c1c1c', extra: React.CSSProperties = {}) =>
  ({ ...FF, fontSize: `${size}px`, fontWeight: weight, color, lineHeight: '20px', ...extra } as React.CSSProperties)

const SECTION_HEADER: React.CSSProperties = { padding: '12px 16px', background: '#f0f0f0', ...font(13, 600), borderBottom: '1px solid rgba(28,28,28,0.08)', borderTop: '1px solid rgba(28,28,28,0.08)' }
const FIELD_WRAP: React.CSSProperties = { background: '#fafafa', border: '1px solid rgba(28,28,28,0.1)', borderRadius: 8, padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 4 }
const FIELD_LABEL: React.CSSProperties = { ...font(11, 400, '#888'), marginBottom: 2 }
const FIELD_VALUE: React.CSSProperties = { ...font(13), padding: '2px 0' }

const MOCK_DATA = {
  trainersName: 'Jane Smith',
  keyPoint: 'Understanding the importance of record keeping in business administration.',
  useSkillsImpact: 'I will use these skills to maintain accurate filing systems and improve office efficiency.',
  moreInfoOn: 'Digital filing systems and cloud storage solutions.',
  completedJournal: 'No' as const,
  ifNoWhyNot: 'Did not have time this week.',
  improvementSuggestion: 'More practical exercises would help reinforce the theoretical concepts.',
  learnerSigned: true,
  trainerSigned: false,
}

function ViewLearnerFeedbackInner() {
  const router = useRouter()
  const params = useParams()

  return (
    <div style={{ padding: '24px 28px', maxWidth: 980, ...FF }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, lineHeight: 0 }}>
          <img src={iconBack} width={32} height={32} alt="Back" />
        </button>
        <h1 style={font(22, 600)}>Learner feedback from teach sessions</h1>
      </div>

      <div style={{ border: '1px solid rgba(28,28,28,0.12)', borderRadius: 12, overflow: 'hidden' }}>

        <div style={SECTION_HEADER}>Training Feedback</div>
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={FIELD_WRAP}><span style={FIELD_LABEL}>Trainers Name</span><span style={FIELD_VALUE}>{MOCK_DATA.trainersName}</span></div>
            <div style={FIELD_WRAP}><span style={FIELD_LABEL}>What would you say was the key point you learned today?</span><span style={FIELD_VALUE}>{MOCK_DATA.keyPoint}</span></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={FIELD_WRAP}><span style={FIELD_LABEL}>How would you use the skills you are learning in work? and what impact would this have?</span><span style={FIELD_VALUE}>{MOCK_DATA.useSkillsImpact}</span></div>
            <div style={FIELD_WRAP}><span style={FIELD_LABEL}>What would you like more information on?</span><span style={FIELD_VALUE}>{MOCK_DATA.moreInfoOn}</span></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={FIELD_WRAP}>
              <span style={FIELD_LABEL}>Have you completed your learning journal?</span>
              <div style={{ display: 'flex', gap: 16, marginTop: 4 }}>
                {(['Yes', 'No'] as const).map(opt => (
                  <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <input type="checkbox" checked={MOCK_DATA.completedJournal === opt} readOnly style={{ width: 14, height: 14 }} />
                    <span style={font(13)}>{opt}</span>
                  </label>
                ))}
              </div>
            </div>
            <div style={FIELD_WRAP}><span style={FIELD_LABEL}>If you selected no why not?</span><span style={FIELD_VALUE}>{MOCK_DATA.ifNoWhyNot}</span></div>
          </div>
          <div style={FIELD_WRAP}><span style={FIELD_LABEL}>If you could improve just one thing in the training/lesson – what would it be, and what difference would it make?</span><span style={FIELD_VALUE}>{MOCK_DATA.improvementSuggestion}</span></div>
        </div>

        <div style={SECTION_HEADER}>Signature</div>
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ border: '1px solid rgba(28,28,28,0.1)', borderRadius: 8, padding: '12px 16px', background: '#fff' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <input type="checkbox" checked={MOCK_DATA.learnerSigned} readOnly style={{ width: 14, height: 14 }} />
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
                <input type="checkbox" checked={MOCK_DATA.trainerSigned} readOnly style={{ width: 14, height: 14 }} />
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

export default function Page() { return <Suspense><ViewLearnerFeedbackInner /></Suspense> }
