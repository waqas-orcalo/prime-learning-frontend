'use client'

interface DonutChartProps {
  progress?: number
  size?: number
}

export default function DonutChart({ progress = 70, size = 120 }: DonutChartProps) {
  const radius = size / 2 - 10
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (progress / 100) * circumference

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#e8eaed" strokeWidth="8" />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="#6366f1" strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transform: `rotate(-90deg)`, transformOrigin: `${size / 2}px ${size / 2}px` }}
        />
        <text x={size / 2} y={size / 2} textAnchor="middle" dy="0.3em" fontSize="18" fontWeight="bold" fill="#1a1d2e">
          {progress}%
        </text>
      </svg>
    </div>
  )
}
