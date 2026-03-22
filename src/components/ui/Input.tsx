'use client'

import type { InputHTMLAttributes } from 'react'
import { forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, style, ...props }, ref) => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
        {label && (
          <label style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '13px', fontWeight: 600, color: '#475569',
            letterSpacing: '-0.065px',
          }}>
            {label}
          </label>
        )}
        <input
          ref={ref}
          style={{
            width: '100%', height: '44px',
            padding: '0 14px',
            border: `1px solid ${error ? '#f43f5e' : '#e4e7ec'}`,
            borderRadius: '10px',
            backgroundColor: '#fdfdfd',
            fontFamily: "'Inter', sans-serif",
            fontSize: '14px', color: '#1e293b',
            outline: 'none',
            transition: 'border-color 0.15s',
            ...style,
          }}
          onFocus={(e) => { e.target.style.borderColor = '#4f46e5' }}
          onBlur={(e) => { e.target.style.borderColor = error ? '#f43f5e' : '#e4e7ec' }}
          {...props}
        />
        {error && (
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '12px', color: '#f43f5e' }}>{error}</span>
        )}
        {hint && !error && (
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '12px', color: '#94a3b8' }}>{hint}</span>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
export default Input
