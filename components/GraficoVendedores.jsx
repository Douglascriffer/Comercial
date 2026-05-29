'use client'
import { useState, useMemo } from 'react'
import { Star, ShoppingCart, Globe, HelpCircle, AlertTriangle } from 'lucide-react'
import ModalVendedor from './ModalVendedor'

function fmt(v) {
  if (!v && v !== 0) return '—'
  return `R$ ${Math.round(v).toLocaleString('pt-BR')}`
}

const EQUIPE_VENDAS = [
  'Gabriel Klein',
  'Rogislei',
  'Gabriel Ferreira',
  'Gabriel Dias',
  'Josiane',
  'Vanessa'
]

// Avatar initials or mapping
const AVATAR_MAP = {
  'Gabriel Klein': 'GK',
  'Rogislei': 'R',
  'Gabriel Ferreira': 'GF',
  'Gabriel Dias': 'GD',
  'Josiane': 'J',
  'Vanessa': 'V'
}

const CHANNEL_ICONS = {
  'Mercado Livre': { icon: ShoppingCart, color: '#FFE600', label: 'ML' },
  'Site': { isImage: true, src: '/logo-base.png', color: '#71717a', label: 'Site' },
  'Retorno de golpe': { icon: AlertTriangle, color: '#ef4444', label: 'Golpe' },
  'Sem Vendedor': { isImage: true, src: '/logo-base.png', color: '#ffffff', label: 'N/A' }
}

function SellerList({ items, title, hovered, setHovered, darkMode, onSellerClick, totalValue }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10, height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
        <h4 style={{
          fontSize: 14,
          color: '#ec6e2a',
          letterSpacing: '1px',
          textTransform: 'uppercase',
          margin: 0
        }}>{title}</h4>
      </div>

      {items.length === 0 ? (
        <div style={{ color: darkMode ? '#666' : '#999', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>
          Nenhuma venda registrada
        </div>
      ) : (
        items.map((s, i) => {
          const isHovered = hovered === s.name
          const rank = i + 1
          const isTeam = EQUIPE_VENDAS.includes(s.name)
          const pctShare = totalValue > 0 ? (s.valor / totalValue) * 100 : 0

          return (
            <div
              key={s.name}
              onMouseEnter={() => setHovered(s.name)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => isTeam && onSellerClick(s.name)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '8px 12px',
                background: isHovered ? (darkMode ? 'rgba(255,106,34,0.06)' : 'rgba(255,106,34,0.02)') : (darkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)'),
                border: `1px solid ${isHovered ? 'rgba(255,106,34,0.2)' : '#000000'}`,
                borderRadius: 10,
                cursor: isTeam ? 'pointer' : 'default',
                transition: 'all 0.2s ease',
                position: 'relative'
              }}
              className="seller-row"
            >
              {/* Rank Star/Circle */}
              <div style={{
                width: 28,
                height: 28,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: rank <= 3 && isTeam ? 16 : 13,
                color: rank <= 3 && isTeam ? '#ec6e2a' : (darkMode ? '#888' : '#666')
              }}>
                {rank <= 3 && isTeam ? (
                  <Star size={18} fill="#ec6e2a" stroke="#ec6e2a" />
                ) : rank}
              </div>

              {/* Avatar / Circle */}
              <div style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                overflow: 'hidden',
                border: `2px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)'}`,
                background: isTeam ? '#ec6e2a' : '#000000',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isTeam ? '#fff' : (darkMode ? '#ccc' : '#333'),
                fontSize: 14,
              }}>
                {isTeam ? (
                  AVATAR_MAP[s.name] || s.name.charAt(0)
                ) : (
                  (() => {
                    const cfg = CHANNEL_ICONS[s.name]
                    if (cfg) {
                      if (cfg.isImage) {
                        return <img src={cfg.src} alt={cfg.label} style={{ width: 24, height: 24, objectFit: 'contain' }} />
                      }
                      const Icon = cfg.icon
                      return <Icon size={20} color={cfg.color} />
                    }
                    return s.name.charAt(0)
                  })()
                )}
              </div>

              {/* Nome e Share Bar */}
              <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <p style={{
                    margin: 0,
                    fontSize: 14,
                    color: darkMode ? '#fff' : '#000000',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {s.name}
                  </p>
                  <span style={{ fontSize: 14, color: '#ec6e2a' }} className="numeric">
                    {fmt(s.valor)}
                  </span>
                </div>

                {/* Share Progress Bar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ flex: 1, height: 4, background: darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{
                      width: `${pctShare}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, #ec6e2a 0%, #f57e42 100%)',
                      borderRadius: 2,
                      transition: 'width 0.5s ease-out'
                    }} />
                  </div>
                  <span style={{ fontSize: 10, color: darkMode ? '#ffffff' : '#888', width: 32, textAlign: 'right' }} className="numeric">
                    {pctShare.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}

export default function GraficoVendedores({ salesTeam = [], otherChannels = [], data, darkMode = false, filters = { ano: '2026', mes: '5' } }) {
  const [hovered, setHovered] = useState(null)
  const [selectedSeller, setSelectedSeller] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)

  const t = {
    card: darkMode ? '#1e1e2d' : '#ffffff',
    border: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
    text: darkMode ? '#ffffff' : '#000000',
    accent: '#ec6e2a'
  }

  const handleSellerClick = (name) => {
    setSelectedSeller(name)
    setModalOpen(true)
  }

  const totalTeam = useMemo(() => salesTeam.reduce((sum, s) => sum + s.valor, 0), [salesTeam])
  const totalOthers = useMemo(() => otherChannels.reduce((sum, s) => sum + s.valor, 0), [otherChannels])
  const grandTotal = totalTeam + totalOthers

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', gap: 32, flex: 1 }}>
        {/* Equipe de Vendas */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `2px solid ${t.accent}`, paddingBottom: 8 }}>
            <h3 style={{ fontSize: 15, color: t.text, margin: 0, letterSpacing: '0.5px' }}>EQUIPE DE VENDAS</h3>
            <span style={{ fontSize: 15, color: t.accent }} className="numeric">{fmt(totalTeam)}</span>
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }} className="custom-scroll">
            <SellerList
              items={salesTeam}
              title=""
              hovered={hovered}
              setHovered={setHovered}
              darkMode={darkMode}
              onSellerClick={handleSellerClick}
              totalValue={grandTotal}
            />
          </div>
        </div>

        {/* Outros Canais */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `2px solid ${t.border}`, paddingBottom: 8 }}>
            <h3 style={{ fontSize: 15, color: t.text, margin: 0, letterSpacing: '0.5px' }}>OUTROS CANAIS</h3>
            <span style={{ fontSize: 15, color: t.text }} className="numeric">{fmt(totalOthers)}</span>
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }} className="custom-scroll">
            <SellerList
              items={otherChannels}
              title=""
              hovered={hovered}
              setHovered={setHovered}
              darkMode={darkMode}
              onSellerClick={() => { }}
              totalValue={grandTotal}
            />
          </div>
        </div>
      </div>

      <ModalVendedor
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        sellerName={selectedSeller}
        data={data}
        filters={filters}
        darkMode={darkMode}
      />
    </div>
  )
}
