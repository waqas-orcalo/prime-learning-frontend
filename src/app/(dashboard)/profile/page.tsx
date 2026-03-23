'use client'

import { useState, useRef, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { apiFetch } from '@/lib/api-client'

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
  disabled?: boolean
}

function Field({ label, value, onChange, type = 'text', options = [], placeholder, disabled }: FieldProps) {
  return (
    <div>
      <label style={fieldLabel}>{label}</label>
      {type === 'select' ? (
        <div style={{ position: 'relative' }}>
          <select
            value={value}
            onChange={e => onChange?.(e.target.value)}
            disabled={disabled}
            style={{ ...fieldSelect, opacity: disabled ? 0.5 : 1 }}
          >
            {options.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
      ) : (
        <input
          value={value}
          onChange={e => onChange?.(e.target.value)}
          placeholder={placeholder ?? ''}
          disabled={disabled}
          style={{ ...fieldInput, opacity: disabled ? 0.5 : 1 }}
        />
      )}
    </div>
  )
}

interface UserProfile {
  _id?: string
  firstName: string
  lastName: string
  email: string
  role?: string
  avatarUrl?: string | null
  phone?: string
  pronouns?: string
  landline?: string
  mobile?: string
  skype?: string
  website?: string
  workplace?: string
  address?: string
  timezone?: string
  homeAddress?: string
  updatedAt?: string
}

export default function ProfilePage() {
  const { data: session } = useSession()
  const token = (session?.user as any)?.accessToken as string | undefined

  const fileRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [uploadedFile, setUploadedFile] = useState('Resume.pdf')

  // Loading / saving states
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const [saveMsg, setSaveMsg]   = useState('')
  const [loadErr, setLoadErr]   = useState('')

  // Profile fields — all start empty, loaded from API
  const [firstName, setFirstName] = useState('')
  const [lastName,  setLastName]  = useState('')
  const [email,     setEmail]     = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [updatedAt, setUpdatedAt] = useState('')

  const [pronouns,    setPronouns]    = useState('None')
  const [landline,    setLandline]    = useState('')
  const [mobile,      setMobile]      = useState('')
  const [skype,       setSkype]       = useState('')
  const [website,     setWebsite]     = useState('')
  const [workplace,   setWorkplace]   = useState('')
  const [address,     setAddress]     = useState('')
  const [timezone,    setTimezone]    = useState('None')
  const [homeAddress, setHomeAddress] = useState('')

  // Equality fields (local only — no backend field yet)
  const [ethnicity,     setEthnicity]     = useState('Unknown')
  const [llddStatus,    setLlddStatus]    = useState('Learner considers himself or herself to have a learning difficulty and/or health problem.')
  const [sex,           setSex]           = useState('Unknown')
  const [llddCondition, setLlddCondition] = useState('Dyslexia')

  // ── Load profile from API ──────────────────────────────────────────────
  useEffect(() => {
    if (!token) return
    setLoading(true)
    apiFetch<any>('/users/me', token)
      .then(res => {
        const u: UserProfile = res?.data ?? res
        setFirstName(u.firstName ?? '')
        setLastName(u.lastName ?? '')
        setEmail(u.email ?? '')
        setAvatarUrl(u.avatarUrl ?? null)
        setUpdatedAt(u.updatedAt ?? '')
        setPronouns(u.pronouns ?? 'None')
        setLandline(u.landline ?? '')
        setMobile(u.mobile ?? u.phone ?? '')
        setSkype(u.skype ?? '')
        setWebsite(u.website ?? '')
        setWorkplace(u.workplace ?? '')
        setAddress(u.address ?? '')
        setTimezone(u.timezone ?? 'None')
        setHomeAddress(u.homeAddress ?? '')
      })
      .catch(e => setLoadErr(e?.message ?? 'Failed to load profile'))
      .finally(() => setLoading(false))
  }, [token])

  // ── Save profile to API ────────────────────────────────────────────────
  const handleSave = async () => {
    if (!token) return
    setSaving(true)
    setSaveMsg('')
    try {
      await apiFetch('/users/me', token, {
        method: 'PATCH',
        body: JSON.stringify({
          firstName, lastName,
          pronouns: pronouns === 'None' ? null : pronouns,
          landline: landline || null,
          mobile:   mobile   || null,
          skype:    skype    || null,
          website:  website  || null,
          workplace: workplace || null,
          address:  address  || null,
          timezone: timezone === 'None' ? null : timezone,
          homeAddress: homeAddress || null,
        }),
      })
      setSaveMsg('Profile saved successfully.')
    } catch (e: any) {
      setSaveMsg(e?.message ?? 'Failed to save profile.')
    } finally {
      setSaving(false)
      setTimeout(() => setSaveMsg(''), 4000)
    }
  }

  const displayName = [firstName, lastName].filter(Boolean).join(' ') || 'User'
  const initials    = displayName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  const formatDate = (dt: string) => {
    if (!dt) return ''
    const d = new Date(dt)
    if (isNaN(d.getTime())) return dt
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) +
      ' ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  }

  if (loading) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', ...font(14, 400, 'rgba(28,28,28,0.4)') }}>
        Loading profile…
      </div>
    )
  }

  if (loadErr) {
    return (
      <div style={{ padding: '60px', textAlign: 'center' }}>
        <div style={font(14, 400, '#dc2626', { marginBottom: '12px' })}>{loadErr}</div>
        <button
          onClick={() => window.location.reload()}
          style={{ ...font(13, 500, '#fff'), backgroundColor: '#1c1c1c', border: 'none', borderRadius: '8px', padding: '6px 16px', cursor: 'pointer' }}
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '900px' }}>
      {/* Page title */}
      <h1 style={{ ...font(22, 700, '#1c1c1c'), letterSpacing: '-0.44px', lineHeight: '28px', marginBottom: '24px' }}>
        My Profile
      </h1>

      {/* Save message toast */}
      {saveMsg && (
        <div style={{
          marginBottom: '16px',
          padding: '10px 16px',
          backgroundColor: saveMsg.includes('success') ? '#f0faf0' : '#fff1f1',
          border: `1px solid ${saveMsg.includes('success') ? '#7bc67e' : '#f87171'}`,
          borderRadius: '8px',
          ...font(13, 400, saveMsg.includes('success') ? '#166534' : '#dc2626'),
        }}>
          {saveMsg}
        </div>
      )}

      {/* === Avatar & Name === */}
      <div style={{ ...sectionCard, padding: '24px', display: 'flex', alignItems: 'flex-start', gap: '24px', marginBottom: '16px' }}>
        {/* Left: avatar + name + upload */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '80px', height: '80px', borderRadius: '50%',
            backgroundColor: 'rgba(28,28,28,0.08)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden', flexShrink: 0,
          }}>
            {avatarUrl ? (
              <img src={avatarUrl} alt={displayName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ ...font(28, 600, '#1c1c1c') }}>{initials}</span>
            )}
          </div>
          <span style={font(16, 600, '#1c1c1c')}>{displayName}</span>
          <input type="file" ref={fileRef} style={{ display: 'none' }} accept="image/*" onChange={e => {
            const file = e.target.files?.[0]
            if (file) {
              const url = URL.createObjectURL(file)
              setAvatarUrl(url)
            }
          }} />
          <button
            onClick={() => fileRef.current?.click()}
            style={{
              ...FF, fontSize: '13px', fontWeight: 500, color: '#fff',
              backgroundColor: '#1c1c1c', border: 'none', borderRadius: '8px',
              padding: '5px 12px', height: '28px', cursor: 'pointer', whiteSpace: 'nowrap',
            }}
          >
            Upload new profile picture
          </button>
        </div>

        {/* Right: info notices */}
        <div style={{
          flex: 1, backgroundColor: 'rgba(28,28,28,0.03)', borderRadius: '12px',
          border: '1px solid rgba(28,28,28,0.1)', padding: '16px 20px',
          display: 'flex', flexDirection: 'column', gap: '10px',
        }}>
          {[
            updatedAt ? `This page was last updated on ${formatDate(updatedAt)}.` : 'Profile information is loaded from your account.',
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
          {/* Email (read-only) */}
          <div style={{ marginTop: '4px' }}>
            <span style={{ ...font(12, 400, 'rgba(28,28,28,0.5)'), display: 'block', marginBottom: '2px' }}>Email address</span>
            <span style={font(14, 400, '#1c1c1c')}>{email}</span>
          </div>
        </div>
      </div>

      {/* Name fields */}
      <div style={sectionCard}>
        <div style={sectionHeader}>Name</div>
        <div style={{ padding: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <Field label="First name" value={firstName} onChange={setFirstName} placeholder="First name" />
          <Field label="Last name"  value={lastName}  onChange={setLastName}  placeholder="Last name"  />
        </div>
      </div>

      {/* === My Details === */}
      <div style={sectionCard}>
        <div style={sectionHeader}>My Details</div>
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            <Field
              label="Pronouns"
              value={pronouns}
              onChange={setPronouns}
              type="select"
              options={['None', 'He/Him', 'She/Her', 'They/Them', 'Other']}
            />
            <Field label="Landline telephone number" value={landline} onChange={setLandline} placeholder="Landline" />
            <Field label="Mobile telephone number"   value={mobile}   onChange={setMobile}   placeholder="Mobile"   />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            <Field label="Skype name" value={skype} onChange={setSkype} placeholder="Skype" />
            <Field label="Website link (Facebook, Twitter, etc.)" value={website} onChange={setWebsite} placeholder="https://" />
            <Field label="Name of study/work place (e.g. employer name)" value={workplace} onChange={setWorkplace} placeholder="Workplace" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            <Field label="Address of study/work" value={address} onChange={setAddress} placeholder="Address" />
            <Field
              label="Time Zone"
              value={timezone}
              onChange={setTimezone}
              type="select"
              options={['None', 'GMT (UTC+0)', 'BST (UTC+1)', 'EST (UTC-5)', 'PST (UTC-8)', 'Europe/London', 'America/New_York', 'America/Los_Angeles']}
            />
            <Field label="Home address (including post code)" value={homeAddress} onChange={setHomeAddress} placeholder="Home address" />
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <button style={{ ...FF, fontSize: '13px', fontWeight: 500, color: '#fff', backgroundColor: '#1c1c1c', border: 'none', borderRadius: '8px', padding: '5px 12px', height: '28px', cursor: 'pointer' }}>
              Create link
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={font(13, 400, 'rgba(28,28,28,0.7)', { textDecoration: 'underline', cursor: 'pointer' })}>
                View supported file types
              </span>
            </div>
          </div>
          <div
            onDragOver={e => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={e => {
              e.preventDefault(); setDragging(false)
              const file = e.dataTransfer.files[0]
              if (file) setUploadedFile(file.name)
            }}
            style={{
              border: `1.5px dashed ${dragging ? '#1c1c1c' : 'rgba(28,28,28,0.2)'}`,
              borderRadius: '12px',
              backgroundColor: dragging ? 'rgba(28,28,28,0.03)' : 'rgba(28,28,28,0.02)',
              padding: '28px 20px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
              marginBottom: '16px', transition: 'all 0.15s',
            }}
          >
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <path d="M20 26V14m0 0l-5 5m5-5l5 5" stroke="rgba(28,28,28,0.4)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M10 30a8 8 0 0 1 0-16 8.5 8.5 0 0 1 16.97-1.04A6 6 0 0 1 30 24" stroke="rgba(28,28,28,0.3)" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
            <span style={font(14, 500, '#1c1c1c')}>Select a file or drag and drop here</span>
            <span style={font(12, 400, 'rgba(28,28,28,0.5)')}>JPG, PNG or PDF, file size no more than 10MB</span>
            <input type="file" ref={fileRef} style={{ display: 'none' }} onChange={e => { if (e.target.files?.[0]) setUploadedFile(e.target.files[0].name) }} />
            <button
              onClick={() => fileRef.current?.click()}
              style={{ ...FF, fontSize: '13px', fontWeight: 500, color: '#1c1c1c', backgroundColor: 'transparent', border: '1px solid rgba(28,28,28,0.25)', borderRadius: '8px', padding: '5px 16px', height: '30px', cursor: 'pointer', marginTop: '4px' }}
            >
              SELECT FILE
            </button>
          </div>
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
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            ...FF, fontSize: '14px', fontWeight: 500, color: '#fff',
            backgroundColor: saving ? '#888' : '#1c1c1c',
            border: 'none', borderRadius: '8px',
            padding: '6px 20px', height: '34px',
            cursor: saving ? 'default' : 'pointer',
          }}
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
        <button
          onClick={() => window.location.reload()}
          style={{
            ...FF, fontSize: '14px', fontWeight: 400, color: '#1c1c1c',
            backgroundColor: 'transparent',
            border: '1px solid rgba(28,28,28,0.2)',
            borderRadius: '8px', padding: '6px 20px', height: '34px', cursor: 'pointer',
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
