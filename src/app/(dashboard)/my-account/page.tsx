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
const readOnlyInputStyle: React.CSSProperties = {
  ...inputStyle,
  backgroundColor: 'rgba(28,28,28,0.05)',
  color: 'rgba(28,28,28,0.6)',
}

const TABS = ['Personal Details', 'Programme Info', 'Security'] as const
type AccountTab = typeof TABS[number]

export default function MyAccountPage() {
  const router = useRouter()
  const [tab, setTab] = useState<AccountTab>('Personal Details')
  const [firstName, setFirstName] = useState('John')
  const [lastName, setLastName] = useState('Doe')
  const [email, setEmail] = useState('john.doe@example.com')
  const [phone, setPhone] = useState('+44 7700 900000')
  const [dob, setDob] = useState('1998-05-14')

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
          My Account
        </h1>
      </div>

      {/* Profile header card — matches Figma User Card design */}
      <div style={{
        backgroundColor: '#f7f9fb',
        border: '1px solid #95a4fc',
        borderRadius: '16px',
        width: '376px',
        height: '172px',
        overflow: 'hidden',
        position: 'relative',
        marginBottom: '20px',
        cursor: 'pointer',
      }}>
        {/* Avatar top-right */}
        <div style={{
          position: 'absolute', top: '24px', right: '24px',
          width: '40px', height: '40px', borderRadius: '800px',
          backgroundColor: 'rgba(28,28,28,0.08)',
          overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <circle cx="20" cy="16" r="7" fill="#9291A5"/>
            <path d="M6 36c0-7.732 6.268-14 14-14s14 6.268 14 14" fill="#9291A5"/>
          </svg>
        </div>

        {/* Name + last activity */}
        <div style={{ position: 'absolute', top: '24px', left: '24px', width: '289px' }}>
          <div style={{
            fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: '14px',
            color: '#000', lineHeight: '20px',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const,
            fontFeatureSettings: "'ss01' 1, 'cv01' 1, 'cv11' 1",
          }}>
            John Doe (Learner workforce training &amp; dev)
          </div>
          <div style={{
            fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: '12px',
            color: 'rgba(28,28,28,0.4)', lineHeight: '18px',
            fontFeatureSettings: "'ss01' 1, 'cv01' 1, 'cv11' 1",
          }}>
            Last activity on 17/11/2024 12:05
          </div>
        </div>

        {/* Small avatar + In Progress label */}
        <div style={{ position: 'absolute', top: '82px', left: '24px', display: 'flex', alignItems: 'center' }}>
          <div style={{ width: '24px', height: '24px', borderRadius: '800px', backgroundColor: 'rgba(28,28,28,0.08)', overflow: 'hidden' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="9" r="4" fill="#9291A5"/>
              <path d="M4 21c0-4.418 3.582-8 8-8s8 3.582 8 8" fill="#9291A5"/>
            </svg>
          </div>
        </div>
        <div style={{ position: 'absolute', top: '84px', right: '24px', display: 'flex', alignItems: 'center', gap: '2px' }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="5" fill="#8a8cd9"/>
          </svg>
          <span style={{
            fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: '12px',
            color: '#8a8cd9', lineHeight: '18px',
          }}>
            In Progress
          </span>
        </div>

        {/* Progress bar track */}
        <div style={{
          position: 'absolute', top: '117px', left: '23px', right: '23px',
          height: '4px', borderRadius: '16px', backgroundColor: 'rgba(28,28,28,0.1)',
        }}>
          <div style={{ width: '31%', height: '100%', borderRadius: '16px', backgroundColor: '#1c1c1c' }} />
        </div>

        {/* Task count + percentage */}
        <div style={{ position: 'absolute', top: '129px', left: '24px' }}>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '12px', color: '#000' }}>15 </span>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '12px', color: 'rgba(28,28,28,0.2)' }}>/ </span>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '12px', color: '#000' }}>48 </span>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '12px', color: 'rgba(28,28,28,0.4)' }}>Total Tasks</span>
        </div>
        <div style={{ position: 'absolute', top: '129px', right: '24px' }}>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '12px', color: '#000', textAlign: 'right' as const }}>51%</span>
        </div>
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

      {/* Personal Details tab */}
      {tab === 'Personal Details' && (
        <>
          <div style={cardStyle}>
            <div style={cardHeaderStyle}>Personal Information</div>
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={labelStyle}>First Name</label>
                  <input value={firstName} onChange={e => setFirstName(e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Last Name</label>
                  <input value={lastName} onChange={e => setLastName(e.target.value)} style={inputStyle} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={labelStyle}>Email Address</label>
                  <input value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} type="email" />
                </div>
                <div>
                  <label style={labelStyle}>Phone Number</label>
                  <input value={phone} onChange={e => setPhone(e.target.value)} style={inputStyle} type="tel" />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={labelStyle}>Date of Birth</label>
                  <input value={dob} onChange={e => setDob(e.target.value)} style={inputStyle} type="date" />
                </div>
                <div>
                  <label style={labelStyle}>Unique Learner Number (ULN)</label>
                  <input value="1234567890" readOnly style={readOnlyInputStyle} />
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <button style={{
              height: '28px', padding: '4px 16px',
              border: '1px solid rgba(28,28,28,0.2)', borderRadius: '8px',
              backgroundColor: 'transparent', cursor: 'pointer',
              fontFamily: "'Inter'", fontSize: '14px', color: '#1c1c1c',
            }}>
              Cancel
            </button>
            <button style={{
              height: '28px', padding: '4px 16px',
              backgroundColor: '#000', borderRadius: '8px', border: 'none',
              color: '#fff', fontFamily: "'Inter'", fontSize: '14px', cursor: 'pointer',
            }}>
              Save Changes
            </button>
          </div>
        </>
      )}

      {/* Programme Info tab */}
      {tab === 'Programme Info' && (
        <div style={cardStyle}>
          <div style={cardHeaderStyle}>Programme Information</div>
          <div style={{ padding: '20px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
            {[
              { label: 'Programme', value: 'Level 3 Business Administration' },
              { label: 'Workplace', value: 'Default Workplace' },
              { label: 'Trainer / Assessor', value: 'Josseme' },
              { label: 'Programme Status', value: 'In Progress' },
              { label: 'Start Date', value: '06/01/2025' },
              { label: 'Expected End Date', value: '05/01/2026' },
              { label: 'OTJ Target Hours', value: '427h' },
              { label: 'OTJ Achieved', value: '77h 20m' },
            ].map((item, i) => (
              <div key={i}>
                <label style={labelStyle}>{item.label}</label>
                <input value={item.value} readOnly style={readOnlyInputStyle} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Security tab */}
      {tab === 'Security' && (
        <div style={cardStyle}>
          <div style={cardHeaderStyle}>Change Password</div>
          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '480px' }}>
            <div>
              <label style={labelStyle}>Current Password</label>
              <input type="password" placeholder="Enter current password" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>New Password</label>
              <input type="password" placeholder="Enter new password" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Confirm New Password</label>
              <input type="password" placeholder="Confirm new password" style={inputStyle} />
            </div>
            <div>
              <button style={{
                height: '28px', padding: '4px 16px',
                backgroundColor: '#000', borderRadius: '8px', border: 'none',
                color: '#fff', fontFamily: "'Inter'", fontSize: '14px', cursor: 'pointer',
              }}>
                Update Password
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
