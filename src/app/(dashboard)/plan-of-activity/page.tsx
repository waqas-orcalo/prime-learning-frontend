'use client'

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

const schedules = [
  { week: 'Week 1', date: '06/01/2025', activity: 'Induction and Orientation', hours: '6h', type: 'On-the-job', status: 'Completed' },
  { week: 'Week 2', date: '13/01/2025', activity: 'Unit 01 Overview', hours: '6h', type: 'Off-the-job', status: 'Completed' },
  { week: 'Week 3', date: '20/01/2025', activity: 'Assessment Workshop', hours: '6h', type: 'Off-the-job', status: 'In Progress' },
  { week: 'Week 4', date: '27/01/2025', activity: 'Skills Development Session', hours: '6h', type: 'Off-the-job', status: 'Pending' },
  { week: 'Week 5', date: '03/02/2025', activity: 'Progress Review', hours: '2h', type: 'On-the-job', status: 'Pending' },
  { week: 'Week 6', date: '10/02/2025', activity: 'Unit 02 Introduction', hours: '6h', type: 'Off-the-job', status: 'Pending' },
]

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

export default function PlanOfActivityPage() {
  const router = useRouter()

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
          Plan of Activity
        </h1>
      </div>

      {/* Programme Information */}
      <div style={cardStyle}>
        <div style={cardHeaderStyle}>Programme Information</div>
        <div style={{ padding: '16px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
          {[
            { label: 'Learner', value: 'John Doe' },
            { label: 'Programme', value: 'Level 3 Business Administration' },
            { label: 'Workplace', value: 'Default Workplace' },
            { label: 'Trainer', value: 'Josseme' },
            { label: 'Start Date', value: '06/01/2025' },
            { label: 'End Date', value: '05/01/2026' },
            { label: 'OTJ Target', value: '427h' },
            { label: 'OTJ Achieved', value: '77h 20m' },
          ].map((item, i) => (
            <div key={i}>
              <div style={{ fontFamily: "'Inter'", fontSize: '12px', color: 'rgba(28,28,28,0.5)', marginBottom: '2px' }}>
                {item.label}
              </div>
              <div style={{ fontFamily: "'Inter'", fontWeight: 600, fontSize: '14px', color: '#1c1c1c' }}>
                {item.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Training Schedule */}
      <div style={cardStyle}>
        <div style={{ ...cardHeaderStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Training Schedule</span>
          <button style={{
            height: '28px', padding: '4px 12px',
            backgroundColor: '#000', borderRadius: '8px', border: 'none',
            color: '#fff', fontFamily: "'Inter'", fontSize: '14px', cursor: 'pointer',
          }}>
            + Add Session
          </button>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={thStyle}>Week</th>
              <th style={thStyle}>Date</th>
              <th style={thStyle}>Activity</th>
              <th style={{ ...thStyle, textAlign: 'center' }}>Hours</th>
              <th style={thStyle}>Type</th>
              <th style={{ ...thStyle, textAlign: 'center' }}>Status</th>
              <th style={{ ...thStyle, textAlign: 'center' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {schedules.map((s, i) => (
              <tr key={i}>
                <td style={{ ...tdStyle, fontWeight: 600 }}>{s.week}</td>
                <td style={tdStyle}>{s.date}</td>
                <td style={tdStyle}>{s.activity}</td>
                <td style={{ ...tdStyle, textAlign: 'center' }}>{s.hours}</td>
                <td style={tdStyle}>
                  <span style={{
                    padding: '2px 8px', borderRadius: '12px', fontSize: '12px',
                    backgroundColor: s.type === 'Off-the-job' ? '#bfdbfe' : '#baedbd',
                    color: '#1c1c1c',
                  }}>
                    {s.type}
                  </span>
                </td>
                <td style={{ ...tdStyle, textAlign: 'center' }}>
                  <span style={{
                    padding: '2px 8px', borderRadius: '12px', fontSize: '12px',
                    backgroundColor: s.status === 'Completed' ? '#baedbd' :
                      s.status === 'In Progress' ? '#bfdbfe' : 'rgba(28,28,28,0.08)',
                    color: '#1c1c1c',
                  }}>
                    {s.status}
                  </span>
                </td>
                <td style={{ ...tdStyle, textAlign: 'center', borderBottom: i === schedules.length - 1 ? 'none' : undefined }}>
                  <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="#1c1c1c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="#1c1c1c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <polyline points="3 6 5 6 21 6" stroke="#1c1c1c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M19 6l-1 14H6L5 6m5 0V4h4v2" stroke="#1c1c1c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Signatures */}
      <div style={cardStyle}>
        <div style={cardHeaderStyle}>Signatures</div>
        <div style={{ padding: '20px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          <SignatureBlock title="Learner" name="John Doe" date="06/01/2025" signed={true} />
          <SignatureBlock title="Trainer / Assessor" name="Josseme" date="06/01/2025" signed={true} />
          <SignatureBlock title="Employer / IQA" name="" date="" signed={false} />
        </div>
      </div>
    </div>
  )
}
