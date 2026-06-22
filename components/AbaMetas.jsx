'use client'

import React from 'react'
import { Target, TrendingUp, ShoppingCart, Key, Wrench, Calendar, DollarSign } from 'lucide-react'

// Função auxiliar para formatar moeda
const formatCurrency = (val) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0)
}

// Função para formatar sem decimais (até a vírgula) e sem R$
const formatNumberNoDecimal = (val) => {
  return new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(val || 0)
}

function getDiasUteisFaltantes(ano, mesId) {
  if (!mesId || mesId === 'all') return 0;
  
  const hoje = new Date();
  const targetAno = parseInt(ano);
  const targetMes = parseInt(mesId) - 1; 
  
  const atualAno = hoje.getFullYear();
  const atualMes = hoje.getMonth();
  
  if (targetAno < atualAno || (targetAno === atualAno && targetMes < atualMes)) {
    return 0; 
  }
  
  let dataInicial;
  if (targetAno === atualAno && targetMes === atualMes) {
    dataInicial = new Date(hoje);
  } else {
    dataInicial = new Date(targetAno, targetMes, 1);
  }
  
  const dataFinal = new Date(targetAno, targetMes + 1, 0); 
  
  let diasUteis = 0;
  let curDate = new Date(dataInicial);
  curDate.setHours(0,0,0,0);
  dataFinal.setHours(0,0,0,0);
  
  while (curDate <= dataFinal) {
    const diaSemana = curDate.getDay();
    if (diaSemana !== 0 && diaSemana !== 6) { 
      diasUteis++;
    }
    curDate.setDate(curDate.getDate() + 1);
  }
  
  return diasUteis;
}

