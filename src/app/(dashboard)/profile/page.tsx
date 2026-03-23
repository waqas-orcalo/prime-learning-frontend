'use client'

import { useState, useRef } from 'react'

const FF = { fontFamily: "'Inter', sans-serif", fontFeatureSettings: "'ss01' 1, 'cv01' 1, 'cv11' 1" } as const
const font = (size: number, weight = 400, color = '#1c1c1c', extra: React.CSSProperties = {}) =>
  ({ ...FF, fontSize: `${size}px`, fontWeight: weight, color, ...extra } as React.CSSProperties)

const sectionCard: React.CSSProperties = {
  backgroundColor: '#fff',
  borderRadius: '12px',
  border: '1px solid rgba(28,28,28,0.1)',
  overflow: 'hidden',
  marginBottom: '16px',
}
const sectionHeader: React.CSSProperties = {
  ...FF,
  fontSize: '16px',
  fontWeight: 600,
  color: '#1c1c1c',
  padding: '16px 20px',
  borderBottom: '1px solid rgba(28,28,28,0.1)',
}
const fieldInput: React.CSSProperties = {
  width: '100%',
  boxSizing: 'border-box' as const,
  height: '40px',
  padding: '0 12px',
  border: '1px solid rgba(28,28,28,0.15)',
  borderRadius: '8px',
  backgroundColor: 'rgba(28,28,28,0.02)',
  ...FF,
  fontSize: '14px',
  color: '#1c1c1c',
  outline: 'none',
}
const fieldSelect: React.CSSProperties = {
  ...fieldInput,
  appearance: 'none' as const,
  cursor: 'pointer',
  backgroundImage: `url("data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 6l4 4 4-4" stroke="#1c1c1c" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>')}")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 10px center',
  paddingRight: '32px',
}
const fieldLabel: React.CSSProperties = {
  ...FF,
  fontSize: '13px',
  fontWeight: 400,
  color: 'rgba(28,28,28,0.6)',
  display: 'block',
  marginBottom: '6px',
}

interface FieldProps {
  label: string
  value: string
  onChange?: (v: string) => void
  type?: 'text' | 'select'
  options?: string[]
  placeholder?: string
}

function Field({ label, value, onChange, type = 'text', options = [], placeholder }: FieldProps) {
  return (
    <div>
      <label style={fieldLabel}>{label}</label>
      {type === 'select' ? (
        <div style={{ position: 'relative' }}>
          <select
            value={value}
            onChange={e => onChange?.(e.target.value)}
            style={fieldSelect}
          >
            {options.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
      ) : (
        <input
          value={value}
          onChange={e => onChange?.(e.target.value)}
          placeholder={placeholder ?? 'Text'}
          style={fieldInput}
        />
      )}
    </div>
  )
}

export default function ProfilePage() {
  const fileRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [uploadedFile, setUploadedFile] = useState('Resume.pdf')

  // My Details fields
  const [pronouns, setPronouns] = useState('None')
  const [landline, setLandline] = useState('')
  const [mobile, setMobile] = useState('')
  const [skype, setSkype] = useState('')
  const [website, setWebsite] = useState('')
  const [workplace, setWorkplace] = useState('')
  const [address, setAddress] = useState('')
  const [timezone, setTimezone] = useState('None')
  const [homeAddress, setHomeAddress] = useState('')

  // Equality fields
  const [ethnicity, setEthnicity] = useState('Unknown')
  const [llddStatus, setLlddStatus] = useState('Learner considers himself or herself to have a learning difficulty and/or health problem.')
  const [sex, setSex] = useState('Unknown')
  const [llddCondition, setLlddCondition] = useState('Dyslexia')

  return (
    <div style={{ maxWidth: '900px' }}>
      {/* Page title */}
      <h1 style={{ ...font(22, 700, '#1c1c1c'), letterSpacing: '-0.44px', lineHeight: '28px', marginBottom: '24px' }}>
        My Profile
      </h1>

      {/* === Avatar & Name === */}
      <div style={{ ...sectionCard, padding: '24px', display: 'flex', alignItems: 'flex-start', gap: '24px', marginBottom: '16px' }}>
        {/* Left: avatar + name + upload */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          {/* Avatar */}
          <div style={{
            width: '80px', height: '80px', borderRadius: '50%',
            backgroundColor: 'rgba(28,28,28,0.08)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden', flexShrink: 0,
          }}>
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
              <circle cx="40" cy="32" r="14" fill="#9291A5"/>
              <path d="M12 72c0-15.464 12.536-28 28-28s28 12.536 28 28" fill="#9291A5"/>
            </svg>
          </div>
          <span style={font(16, 600, '#1c1c1c')}>John Doe</span>
          <button style={{
            ...FF,
            fontSize: '13px',
            fontWeight: 500,
            color: '#fff',
            backgroundColor: '#1c1c1c',
            border: 'none',
            borderRadius: '8px',
            padding: '5px 12px',
            height: '28px',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}>
            Upload new profile picture
          </button>
        </div>

        {/* Right: info notices */}
        <div style={{
          flex: 1,
          backgroundColor: 'rgba(28,28,28,0.03)',
          borderRadius: '12px',
          border: '1px solid rgba(28,28,28,0.1)',
          padding: '16px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}>
          {[
            'This page was last updated on 19/12/2024 01:59.',
            "Please note emails are now managed on the 'Email Preferences' page",
          ].map((msg, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ flexShrink: 0, marginTop: '1px' }}>
                <rect x="1" y="1" width="16" height="16" rx="3" stroke="#1c1c1c" strokeWidth="1.4"/>
                <path d="M5 9l3 3 5-5" stroke="#1c1c1c" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span style={font(13, 400, 'rgba(28,28,28,0.7)')}>{msg}</span>
            </div>
          ))}
        </div>
      </div>

      {/* === My Details === */}
      <div style={sectionCard}>
        <div style={sectionHeader}>My Details</div>
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Row 1: Pronouns | Landline | Mobile */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            <Field
              label="Pronouns"
              value={pronouns}
              onChange={setPronouns}
              type="select"
              options={['None', 'He/Him', 'She/Her', 'They/Them', 'Other']}
            />
            <Field label="Landline telephone number" value={landline} onChange={setLandline} placeholder="Text" />
            <Field label="Mobile telephone number" value={mobile} onChange={setMobile} placeholder="Text" />
          </div>
          {/* Row 2: Skype | Website | Name of study/work */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            <Field label="Skype name" value={skype} onChange={setSkype} placeholder="Text" />
            <Field label="Website link (Facebook, Twitter, etc.)" value={website} onChange={setWebsite} placeholder="Text" />
            <Field label="Name of study/work place (e.g. employer name)" value={workplace} onChange={setWorkplace} placeholder="Text" />
          </div>
          {/* Row 3: Address | Time Zone | Home address */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            <Field label="Address of study/ work" value={address} onChange={setAddress} placeholder="Text" />
            <Field
              label="Time Zone"
              value={timezone}
              onChange={setTimezone}
              type="select"
              options={['None', 'GMT (UTC+0)', 'BST (UTC+1)', 'EST (UTC-5)', 'PST (UTC-8)']}
            />
            <Field label="Home address (including post code)>" value={homeAddress} onChange={setHomeAddress} placeholder="Text" />
          </div>
        </div>
      </div>

      {/* === Attachments === */}
      <div style={sectionCard}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(28,28,28,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ ...FF, fontSize: '16px', fontWeight: 600, color: '#1c1c1c' }}>
            Attachments (CV, qualification certificates &amp; other professional documents)
          </span>
        </div>
        <div style={{ padding: '20px' }}>
          {/* Action row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <button style={{
              ...FF,
              fontSize: '13px',
              fontWeight: 500,
              color: '#fff',
              backgroundColor: '#1c1c1c',
              border: 'none',
              borderRadius: '8px',
              padding: '5px 12px',
              height: '28px',
              cursor: 'pointer',
            }}>
              Create link
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={font(13, 400, 'rgba(28,28,28,0.7)', { textDecoration: 'underline', cursor: 'pointer' })}>
                View supported file types
              </span>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="7" r="6" stroke="rgba(28,28,28,0.5)" strokeWidth="1.2"/>
                <path d="M7 6v4" stroke="rgba(28,28,28,0.5)" strokeWidth="1.2" strokeLinecap="round"/>
                <circle cx="7" cy="4.5" r="0.7" fill="rgba(28,28,28,0.5)"/>
              </svg>
            </div>
          </div>

          {/* Drop zone */}
          <div
            onDragOver={e => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={e => {
              e.preventDefault()
              setDragging(false)
              const file = e.dataTransfer.files[0]
              if (file) setUploadedFile(file.name)
            }}
            style={{
              border: `1.5px dashed ${dragging ? '#1c1c1c' : 'rgba(28,28,28,0.2)'}`,
              borderRadius: '12px',
              backgroundColor: dragging ? 'rgba(28,28,28,0.03)' : 'rgba(28,28,28,0.02)',
              padding: '28px 20px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '16px',
              transition: 'all 0.15s',
            }}
          >
            {/* Upload icon */}
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <path d="M20 26V14m0 0l-5 5m5-5l5 5" stroke="rgba(28,28,28,0.4)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M10 30a8 8 0 0 1 0-16 8.5 8.5 0 0 1 16.97-1.04A6 6 0 0 1 30 24" stroke="rgba(28,28,28,0.3)" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
            <span style={font(14, 500, '#1c1c1c')}>Select a file or drag and drop here</span>
            <span style={font(12, 400, 'rgba(28,28,28,0.5)')}>JPG, PNG or PDF, file size no more than 10MB</span>
            <input type="file" ref={fileRef} style={{ display: 'none' }} onChange={e => { if (e.target.files?.[0]) setUploadedFile(e.target.files[0].name) }} />
            <button
              onClick={() => fileRef.current?.click()}
              style={{
                ...FF,
                fontSize: '13px',
                fontWeight: 500,
                color: '#1c1c1c',
                backgroundColor: 'transparent',
                border: '1px solid rgba(28,28,28,0.25)',
                borderRadius: '8px',
                padding: '5px 16px',
                height: '30px',
                cursor: 'pointer',
                marginTop: '4px',
              }}
            >
              SELECT FILE
            </button>
          </div>

          {/* Uploaded file */}
          {uploadedFile && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M4 2h7l4 4v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z" stroke="#3b6df4" strokeWidth="1.3"/>
                <path d="M11 2v4h4" stroke="#3b6df4" strokeWidth="1.3"/>
              </svg>
              <span style={font(14, 400, '#3b6df4', { textDecoration: 'underline', cursor: 'pointer' })}>{uploadedFile}</span>
            </div>
          )}
        </div>
      </div>

      {/* === Equality, LLDD and Health === */}
      <div style={sectionCard}>
        <div style={sectionHeader}>Equality, LLDD and Health</div>
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Row 1 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Field
              label="Ethnicity"
              value={ethnicity}
              onChange={setEthnicity}
              type="select"
              options={['Unknown', 'White British', 'White Irish', 'White Other', 'Mixed White & Black Caribbean', 'Asian or Asian British - Indian', 'Black or Black British - Caribbean', 'Other']}
            />
            <Field
              label="Learner's LLDD and Health Status:"
              value={llddStatus}
              onChange={setLlddStatus}
              type="select"
              options={[
                'Learner considers himself or herself to have a learning difficulty and/or health problem.',
                'Learner does not consider himself or herself to have a learning difficulty and/or health problem.',
                'Not provided',
              ]}
            />
          </div>
          {/* Row 2 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Field
              label="Sex:"
              value={sex}
              onChange={setSex}
              type="select"
              options={['Unknown', 'Male', 'Female', 'Other', 'Prefer not to say']}
            />
            <Field
              label="Primary LLDD or Health Condition:"
              value={llddCondition}
              onChange={setLlddCondition}
              type="select"
              options={['Dyslexia', 'Dyscalculia', 'Autism spectrum disorder', 'Visual impairment', 'Hearing impairment', 'Physical disability', 'Mental health difficulty', 'Other', 'None']}
            />
          </div>
        </div>
      </div>

      {/* Footer buttons */}
      <div style={{ display: 'flex', gap: '8px', paddingBottom: '32px' }}>
        <button style={{
          ...FF,
          fontSize: '14px',
          fontWeight: 500,
          color: '#fff',
          backgroundColor: '#1c1c1c',
          border: 'none',
          borderRadius: '8px',
          padding: '6px 20px',
          height: '34px',
          cursor: 'pointer',
        }}>
          Send
        </button>
        <button style={{
          ...FF,
          fontSize: '14px',
          fontWeight: 400,
          color: '#1c1c1c',
          backgroundColor: 'transparent',
          border: '1px solid rgba(28,28,28,0.2)',
          borderRadius: '8px',
          padding: '6px 20px',
          height: '34px',
          cursor: 'pointer',
        }}>
          Cancel
        </button>
      </div>
    </div>
  )
}
