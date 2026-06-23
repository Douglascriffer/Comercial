'use client'
import { useState, useEffect } from 'react'
import { 
  TrendingUp, Users, Target, Activity, 
  ShoppingCart, DollarSign, Award, Calendar,
  Sun, Moon, Wrench, Key, Play, Pause, MonitorPlay
} from 'lucide-react'
import { useFinancialData, useFilteredData } from '@/lib/hooks'

import KpiCard from '@/components/KpiCard'
import GraficoVendedores from '@/components/GraficoVendedores'
import GraficoMensalMeta from '@/components/GraficoMensalMeta'
import TabelaTransacoes from '@/components/TabelaTransacoes'
import AbaMetas from '@/components/AbaMetas'

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
  const [filters, setFilters] = useState({ ano: '2026', mes: String(new Date().getMonth() + 1) }) // Mês atual como padrão
  const [currentTab, setCurrentTab] = useState('VENDAS')
  const [theme, setTheme] = useState('dark')

  const [autoPlay, setAutoPlay] = useState(false)
  const [presentationStep, setPresentationStep] = useState(0)

  // Controle da Transmissão Automática
  useEffect(() => {
    let interval;
    if (autoPlay) {
      interval = setInterval(() => {
        setPresentationStep(prev => (prev + 1) % 3)
      }, 10000) // 10 segundos
    }
    return () => clearInterval(interval)
  }, [autoPlay])

  // Sincronizar abas com a Transmissão Automática
  useEffect(() => {
    if (autoPlay) {
      if (presentationStep === 0) setCurrentTab('VENDAS')
      if (presentationStep === 1) setCurrentTab('METAS')
      if (presentationStep === 2) setCurrentTab('VENDAS')
    }
  }, [presentationStep, autoPlay])

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
      paddingBottom: 40,
      display: 'flex',
      flexDirection: 'column'
    }}>
      <style>{`
        .hover-lift:hover { transform: translateY(-3px); }
        .custom-scroll::-webkit-scrollbar { display: none; }
        .custom-scroll { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* ================= HEADER BAR ================= */}
      <header style={{
        background: colors.header,
        position: 'sticky',
        top: 0,
        zIndex: 100,
        gap: 24,
        height: autoPlay ? 90 : 76,
        padding: autoPlay ? '20px 32px' : '16px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 4px 30px rgba(168,68,16,0.3)'
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

        {/* Tabs VENDAS / METAS e Botão Transmissão */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: 12 }}>
          <div style={{ display: 'flex', background: 'rgba(0,0,0,0.15)', padding: 4, borderRadius: 10, backdropFilter: 'blur(4px)', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)' }}>
            {['VENDAS', 'METAS'].map(t => (
              <button 
                key={t} 
                onClick={async () => {
                  if (autoPlay) {
                    setAutoPlay(false);
                    try {
                      if (document.fullscreenElement && document.exitFullscreen) {
                        await document.exitFullscreen();
                      }
                    } catch (e) {
                      console.error("Erro ao sair da tela cheia:", e);
                    }
                  }
                  setCurrentTab(t);
                }}
                style={{
                  padding: '8px 20px',
                  borderRadius: 8,
                  border: 'none',
                  background: currentTab === t ? '#ffffff' : 'transparent',
                  color: currentTab === t ? '#ec6e2a' : 'rgba(255,255,255,0.9)',
                  fontSize: 14,
                  fontWeight: currentTab === t ? 600 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  boxShadow: currentTab === t ? '0 2px 10px rgba(0,0,0,0.1)' : 'none'
                }}
              >
                {t === 'VENDAS' ? <Activity size={18} /> : <Target size={18} />}
                {t}
              </button>
            ))}
          </div>

          <button
            onClick={async () => {
              const nextState = !autoPlay;
              setAutoPlay(nextState);
              if (nextState) {
                // Forçar filtro do mês atual ao iniciar
                setFilters(prev => ({ ...prev, mes: String(new Date().getMonth() + 1) }));
                setPresentationStep(0);
                setCurrentTab('VENDAS');
                try {
                  if (document.documentElement.requestFullscreen) {
                    await document.documentElement.requestFullscreen();
                  }
                } catch (e) {
                  console.error("Erro ao entrar em tela cheia:", e);
                }
              } else {
                // Sair de tela cheia ao desligar a transmissão
                try {
                  if (document.fullscreenElement && document.exitFullscreen) {
                    await document.exitFullscreen();
                  }
                } catch (e) {
                  console.error("Erro ao sair da tela cheia:", e);
                }
              }
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 16px',
              borderRadius: 10,
              border: 'none',
              background: autoPlay ? '#10b981' : 'rgba(0,0,0,0.15)',
              color: '#ffffff',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              backdropFilter: 'blur(4px)',
              boxShadow: autoPlay ? '0 0 15px rgba(16,185,129,0.3)' : 'none'
            }}
          >
            <MonitorPlay size={18} />
            {autoPlay ? 'Transmissão Ativa' : 'Transmitir Tela'}
          </button>
        </div>

        {/* Aviso de Atualização */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 12px' }}>
          <span style={{ fontSize: autoPlay ? 18 : 16, color: 'rgba(255,255,255,0.95)', fontWeight: 500, letterSpacing: 0.5 }}>
            Atualizações a cada 2 horas
          </span>
          <span style={{ fontSize: autoPlay ? 18 : 16, color: 'rgba(255,255,255,0.95)', fontWeight: 600, letterSpacing: 0.5 }}>
            das 08h30 às 18h00.
          </span>
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
      <main style={{ maxWidth: '96%', width: '100%', margin: '24px auto 0 auto', display: 'flex', flexDirection: 'column', gap: 24, flex: 1 }}>
        
        {(!autoPlay && currentTab === 'VENDAS') || (autoPlay && presentationStep === 0) ? (
          <>
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
        <section style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 24, flex: autoPlay ? 1 : 'none' }}>
          {/* Left Box: Ranking of Sellers */}
          <div style={{ 
            background: colors.card,
            border: `1px solid ${colors.border}`,
            borderRadius: 12,
            padding: '20px',
            height: autoPlay ? 'calc(100vh - 250px)' : 785,
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
            height: autoPlay ? 'calc(100vh - 250px)' : 785,
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

            {/* Only render Table in combined view if NOT autoPlay */}
            {!autoPlay && (
              <section>
                <TabelaTransacoes 
                  transactions={filtered.transactions}
                  darkMode={isDark}
                />
              </section>
            )}
          </>
        ) : (!autoPlay && currentTab === 'METAS') || (autoPlay && presentationStep === 1) ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <AbaMetas 
              metas_pessoais={filtered?.metas_pessoais} 
              darkMode={isDark} 
              filters={filters}
            />
          </div>
        ) : (autoPlay && presentationStep === 2) ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: 'calc(100vh - 160px)', overflow: 'hidden' }}>
            <TabelaTransacoes 
              transactions={filtered.transactions}
              darkMode={isDark}
              pageSize={20}
            />
          </div>
        ) : null}

      </main>
    </div>
  )
}