// Componente para um card de Meta (ex: Vendas, Locação, Serviços)
function MetaCard({ title, icon: Icon, data, color, darkMode, diasUteis }) {
  if (!data) return null;

  const bg = darkMode ? '#1e1e2d' : '#e2e8f0'
  const border = darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'
  const textMain = darkMode ? '#ffffff' : '#000000'
  const textMuted = darkMode ? '#a1a1aa' : '#52525b'
  const bgCardSecondary = darkMode ? '#181825' : '#ffffff'

  const { meta_empresa, meta_comercial, meta_realizada, restante_empresa, restante_comercial } = data

  const pctEmpresa = meta_empresa > 0 ? (meta_realizada / meta_empresa) * 100 : 0
  const pctComercial = meta_comercial > 0 ? (meta_realizada / meta_comercial) * 100 : 0

  const necDiaEmpresa = diasUteis > 0 ? Math.max(0, restante_empresa) / diasUteis : 0
  const necDiaComercial = diasUteis > 0 ? Math.max(0, restante_comercial) / diasUteis : 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{
        background: bg,
        borderRadius: 16,
        border: `1px solid ${border}`,
        padding: 24,
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
        boxShadow: darkMode ? '0 4px 20px rgba(0,0,0,0.15)' : '0 4px 20px rgba(0,0,0,0.02)'
      }}>
        {/* Header do Card */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12,
            background: `${color}15`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: color
          }}>
            <Icon size={24} />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: textMain }}>{title}</h2>
            <span style={{ fontSize: 13, color: textMuted }}>Acompanhamento de Metas</span>
          </div>
        </div>

        <div style={{ height: 1, background: border, width: '100%' }}></div>

        {/* Grid de Valores Principais */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div style={{ background: bgCardSecondary, padding: 16, borderRadius: 12, border: `1px solid ${border}` }}>
            <div style={{ fontSize: 12, color: textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Meta Empresa</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: textMain }}>{formatCurrency(meta_empresa)}</div>
            
            <div style={{ marginTop: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                <span style={{ color: textMuted }}>Atingido</span>
                <span style={{ color: color, fontWeight: 600 }}>{pctEmpresa.toFixed(1)}%</span>
              </div>
              <div style={{ height: 6, background: `${color}20`, borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ height: '100%', background: color, width: `${Math.min(pctEmpresa, 100)}%`, borderRadius: 4 }} />
              </div>
            </div>
          </div>

          <div style={{ background: bgCardSecondary, padding: 16, borderRadius: 12, border: `1px solid ${border}` }}>
            <div style={{ fontSize: 12, color: textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Meta Comercial</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: textMain }}>{formatCurrency(meta_comercial)}</div>
            
            <div style={{ marginTop: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                <span style={{ color: textMuted }}>Atingido</span>
                <span style={{ color: color, fontWeight: 600 }}>{pctComercial.toFixed(1)}%</span>
              </div>
              <div style={{ height: 6, background: `${color}20`, borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ height: '100%', background: color, width: `${Math.min(pctComercial, 100)}%`, borderRadius: 4 }} />
              </div>
            </div>
          </div>
        </div>

        {/* Meta Realizada Destaque */}
        <div style={{ background: `${color}10`, padding: 20, borderRadius: 12, border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 13, color: textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Realizado Total</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: textMain }}>{formatCurrency(meta_realizada)}</div>
          </div>
          <TrendingUp size={36} color={color} style={{ opacity: 0.8 }} />
        </div>

        {/* Grid de Valores Restantes */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <div style={{ fontSize: 12, color: textMuted, marginBottom: 4 }}>Restante Empresa</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: textMain }}>{formatCurrency(restante_empresa)}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: textMuted, marginBottom: 4 }}>Restante Comercial</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: textMain }}>{formatCurrency(restante_comercial)}</div>
          </div>
        </div>
      </div>

      {/* Novo Card: Dias Úteis e Faturamento por Dia */}
      {diasUteis > 0 && (
        <div style={{
          background: bg,
          borderRadius: 16,
          border: `1px solid ${border}`,
          padding: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          boxShadow: darkMode ? '0 4px 20px rgba(0,0,0,0.15)' : '0 4px 20px rgba(0,0,0,0.02)'
        }}>
          {/* Título Principal do Card */}
          <div style={{ fontSize: 14, fontWeight: 600, color: textMain, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            FATURAMENTO A REALIZAR PARA META
          </div>

          <div style={{ height: 1, background: border, width: '100%' }}></div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Calendar size={16} color={color} />
              <span style={{ fontSize: 14, color: textMain }}>Dias Úteis Restantes</span>
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, color: textMain }}>{diasUteis} dias</div>
          </div>
          
          <div style={{ height: 1, background: border, width: '100%' }}></div>
          
          <div>
            <div style={{ fontSize: 14, color: textMain, marginBottom: 12 }}>
              Faturamento por dia
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ background: bgCardSecondary, padding: 12, borderRadius: 8, border: `1px solid ${border}` }}>
                <div style={{ fontSize: 14, color: textMuted, marginBottom: 4 }}>Empresa</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: textMain }}>
                  {formatNumberNoDecimal(necDiaEmpresa)}
                </div>
              </div>
              <div style={{ background: bgCardSecondary, padding: 12, borderRadius: 8, border: `1px solid ${border}` }}>
                <div style={{ fontSize: 14, color: textMuted, marginBottom: 4 }}>Comercial</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: textMain }}>
                  {formatNumberNoDecimal(necDiaComercial)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function AbaMetas({ metas_pessoais, darkMode, filters }) {
  if (!metas_pessoais) return null;

  const diasUteis = filters ? getDiasUteisFaltantes(filters.ano, filters.mes) : 0;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, paddingBottom: 40 }}>
      <MetaCard title="Vendas" icon={ShoppingCart} data={metas_pessoais.vendas} color="#ec6e2a" darkMode={darkMode} diasUteis={diasUteis} />
      <MetaCard title="Locação" icon={Key} data={metas_pessoais.locacao} color="#3b82f6" darkMode={darkMode} diasUteis={diasUteis} />
      <MetaCard title="Serviços" icon={Wrench} data={metas_pessoais.servicos} color="#10b981" darkMode={darkMode} diasUteis={diasUteis} />
    </div>
  )
}
