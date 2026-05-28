'use client'
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from 'recharts'

function fmtCurrency(v) {
  return `R$ ${Math.round(v).toLocaleString('pt-BR')}`
}

export default function GraficoMensalMeta({ historyMonths = [], darkMode = false }) {
  const colors = {
    grid: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    text: darkMode ? '#888888' : '#666666',
    tooltipBg: darkMode ? '#1a1a24' : '#ffffff',
    tooltipBorder: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
  }

  // Prepara dados do gráfico de faturamento mensal contra metas
  const data = historyMonths.map(m => ({
    name: m.name,
    'Faturamento': m['Faturamento'],
    'Meta': m['Meta']
  }))

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h4 style={{ fontSize: 13, fontWeight: 800, color: darkMode ? '#ccc' : '#444', textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0 }}>
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
            />
            <Tooltip 
              contentStyle={{
                background: colors.tooltipBg,
                borderColor: colors.tooltipBorder,
                borderRadius: 8,
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                color: darkMode ? '#fff' : '#000',
                fontSize: 12
              }}
              formatter={(value, name) => [fmtCurrency(value), name]}
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
