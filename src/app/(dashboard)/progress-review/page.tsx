'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const cardStyle: React.CSSProperties = {
  backgroundColor: '#fff',
  borderRadius: '12px',
  border: '1px solid rgba(28,28,28,0.1)',
  overflow: 'hidden',
  marginBottom: '16px',
}
const cardHeaderStyle: React.CSSProperties = {
  backgroundColor: 'rgba(28,28,28,0.05)',
  padding: '12px 16px',
  borderBottom: '1px solid rgba(28,28,28,0.1)',
  fontFamily: "'Inter', sans-serif",
  fontWeight: 700,
  fontSize: '18px',
  letterSpacing: '-0.36px',
  color: '#000',
}
const thStyle: React.CSSProperties = {
  fontFamily: "'Inter', sans-serif",
  fontWeight: 400,
  fontSize: '14px',
  color: 'rgba(28,28,28,0.6)',
  padding: '8px 16px',
  textAlign: 'left',
  borderBottom: '1px solid rgba(28,28,28,0.1)',
  whiteSpace: 'nowrap',
}
const tdStyle: React.CSSProperties = {
  fontFamily: "'Inter', sans-serif",
  fontWeight: 400,
  fontSize: '14px',
  color: '#1c1c1c',
  padding: '8px 16px',
  borderBottom: '1px solid rgba(28,28,28,0.1)',
}

const units = [
  { name: 'Unit 01 - Gateway to End Point Assessment', progress: 0, signedBy: 'Learner/Trainer', ksc: 2, evidence: 0 },
  { name: 'Unit 02 - Business Administration Fundamentals', progress: 45, signedBy: 'Learner', ksc: 8, evidence: 3 },
  { name: 'Unit 03 - Communication in Business', progress: 72, signedBy: 'Learner/Trainer', ksc: 12, evidence: 7 },
  { name: 'Unit 04 - Professional Development', progress: 100, signedBy: 'Learner/Trainer/IQA', ksc: 10, evidence: 10 },
  { name: 'Unit 05 - IT Tools and Applications', progress: 30, signedBy: 'None', ksc: 6, evidence: 2 },
]

function ProgressBar({ value }: { value: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div style={{ flex: 1, height: '6px', backgroundColor: 'rgba(28,28,28,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
        <div style={{ width: `${value}%`, height: '100%', backgroundColor: '#000', borderRadius: '3px' }} />
      </div>
      <span style={{ fontFamily: "'Inter'", fontSize: '12px', color: 'rgba(28,28,28,0.6)', whiteSpace: 'nowrap', minWidth: '32px' }}>
        {value}%
      </span>
    </div>
  )
}

interface SignatureBlockProps {
  title: string
  name: string
  date: string
  signed: boolean
}

function SignatureBlock({ title, name, date, signed }: SignatureBlockProps) {
  return (
    <div style={{
      border: '1px solid rgba(28,28,28,0.1)',
      borderRadius: '8px',
      padding: '16px',
      backgroundColor: signed ? 'rgba(186,237,189,0.1)' : '#fff',
    }}>
      <div style={{ fontFamily: "'Inter'", fontWeight: 600, fontSize: '14px', marginBottom: '12px', color: '#1c1c1c' }}>
        {title}
      </div>
      {signed ? (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontFamily: "'Inter'", fontSize: '22px', fontStyle: 'italic', color: '#1c1c1c', fontWeight: 700 }}>
              {name}
            </span>
            <span style={{
              padding: '2px 8px', borderRadius: '12px', fontSize: '12px',
              backgroundColor: '#baedbd', color: '#1c1c1c', fontFamily: "'Inter'",
            }}>
              ✓ Signed
            </span>
          </div>
          <div style={{ fontFamily: "'Inter'", fontSize: '12px', color: 'rgba(28,28,28,0.5)' }}>
            Signed on {date}
          </div>
        </div>
      ) : (
        <div>
          <div style={{
            height: '60px',
            border: '2px dashed rgba(28,28,28,0.2)',
            borderRadius: '8px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: 'rgba(28,28,28,0.4)',
            fontFamily: "'Inter'", fontSize: '14px',
            marginBottom: '8px',
          }}>
            Click to sign
          </div>
          <button style={{
            height: '28px', padding: '4px 12px',
            backgroundColor: '#000', borderRadius: '8px', border: 'none',
            color: '#fff', fontFamily: "'Inter'", fontSize: '14px', cursor: 'pointer',
          }}>
            Sign Now
          </button>
        </div>
      )}
    </div>
  )
}

const TABS = ['Units', 'KSC Mapping', 'Declarations'] as const
type Tab = typeof TABS[number]

