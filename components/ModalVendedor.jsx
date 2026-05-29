'use client'
import { useMemo } from 'react'
import { X, ShoppingBag, Target, Layers } from 'lucide-react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LabelList } from 'recharts'

function fmtCurrency(v) {
  return `R$ ${Math.round(v).toLocaleString('pt-BR')}`
}

export default function ModalVendedor({ isOpen, onClose, sellerName, data, filters, darkMode }) {
  if (!isOpen || !sellerName) return null

  const t = {
    overlay: 'rgba(0,0,0,0.7)',
    bg: darkMode ? '#1e1e2d' : '#f0f0f5',
    card: darkMode ? '#151521' : '#e2e8f0',
    text: darkMode ? '#ffffff' : '#000000',
    textMuted: darkMode ? '#ffffff' : '#000000',
    border: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
    thBg: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.04)'
  }

  const targetYear = Number(filters.ano || 2026)
  const targetMonth = filters.mes === 'all' ? 'all' : Number(filters.mes)

  // 1. Filtrar transações do vendedor
  const sellerTxs = useMemo(() => {
    return (data?.transactions || []).filter(t => {
      if (t.vendedor !== sellerName) return false
      if (t.ano !== targetYear) return false
      if (targetMonth !== 'all' && t.mes !== targetMonth) return false
      return true
    })
  }, [data, sellerName, targetYear, targetMonth])

  // 2. Estatísticas do Vendedor
  const stats = useMemo(() => {
    const totalSales = sellerTxs.reduce((sum, tx) => sum + tx.valor, 0)
    const countSales = sellerTxs.length
    const ticketMedio = countSales > 0 ? totalSales / countSales : 0

    // Faturamento Total no período para cálculo de representatividade
    const totalPeriodo = (data?.transactions || [])
      .filter(tx => tx.ano === targetYear && (targetMonth === 'all' ? true : tx.mes === targetMonth))
      .reduce((sum, tx) => sum + tx.valor, 0)
      
    const representatividade = totalPeriodo > 0 ? (totalSales / totalPeriodo) * 100 : 0

    return {
      totalSales,
      countSales,
      ticketMedio,
      representatividade
    }
  }, [sellerTxs, data, targetYear, targetMonth])

  // 3. Top Clientes do Vendedor
  const topClients = useMemo(() => {
    const clientsMap = {}
    sellerTxs.forEach(tx => {
      const cName = tx.cliente || 'Desconhecido'
      if (!clientsMap[cName]) {
        clientsMap[cName] = { name: cName, valor: 0.0, count: 0 }
      }
      clientsMap[cName].valor += tx.valor
      clientsMap[cName].count += 1
    })
    return Object.values(clientsMap)
      .sort((a, b) => b.valor - a.valor)
      .slice(0, 5)
  }, [sellerTxs])

  // 4. Histórico Mensal do Vendedor para o gráfico
  const monthlyChartData = useMemo(() => {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
    return Array.from({ length: 5 }, (_, i) => { // Janeiro a Maio
      const mNum = i + 1
      const totalMonth = (data?.transactions || [])
        .filter(t => t.vendedor === sellerName && t.ano === targetYear && t.mes === mNum)
        .reduce((sum, tx) => sum + tx.valor, 0)

      return {
        name: months[i],
        'Faturamento': Math.round(totalMonth)
      }
    })
  }, [data, sellerName, targetYear])

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
          background: darkMode ? '#1a1a2d' : '#fff',
          border: `1px solid ${t.border}`,
          borderRadius: 12,
          padding: '16px',
          boxShadow: darkMode ? '0 4px 20px rgba(0,0,0,0.15)' : '0 4px 20px rgba(0,0,0,0.05)',
          minWidth: 160
        }}>
          <p style={{ fontSize: 13, fontWeight: 500, color: t.text, marginBottom: 12, borderBottom: `1px solid ${t.border}`, paddingBottom: 8 }}>
            {fullMonthNames[label] || label}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {payload.map((entry, index) => (
              <div key={index} style={{ display: 'flex', flexDirection: 'column' }}>
                 <span style={{ fontSize: 11, fontWeight: 400, color: t.textMuted, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 4 }}>
                   Vendas
                 </span>
                 <span style={{ fontSize: 22, fontWeight: 400, color: entry.color || '#ec6e2a', lineHeight: 1.1, letterSpacing: '-0.5px' }} className="numeric">
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
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(0,0,0,0.6)',
      backdropFilter: 'blur(8px)',
      padding: '24px'
    }} onClick={onClose}>
      
      <div style={{
        width: '100%',
        maxWidth: 1000,
        background: t.bg,
        border: `1px solid ${t.border}`,
        borderRadius: 16,
        boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        animation: 'modalShow 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
      }} onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div style={{
          padding: '16px 24px',
          borderBottom: `1px solid ${t.border}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h2 style={{ fontSize: 18, color: t.text, margin: 0 }}>Desempenho Comercial: {sellerName}</h2>
            <p style={{ fontSize: 12, color: t.textMuted, margin: '2px 0 0 0' }}>Período: {targetMonth === 'all' ? `Ano ${targetYear}` : `Mês ${targetMonth}/${targetYear}`}</p>
          </div>
          <button 
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: t.textMuted,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 32,
              height: 32,
              borderRadius: '50%',
              backgroundColor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Scrollable */}
        <div style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 24 }} className="custom-scroll">
          
          {/* Top Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 10, padding: 12, textAlign: 'center' }}>
              <span style={{ fontSize: 10, color: t.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 }}>Vendas Realizadas no mês</span>
              <p style={{ fontSize: 20, color: '#ec6e2a', margin: '4px 0 0 0' }} className="numeric">{fmtCurrency(stats.totalSales)}</p>
            </div>
            <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 10, padding: 12, textAlign: 'center' }}>
              <span style={{ fontSize: 10, color: t.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 }}>Qtd. Pedidos no mês</span>
              <p style={{ fontSize: 20, color: t.text, margin: '4px 0 0 0' }} className="numeric">{stats.countSales} pedidos</p>
            </div>
            <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 10, padding: 12, textAlign: 'center' }}>
              <span style={{ fontSize: 10, color: t.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 }}>Ticket Médio no mês</span>
              <p style={{ fontSize: 20, color: t.text, margin: '4px 0 0 0' }} className="numeric">{fmtCurrency(stats.ticketMedio)}</p>
            </div>
            <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 10, padding: 12, textAlign: 'center' }}>
              <span style={{ fontSize: 10, color: t.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 }}>Participação no mês</span>
              <p style={{ fontSize: 20, color: '#f57e42', margin: '4px 0 0 0' }} className="numeric">{stats.representatividade.toFixed(1)}%</p>
            </div>
          </div>

          {/* Mid Grid: Chart & Top Clients */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24 }}>
            {/* Chart */}
            <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 10, padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <span style={{ fontSize: 12, color: t.text, textTransform: 'uppercase', textAlign: 'center', display: 'block' }}>Faturamento Mensal</span>
              <div style={{ height: 180 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyChartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'} />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} style={{ fontSize: 11, fill: t.textMuted }} />
                    <YAxis hide={true} />
                    <Tooltip 
                      content={<CustomTooltip />}
                      cursor={{ fill: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}
                    />
                    <Bar dataKey="Faturamento" fill="#ec6e2a" radius={[4, 4, 0, 0]} maxBarSize={30}>
                      <LabelList dataKey="Faturamento" position="top" style={{ fill: t.textMuted, fontSize: 10 }} formatter={v => Math.round(v).toLocaleString('pt-BR')} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top Clients */}
            <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 10, padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <span style={{ fontSize: 12, color: t.text, textTransform: 'uppercase', textAlign: 'center', display: 'block' }}>Maiores Clientes</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {topClients.length === 0 ? (
                  <span style={{ fontSize: 12, color: t.textMuted }}>Nenhum cliente registrado</span>
                ) : (
                  topClients.map((c, idx) => (
                    <div key={c.name} style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', borderBottom: idx === topClients.length - 1 ? 'none' : `1px solid ${t.border}`, paddingBottom: 6 }}>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <p style={{ margin: 0, fontSize: 12, color: t.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {c.name}
                        </p>
                      </div>
                      <span style={{ fontSize: 12, color: '#ec6e2a', alignSelf: 'center' }} className="numeric">
                        {fmtCurrency(c.valor)}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Bottom Table: Sales List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <span style={{ fontSize: 12, color: t.text, textTransform: 'uppercase', textAlign: 'center', display: 'block' }}>Pedidos do Vendedor</span>
            <div style={{ overflowX: 'auto', border: `1px solid ${t.border}`, borderRadius: 8 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: t.thBg, borderBottom: `1px solid ${t.border}` }}>
                    <th style={{ padding: '8px 12px', color: t.text }}>Pedido</th>
                    <th style={{ padding: '8px 12px', color: t.text }}>Cliente</th>
                    <th style={{ padding: '8px 12px', color: t.text }}>Valor</th>
                    <th style={{ padding: '8px 12px', color: t.text }}>Data</th>
                    <th style={{ padding: '8px 12px', color: t.text }}>Observações</th>
                  </tr>
                </thead>
                <tbody>
                  {sellerTxs.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ padding: '20px', textAlign: 'center', color: t.textMuted }}>Nenhuma transação encontrada</td>
                    </tr>
                  ) : (
                    sellerTxs.map((row, idx) => (
                      <tr key={`${row.pedido}-${idx}`} style={{ borderBottom: idx === sellerTxs.length - 1 ? 'none' : `1px solid ${t.border}` }}>
                        <td style={{ padding: '8px 12px', color: '#ec6e2a' }} className="numeric">#{row.pedido}</td>
                        <td style={{ padding: '8px 12px', color: t.text, fontWeight: 400 }}>{row.cliente}</td>
                        <td style={{ padding: '8px 12px', color: t.text, }} className="numeric">{fmtCurrency(row.valor)}</td>
                        <td style={{ padding: '8px 12px', color: t.text }}>
                          {row.data.split('-')[2]}/{row.data.split('-')[1]}/{row.data.split('-')[0]}
                        </td>
                        <td style={{ padding: '8px 12px', color: t.textMuted, maxWidth: 150, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={row.obs}>
                          {row.obs || '—'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes modalShow {
          from { opacity: 0; transform: scale(0.97) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      ` }} />
    </div>
  )
}
