'use client'
import { useState, useEffect } from 'react'
import { 
  TrendingUp, Users, Target, Activity, 
  ShoppingCart, DollarSign, Award, Calendar,
  Sun, Moon, Wrench, Key
} from 'lucide-react'
import { useFinancialData, useFilteredData } from '@/lib/hooks'

import KpiCard from '@/components/KpiCard'
import GraficoVendedores from '@/components/GraficoVendedores'
import GraficoMensalMeta from '@/components/GraficoMensalMeta'
import TabelaTransacoes from '@/components/TabelaTransacoes'

const MESES = [
  { id: '1', name: 'Janeiro' },
  { id: '2', name: 'Fevereiro' },
  { id: '3', name: 'Março' },
  { id: '4', name: 'Abril' },
  { id: '5', name: 'Maio' },
  { id: '6', name: 'Junho' },
  { id: '7', name: 'Julho' },
  { id: '8', name: 'Agosto' },
  { id: '9', name: 'Setembro' },
  { id: '10', name: 'Outubro' },
  { id: '11', name: 'Novembro' },
  { id: '12', name: 'Dezembro' }
]

export default function DashboardPage() {
  const [filters, setFilters] = useState({ ano: '2026', mes: '5' }) // Maio/2026 como padrão
  const [theme, setTheme] = useState('dark')

  const { data, loading, error } = useFinancialData()
  const filtered = useFilteredData(data, filters)

  // Sincronizar tema
  useEffect(() => {
    const savedTheme = localStorage.getItem('comercial_theme')
    if (savedTheme) {
      setTheme(savedTheme)
    }
  }, [])

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(nextTheme)
    localStorage.setItem('comercial_theme', nextTheme)
  }

  const isDark = theme === 'dark'
  
  const colors = {
    bg: isDark ? '#0c0c14' : '#ffffff',
    header: 'linear-gradient(135deg, #52525b 0%, #71717a 35%, #ec6e2a 75%, #f28246 100%)',
    card: isDark ? '#1e1e2d' : '#e2e8f0',
    border: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
    text: isDark ? '#ffffff' : '#000000',
    textMuted: isDark ? '#ffffff' : '#000000',
  }

  if (loading) {
    return (
      <div style={{ height: '100vh', background: isDark ? '#0c0c14' : '#ffffff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: "'Syne', 'Gotham', sans-serif", color: isDark ? '#fff' : '#000' }}>
        <div style={{ width: 48, height: 48, borderRadius: '50%', border: '4px solid #ec6e2a', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }} />
        <span style={{ marginTop: 16, fontSize: 14, letterSpacing: 1 }}>CARREGANDO DASHBOARD...</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ height: '100vh', background: isDark ? '#0c0c14' : '#ffffff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: "'Syne', 'Gotham', sans-serif", color: '#ef4444', padding: 24, textAlign: 'center' }}>
        <p style={{ fontSize: 18, }}>Erro ao carregar dados do comercial:</p>
        <p style={{ fontSize: 14, color: isDark ? '#aaa' : '#666', marginTop: 8 }}>{error}</p>
        <p style={{ fontSize: 13, color: '#ec6e2a', marginTop: 16 }}>Verifique se o arquivo Excel foi processado e gerou dados.json corretos.</p>
      </div>
    )
  }

  const kpis = filtered?.kpis || {}

  const getPeriodLabel = () => {
    if (filters.mes === 'all') return 'Acumulado Ano 2026'
    const name = MESES.find(m => m.id === filters.mes)?.name
    return `${name} de 2026`
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: colors.bg, 
      color: colors.text,
      fontFamily: "'Syne', 'Gotham', sans-serif",
      transition: 'background 0.3s ease, color 0.3s ease',
      paddingBottom: 40
    }}>
      <style>{`
        .hover-lift:hover { transform: translateY(-3px); }
        .custom-scroll::-webkit-scrollbar { display: none; }
        .custom-scroll { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* ================= HEADER BAR ================= */}
      <header style={{
        background: colors.header,
        padding: '16px 4%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 4px 30px rgba(168,68,16,0.3)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        gap: 24
      }}>
        {/* Brand Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ background: '#fff', borderRadius: '50%', width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
            <img src="/logo-base.png" alt="Criffer" style={{ width: 28, height: 28, objectFit: 'contain' }}/>
          </div>
          <div>
            <div style={{ fontSize: 20, color: '#fff', letterSpacing: '1.5px', lineHeight: 1 }}>CRIFFER</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.9)', letterSpacing: '1px', textTransform: 'uppercase', marginTop: 2 }}>Dashboard Comercial</div>
          </div>
        </div>

        {/* Seletores e Filtros */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', background: 'rgba(0,0,0,0.15)', padding: 3, borderRadius: 8, backdropFilter: 'blur(4px)' }}>
            {['2026'].map(y => (
              <button 
                key={y} 
                onClick={() => setFilters(prev => ({ ...prev, ano: y }))}
                style={{
                  padding: '4px 12px',
                  borderRadius: 6,
                  border: 'none',
                  background: filters.ano === y ? '#ffffff' : 'transparent',
                  color: filters.ano === y ? '#ec6e2a' : 'rgba(255,255,255,0.85)',
                  fontSize: 12,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {y}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', background: 'rgba(0,0,0,0.15)', padding: 3, borderRadius: 8, backdropFilter: 'blur(4px)' }}>
            <button
              onClick={() => setFilters(prev => ({ ...prev, mes: 'all' }))}
              style={{
                padding: '4px 12px',
                borderRadius: 6,
                border: 'none',
                background: filters.mes === 'all' ? '#ffffff' : 'transparent',
                color: filters.mes === 'all' ? '#ec6e2a' : 'rgba(255,255,255,0.85)',
                fontSize: 12,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Todos
            </button>
            {MESES.map(m => (
              <button 
                key={m.id} 
                onClick={() => setFilters(prev => ({ ...prev, mes: m.id }))}
                style={{
                  padding: '4px 10px',
                  borderRadius: 6,
                  border: 'none',
                  background: filters.mes === m.id ? '#ffffff' : 'transparent',
                  color: filters.mes === m.id ? '#ec6e2a' : 'rgba(255,255,255,0.85)',
                  fontSize: 12,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {m.name.slice(0, 3)}
              </button>
            ))}
          </div>

          {/* Theme Button */}
          <button 
            onClick={toggleTheme}
            style={{
              background: 'rgba(0,0,0,0.15)',
              border: 'none',
              borderRadius: 8,
              width: 34,
              height: 34,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              cursor: 'pointer',
              backdropFilter: 'blur(4px)'
            }}
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </header>

      {/* ================= CONTENT MAIN ================= */}
      <main style={{ maxWidth: '96%', margin: '24px auto 0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
        
        {/* ================= KPI GRID (7 Cards) ================= */}
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 10 }}>
          <KpiCard 
            label="Vendas" 
            value={kpis.vendasRealizado} 
            subLabel="Faturamento Comercial" 
            icon={ShoppingCart} 
            color="#ec6e2a" 
            darkMode={isDark} 
          />
          <KpiCard 
            label="Serviços" 
            value={kpis.servicosRealizado} 
            subLabel="Serviços e Calibrações" 
            icon={Wrench} 
            color="#71717a" 
            darkMode={isDark} 
          />
          <KpiCard 
            label="Locação" 
            value={kpis.locacaoRealizado} 
            subLabel="Locações de Equipamentos" 
            icon={Key} 
            color="#8b5cf6" 
            darkMode={isDark} 
          />
          <KpiCard 
            label="Receita" 
            value={kpis.totalRealizado} 
            subLabel={getPeriodLabel()} 
            icon={DollarSign} 
            color="#10b981" 
            darkMode={isDark} 
          />
          <KpiCard 
            label="Meta" 
            value={kpis.totalMeta} 
            subLabel="Meta Anual Consolidada" 
            icon={Target} 
            color="#f57e42" 
            darkMode={isDark} 
          />
          <KpiCard 
            label="Desempenho" 
            value={kpis.pctAtingido} 
            subLabel={`${kpis.pctAtingido.toFixed(1)}% do Objetivo`} 
            icon={TrendingUp} 
            color="#10b981" 
            isPercent={true}
            isCurrency={false}
            darkMode={isDark} 
          />
          <KpiCard 
            label="Fat. Diario" 
            value={kpis.vendasDiaValor} 
            subLabel="Último dia registrado" 
            icon={Calendar} 
            color="#eab308" 
            darkMode={isDark} 
          />
        </section>

        {/* ================= MAIN DASHBOARD ROW (Side by Side) ================= */}
        <section style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 24 }}>
          {/* Left Box: Ranking of Sellers */}
          <div style={{ 
            background: colors.card,
            border: `1px solid ${colors.border}`,
            borderRadius: 12,
            padding: '20px',
            height: 585,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.15)' : '0 4px 20px rgba(0,0,0,0.02)'
          }}>
            <GraficoVendedores 
              salesTeam={filtered.salesTeam}
              otherChannels={filtered.otherChannels}
              data={data}
              filters={filters}
              darkMode={isDark}
            />
          </div>

          {/* Right Box: Monthly History Chart */}
          <div style={{ 
            background: colors.card,
            border: `1px solid ${colors.border}`,
            borderRadius: 12,
            padding: '20px',
            height: 585,
            display: 'flex',
            flexDirection: 'column',
            boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.15)' : '0 4px 20px rgba(0,0,0,0.02)'
          }}>
            <GraficoMensalMeta 
              historyMonths={filtered.historyMonths}
              darkMode={isDark}
            />
          </div>
        </section>

        {/* ================= DETAILED TRANSACTIONS TABLE ================= */}
        <section>
          <TabelaTransacoes 
            transactions={filtered.transactions}
            darkMode={isDark}
          />
        </section>

      </main>
    </div>
  )
}
