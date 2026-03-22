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
const labelStyle: React.CSSProperties = {
  fontFamily: "'Inter', sans-serif",
  fontWeight: 600,
  fontSize: '14px',
  color: '#1c1c1c',
  marginBottom: '4px',
  display: 'block',
}
const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 12px',
  borderRadius: '8px',
  border: '1px solid rgba(28,28,28,0.2)',
  backgroundColor: 'rgba(28,28,28,0.03)',
  fontFamily: "'Inter', sans-serif",
  fontSize: '14px',
  color: '#1c1c1c',
  outline: 'none',
  boxSizing: 'border-box',
}

export default function VisitPage() {
  const router = useRouter()
  const [visitType, setVisitType] = useState('Observation')
  const [date, setDate] = useState('2025-01-20')
  const [travelTime, setTravelTime] = useState('30')
  const [travelMode, setTravelMode] = useState('Car')
  const [duration, setDuration] = useState('90')
  const [notes, setNotes] = useState('')

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
          Record Visit
        </h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {/* Visit Details */}
        <div style={cardStyle}>
          <div style={cardHeaderStyle}>Visit Details</div>
          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Visit Type</label>
              <select value={visitType} onChange={e => setVisitType(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                <option>Observation</option>
                <option>Progress Review</option>
                <option>Employer Visit</option>
                <option>Initial Assessment</option>
                <option>EPA Readiness</option>
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={labelStyle}>Visit Date</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Duration (minutes)</label>
                <input
                  type="number"
                  value={duration}
                  onChange={e => setDuration(e.target.value)}
                  style={inputStyle}
                  min="0"
                />
              </div>
            </div>
            <div>
              <label style={labelStyle}>Trainer / Assessor</label>
              <input value="Josseme" readOnly style={{ ...inputStyle, backgroundColor: 'rgba(28,28,28,0.05)' }} />
            </div>
            <div>
              <label style={labelStyle}>Learner</label>
              <input value="John Doe" readOnly style={{ ...inputStyle, backgroundColor: 'rgba(28,28,28,0.05)' }} />
            </div>
          </div>
        </div>

        {/* Right column */}
        <div>
          <div style={cardStyle}>
            <div style={cardHeaderStyle}>Travel Time</div>
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>Travel Time (minutes)</label>
                  <input
                    type="number"
                    value={travelTime}
                    onChange={e => setTravelTime(e.target.value)}
                    style={inputStyle}
                    min="0"
                  />
                </div>
                <div>
                  <label style={labelStyle}>Mode of Transport</label>
                  <select value={travelMode} onChange={e => setTravelMode(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                    <option>Car</option>
                    <option>Public Transport</option>
                    <option>Walking</option>
                    <option>Cycling</option>
                    <option>Remote / No Travel</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={labelStyle}>Start Location</label>
                <input placeholder="e.g. Prime Learning Office" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>End Location</label>
                <input placeholder="e.g. Learner Workplace" style={inputStyle} />
              </div>
            </div>
          </div>

          <div style={cardStyle}>
            <div style={cardHeaderStyle}>Visit Notes</div>
            <div style={{ padding: '20px' }}>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Add any notes about this visit..."
                style={{
                  ...inputStyle,
                  minHeight: '120px',
                  resize: 'vertical',
                  lineHeight: '1.5',
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Signatures */}
      <div style={cardStyle}>
        <div style={cardHeaderStyle}>Signatures</div>
        <div style={{ padding: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          {['Learner Signature', 'Trainer Signature'].map((sig, i) => (
            <div key={i}>
              <label style={labelStyle}>{sig}</label>
              <div style={{
                height: '100px',
                border: '2px dashed rgba(28,28,28,0.2)',
                borderRadius: '8px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
                color: 'rgba(28,28,28,0.4)',
                fontFamily: "'Inter'", fontSize: '14px',
              }}>
                Click to sign
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
        <button
          onClick={() => router.push('/dashboard')}
          style={{
            height: '28px', padding: '4px 16px',
            border: '1px solid rgba(28,28,28,0.2)', borderRadius: '8px',
            backgroundColor: 'transparent', cursor: 'pointer',
            fontFamily: "'Inter'", fontSize: '14px', color: '#1c1c1c',
          }}
        >
          Cancel
        </button>
        <button style={{
          height: '28px', padding: '4px 16px',
          backgroundColor: '#000', borderRadius: '8px', border: 'none',
          color: '#fff', fontFamily: "'Inter'", fontSize: '14px', cursor: 'pointer',
        }}>
          Save Visit
        </button>
      </div>
    </div>
  )
}