export default function ProgressReviewPage() {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('Units')

  const totalEvidence = units.reduce((acc, u) => acc + u.evidence, 0)
  const completedUnits = units.filter(u => u.progress === 100).length

  return (
    <div>
      {/* Back + title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <button
          onClick={() => router.push('/dashboard')}
          style={{
            background: 'none', border: '1px solid rgba(28,28,28,0.2)',
            borderRadius: '8px', padding: '4px 12px', height: '28px',
            cursor: 'pointer', fontFamily: "'Inter'", fontSize: '14px', color: '#1c1c1c',
          }}
        >
          ← Back
        </button>
        <h1 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: '18px', letterSpacing: '-0.36px', color: '#000', margin: 0 }}>
          Progress Review Details
        </h1>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
        {[
          { label: 'Overall Progress', value: '49%', bg: '#bfdbfe' },
          { label: 'Units Completed', value: `${completedUnits} / ${units.length}`, bg: '#baedbd' },
          { label: 'Total Evidence', value: String(totalEvidence), bg: '#baedbd' },
          { label: 'OTJ Hours', value: '77h 20m', bg: '#fef3c7' },
        ].map((stat, i) => (
          <div key={i} style={{
            flex: 1, backgroundColor: '#fff', borderRadius: '12px',
            border: '1px solid rgba(28,28,28,0.1)', padding: '16px',
            display: 'flex', flexDirection: 'column', gap: '4px',
          }}>
            <div style={{ fontFamily: "'Inter'", fontSize: '12px', color: 'rgba(28,28,28,0.5)' }}>{stat.label}</div>
            <div style={{
              fontFamily: "'Inter'", fontWeight: 700, fontSize: '24px', color: '#000',
              backgroundColor: stat.bg, borderRadius: '8px', padding: '4px 12px',
              display: 'inline-block', width: 'fit-content',
            }}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '16px' }}>
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: '4px 12px', height: '28px',
              border: 'none', borderRadius: '8px', cursor: 'pointer',
              fontFamily: "'Inter'", fontWeight: tab === t ? 600 : 400,
              fontSize: '14px',
              color: tab === t ? '#1c1c1c' : 'rgba(28,28,28,0.5)',
              backgroundColor: tab === t ? 'rgba(28,28,28,0.08)' : 'transparent',
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Units tab */}
      {tab === 'Units' && (
        <div style={cardStyle}>
          <div style={cardHeaderStyle}>Unit Progress</div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ ...thStyle, width: '45%' }}>Unit Name</th>
                <th style={{ ...thStyle, width: '20%' }}>Progress</th>
                <th style={{ ...thStyle, textAlign: 'center' }}>KSC</th>
                <th style={{ ...thStyle, textAlign: 'center' }}>Evidence</th>
                <th style={{ ...thStyle, textAlign: 'center' }}>Signed By</th>
                <th style={{ ...thStyle, textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {units.map((u, i) => (
                <tr key={i}>
                  <td style={{ ...tdStyle, borderBottom: i === units.length - 1 ? 'none' : undefined }}>{u.name}</td>
                  <td style={{ ...tdStyle, borderBottom: i === units.length - 1 ? 'none' : undefined }}>
                    <ProgressBar value={u.progress} />
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'center', borderBottom: i === units.length - 1 ? 'none' : undefined }}>{u.ksc}</td>
                  <td style={{ ...tdStyle, textAlign: 'center', borderBottom: i === units.length - 1 ? 'none' : undefined }}>{u.evidence}</td>
                  <td style={{ ...tdStyle, textAlign: 'center', borderBottom: i === units.length - 1 ? 'none' : undefined }}>
                    <span style={{ fontSize: '12px' }}>{u.signedBy}</span>
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'center', borderBottom: i === units.length - 1 ? 'none' : undefined }}>
                    <button style={{
                      padding: '2px 12px', height: '24px',
                      backgroundColor: '#000', borderRadius: '16px', border: 'none',
                      color: '#fff', fontFamily: "'Inter'", fontSize: '14px', cursor: 'pointer',
                    }}>
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* KSC Mapping tab */}
      {tab === 'KSC Mapping' && (
        <div style={cardStyle}>
          <div style={cardHeaderStyle}>Knowledge, Skills & Competency Mapping</div>
          <div style={{ padding: '20px' }}>
            {['Knowledge', 'Skills', 'Competency'].map((section) => (
              <div key={section} style={{ marginBottom: '20px' }}>
                <div style={{
                  fontFamily: "'Inter'", fontWeight: 600, fontSize: '14px',
                  color: '#1c1c1c', marginBottom: '8px',
                }}>
                  {section}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                  {[1, 2, 3, 4, 5, 6].map(n => (
                    <div key={n} style={{
                      border: '1px solid rgba(28,28,28,0.1)',
                      borderRadius: '8px', padding: '12px',
                      display: 'flex', alignItems: 'center', gap: '8px',
                    }}>
                      <div style={{
                        width: '20px', height: '20px', borderRadius: '50%',
                        backgroundColor: n <= 3 ? '#baedbd' : 'rgba(28,28,28,0.08)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '10px', fontWeight: 700,
                        flexShrink: 0,
                      }}>
                        {n <= 3 ? '✓' : n}
                      </div>
                      <span style={{ fontFamily: "'Inter'", fontSize: '13px', color: '#1c1c1c' }}>
                        {section} {n}.{n} - Standard criteria
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Declarations tab */}
      {tab === 'Declarations' && (
        <div style={cardStyle}>
          <div style={cardHeaderStyle}>Review Signatures & Declarations</div>
          <div style={{ padding: '20px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            <SignatureBlock title="Learner Declaration" name="John Doe" date="15/01/2025" signed={true} />
            <SignatureBlock title="Trainer / Assessor" name="Josseme" date="15/01/2025" signed={true} />
            <SignatureBlock title="IQA Countersign" name="" date="" signed={false} />
          </div>
        </div>
      )}
    </div>
  )
}
