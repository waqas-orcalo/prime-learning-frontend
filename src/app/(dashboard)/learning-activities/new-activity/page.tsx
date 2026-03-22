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

const METHODS = [
  'Online Course', 'Classroom Delivery', 'Workshop', 'Self-Directed Study',
  'Competition', 'Assignment', 'Observation', 'Mentoring', 'E-Learning',
]

export default function NewActivityPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [method, setMethod] = useState('Online Course')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('10:00')
  const [aim, setAim] = useState('Level 3 Business Administration')

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
          Start New Learning Activity
        </h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {/* Left — Activity Details */}
        <div style={cardStyle}>
          <div style={cardHeaderStyle}>Activity Details</div>
          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Activity Title</label>
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Enter activity title..."
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Learning Aim</label>
              <select value={aim} onChange={e => setAim(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                <option>Level 3 Business Administration</option>
                <option>Level 2 Marketing</option>
                <option>Level 3 Project Management</option>
              </select>
            </div>

            <div>
              <label style={labelStyle}>Method of Learning</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {METHODS.map(m => (
                  <button
                    key={m}
                    onClick={() => setMethod(m)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '8px',
                      border: '1px solid',
                      borderColor: method === m ? '#000' : 'rgba(28,28,28,0.2)',
                      backgroundColor: method === m ? '#000' : 'transparent',
                      color: method === m ? '#fff' : '#1c1c1c',
                      fontFamily: "'Inter'", fontSize: '13px', cursor: 'pointer',
                      fontWeight: method === m ? 600 : 400,
                    }}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
              <div>
                <label style={labelStyle}>Date</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Start Time</label>
                <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>End Time</label>
                <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} style={inputStyle} />
              </div>
            </div>
          </div>
        </div>

        {/* Right — Description */}
        <div style={cardStyle}>
          <div style={cardHeaderStyle}>Activity Description</div>
          <div style={{ padding: '16px' }}>
            {/* Toolbar */}
            <div style={{
              display: 'flex', gap: '4px', flexWrap: 'wrap', padding: '8px',
              borderRadius: '8px', border: '1px solid rgba(28,28,28,0.1)',
              backgroundColor: 'rgba(28,28,28,0.02)', marginBottom: '12px',
            }}>
              {['B', 'I', 'U', 'H1', 'H2', '— List', 'Link'].map(btn => (
                <button key={btn} style={{
                  padding: '4px 10px', borderRadius: '6px',
                  border: '1px solid rgba(28,28,28,0.15)',
                  backgroundColor: '#fff',
                  fontFamily: "'Inter'", fontSize: '13px', cursor: 'pointer',
                  color: '#1c1c1c',
                }}>
                  {btn}
                </button>
              ))}
            </div>
            <div
              contentEditable
              suppressContentEditableWarning
              onInput={(e: React.FormEvent<HTMLDivElement>) => {
                // content captured via contentEditable
                void e.currentTarget.textContent
              }}
              style={{
                minHeight: '280px',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid rgba(28,28,28,0.1)',
                fontFamily: "'Inter'", fontSize: '14px', color: '#1c1c1c',
                outline: 'none', lineHeight: '1.6',
              }}
            >
              Describe the learning activity in detail...
            </div>
          </div>
        </div>
      </div>

      {/* Off-The-Job Hours */}
      <div style={cardStyle}>
        <div style={cardHeaderStyle}>Off-The-Job Hours</div>
        <div style={{ padding: '20px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          {[
            { label: 'Hours Claimed', placeholder: '0' },
            { label: 'Minutes Claimed', placeholder: '0' },
            { label: 'Location', placeholder: 'e.g. Workplace, College...' },
          ].map((f, i) => (
            <div key={i}>
              <label style={labelStyle}>{f.label}</label>
              <input placeholder={f.placeholder} style={inputStyle} />
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
          Save Activity
        </button>
      </div>
    </div>
  )
}
