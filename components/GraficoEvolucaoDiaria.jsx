'use client'
import { useMemo } from 'react'
import { ResponsiveContainer, AreaChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'

function fmtCurrency(v) {
  return `R$ ${Math.round(v).toLocaleString('pt-BR')}`
}

export default function GraficoEvolucaoDiaria({ dailySales = [], metaEmpresa = 0, metaNossa = 0, filters = {}, darkMode = false }) {
  const chartData = useMemo(() => {
    const year = Number(filters.ano || 2026)
    const month = filters.mes === 'all' ? new Date().getMonth() + 1 : Number(filters.mes)
    
    // Obter número de dias no mês
    const numDays = new Date(year, month, 0).getDate()
    
    // Criar array para todos os dias do mês
    const daysData = []
    let currentAcum = 0

    // Criar mapa para busca rápida
    const dailyMap = {}
    dailySales.forEach(d => {
      // Obter número do dia da data YYYY-MM-DD
      const dayNum = parseInt(d.date.split('-')[2])
      dailyMap[dayNum] = d.valor
    })

    // Calcular taxa de meta diária
    const dailyMetaEmpresa = metaEmpresa / numDays
    const dailyMetaNossa = metaNossa / numDays

    for (let day = 1; day <= numDays; day++) {
      const valorDia = dailyMap[day] || 0.0
      currentAcum += valorDia

      // Adicionar ponto de ritmo/meta acumulada
      const paceEmpresa = dailyMetaEmpresa * day
      const paceNossa = dailyMetaNossa * day

      daysData.push({
        dia: day,
        label: `${day}`,
        'Faturamento Acumulado': currentAcum > 0 || day <= new Date().getDate() ? Math.round(currentAcum) : null,
        'Ritmo Meta Empresa': Math.round(paceEmpresa),
        'Ritmo Meta Nossa': Math.round(paceNossa),
        'Venda do Dia': Math.round(valorDia)
      })
    }

    return daysData
  }, [dailySales, metaEmpresa, metaNossa, filters])

  const colors = {
    grid: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    text: darkMode ? '#888888' : '#666666',
    tooltipBg: darkMode ? '#1a1a24' : '#ffffff',
    tooltipBorder: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
  }

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h4 style={{ fontSize: 13, fontWeight: 800, color: darkMode ? '#ccc' : '#444', textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0 }}>
          Evolução Diária Acumulada vs Metas
        </h4>
      </div>

      <div style={{ flex: 1, minHeight: 220 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
            <defs>
              <linearGradient id="colorAcum" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FF6A22" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#FF6A22" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} vertical={false} />
            <XAxis 
              dataKey="label" 
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
              labelFormatter={(label) => `Dia ${label}`}
            />
            <Legend verticalAlign="top" height={36} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
            <Area 
              type="monotone" 
              dataKey="Faturamento Acumulado" 
              stroke="#FF6A22" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorAcum)" 
            />
            <Line 
              type="monotone" 
              dataKey="Ritmo Meta Empresa" 
              stroke="#8b5cf6" 
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              activeDot={false}
            />
            <Line 
              type="monotone" 
              dataKey="Ritmo Meta Nossa" 
              stroke="#10b981" 
              strokeWidth={2}
              strokeDasharray="3 3"
              dot={false}
              activeDot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
