import React from 'react'

const KpiCard = ({ label, value, subLabel, icon: Icon, color, isPercent = false, isCurrency = true, darkMode = true }) => {
  const theme = {
    card: '#1e1e2d',
    border: 'rgba(255,255,255,0.08)',
    text: '#ffffff',
    textMuted: '#ffffff',
  }

  const fmt = (v) => {
    if (!v && v !== 0) return '—'
    if (isPercent) return `${v.toFixed(1)}%`
    return Math.round(v).toLocaleString('pt-BR')
  }

  return (
    <div style={{
      background: theme.card,
      border: `1px solid ${theme.border}`,
      borderRadius: 12,
      padding: '16px',
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      boxShadow: darkMode ? '0 4px 20px rgba(0,0,0,0.15)' : '0 4px 20px rgba(0,0,0,0.02)',
      transition: 'all 0.3s ease',
      position: 'relative',
      overflow: 'hidden'
    }} className="hover-lift">
      {/* Background glow animation effect */}
      <div style={{
        position: 'absolute',
        top: '-50%',
        right: '-50%',
        width: 120,
        height: 120,
        borderRadius: '50%',
        background: color,
        opacity: darkMode ? 0.05 : 0.03,
        filter: 'blur(30px)',
        pointerEvents: 'none'
      }} />

      {/* Icon Circle */}
      <div style={{
        width: 48,
        height: 48,
        borderRadius: '10px',
        background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      }}>
        <Icon size={22} color={color || '#ec6e2a'} />
      </div>

      {/* Text Info */}
      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 }}>
        <span style={{
          fontSize: 14,
          fontWeight: 500,
          color: theme.textMuted,
          textTransform: 'uppercase',
          letterSpacing: '1px',
          marginBottom: 4,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}>{label}</span>
        
        <span style={{
          fontSize: 26,
          fontWeight: 500,
          color: theme.text,
          lineHeight: 1.1,
          letterSpacing: '-0.5px'
        }} className="numeric">{fmt(value)}</span>
      </div>
    </div>
  )
}

export default KpiCard
