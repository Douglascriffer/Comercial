'use client'
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from 'recharts'

export default function GraficoMensalMeta({ historyMonths = [], darkMode = false }) {
  const colors = {
    grid: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    text: darkMode ? '#ffffff' : '#000000',
    tooltipBg: darkMode ? '#1a1a24' : '#ffffff',
    tooltipBorder: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
  }

  // Prepara dados do gráfico de faturamento mensal contra metas
  const data = historyMonths.map(m => ({
    name: m.name,
    'Faturamento': m['Faturamento'],
    'Meta': m['Meta']
  }))

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const fullMonthNames = {
        'Jan': 'Janeiro', 'Fev': 'Fevereiro', 'Mar': 'Março',
        'Abr': 'Abril', 'Mai': 'Maio', 'Jun': 'Junho',
        'Jul': 'Julho', 'Ago': 'Agosto', 'Set': 'Setembro',
        'Out': 'Outubro', 'Nov': 'Novembro', 'Dez': 'Dezembro'
      }
      return (
        <div style={{
          background: colors.tooltipBg,
          border: `1px solid ${colors.tooltipBorder}`,
          borderRadius: 12,
          padding: '16px',
          boxShadow: darkMode ? '0 4px 20px rgba(0,0,0,0.15)' : '0 4px 20px rgba(0,0,0,0.05)',
          minWidth: 160
        }}>
          <p style={{ fontSize: 13, fontWeight: 500, color: darkMode ? '#fff' : '#000', marginBottom: 12, borderBottom: `1px solid ${colors.tooltipBorder}`, paddingBottom: 8 }}>
            {fullMonthNames[label] || label}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {payload.map((entry, index) => (
              <div key={index} style={{ display: 'flex', flexDirection: 'column' }}>
                 <span style={{ fontSize: 11, fontWeight: 400, color: colors.text, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 4 }}>
                   {entry.name}
                 </span>
                 <span style={{ fontSize: 22, fontWeight: 400, color: entry.color, lineHeight: 1.1, letterSpacing: '-0.5px' }} className="numeric">
                   {Math.round(entry.value).toLocaleString('pt-BR')}
                 </span>
              </div>
            ))}
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <h4 style={{ fontSize: 13, color: darkMode ? '#ccc' : '#000', textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0 }}>
          Histórico Mensal vs Metas (2026)
        </h4>
      </div>

      <div style={{ flex: 1, minHeight: 220 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} vertical={false} />
            <XAxis 
              dataKey="name" 
              stroke={colors.text} 
              fontSize={11}
              tickLine={false}
              axisLine={false}
              dy={10}
            />
            <YAxis 
              stroke={colors.text} 
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
              dx={-10}
              hide={true}
            />
            <Tooltip 
              content={<CustomTooltip />} 
              cursor={{ fill: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}
            />
            <Legend verticalAlign="top" height={36} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="Faturamento" fill="#ec6e2a" radius={[4, 4, 0, 0]} maxBarSize={28} />
            <Bar dataKey="Meta" fill="#71717a" radius={[4, 4, 0, 0]} maxBarSize={28} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
