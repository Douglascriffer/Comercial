'use client'
import { useState, useEffect, useCallback, useMemo } from 'react'

// Cache em memória
const cache = new Map()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutos

function setCache(key, value) {
  cache.set(key, { value, ts: Date.now() })
}

function getCache(key) {
  const entry = cache.get(key)
  if (!entry) return null
  if (Date.now() - entry.ts > CACHE_TTL) {
    cache.delete(key)
    return null
  }
  return entry.value
}

// Hook principal de dados
export function useFinancialData() {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  const load = useCallback(async () => {
    const cacheKey = 'financial_data_vendas_v2'
    const cached   = getCache(cacheKey)
    if (cached) {
      setData(cached)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const res = await fetch('/data/dados.json')
      if (!res.ok) throw new Error('Dados do comercial não encontrados')
      const json = await res.json()
      setCache(cacheKey, json)
      setData(json)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return { data, loading, error, refetch: load }
}

// Hook de dados filtrados
export function useFilteredData(data, filters) {
  return useMemo(() => {
    if (!data) return null

    const { ano, mes } = filters
    const yearNum = Number(ano || 2026)
    const monthNum = mes === 'all' ? 'all' : Number(mes)

    const cacheKey = `filtered_v2_${yearNum}_${monthNum}`
    const cached   = getCache(cacheKey)
    if (cached) return cached

    // 1. Filtrar transações individuais
    const filteredTxs = data.transactions.filter(t => {
      if (t.ano !== yearNum) return false
      if (monthNum !== 'all' && t.mes !== monthNum) return false
      return true
    })

    // 2. Filtrar períodos (byPeriod)
    const filteredPeriods = data.byPeriod.filter(p => {
      if (p.ano !== yearNum) return false
      if (monthNum !== 'all' && p.mes !== monthNum) return false
      return true
    })

    // 3. Somar os KPIs da sheet META ANUAL para o período selecionado
    const vendasRealizado = filteredPeriods.reduce((sum, p) => sum + (p.vendas_realizado || 0), 0)
    const servicosRealizado = filteredPeriods.reduce((sum, p) => sum + (p.servicos_realizado || 0), 0)
    const locacaoRealizado = filteredPeriods.reduce((sum, p) => sum + (p.locacao_realizado || 0), 0)
    
    const totalRealizado = vendasRealizado + servicosRealizado + locacaoRealizado
    const totalMeta = filteredPeriods.reduce((sum, p) => sum + (p.total_meta || 0), 0)
    const pctAtingido = totalMeta > 0 ? (totalRealizado / totalMeta) * 100 : 0
    const countTransactions = filteredTxs.length
    const ticketMedio = countTransactions > 0 ? vendasRealizado / countTransactions : 0

    // 4. Calcular Vendas do Dia (Faturamento do dia mais recente)
    let vendasDiaValor = 0.0
    let vendasDiaLabel = '—'

    if (filteredTxs.length > 0) {
      // Encontrar a data mais recente (formato YYYY-MM-DD)
      const dates = filteredTxs.map(t => t.data).filter(Boolean)
      if (dates.length > 0) {
        const maxDate = dates.reduce((max, d) => d > max ? d : max, dates[0])
        
        // Somar vendas nessa data
        const dayTxs = filteredTxs.filter(t => t.data === maxDate)
        vendasDiaValor = dayTxs.reduce((sum, t) => sum + t.valor, 0)
        
        // Formatar data para DD/MM
        const parts = maxDate.split('-')
        if (parts.length === 3) {
          vendasDiaLabel = `${parts[2]}/${parts[1]}`
        }
      }
    }

    // 5. Agregar Vendas por Vendedor no período e reconciliar com o faturamento oficial de Vendas
    const sellerMap = {}
    
    filteredTxs.forEach(t => {
      const v = t.vendedor || 'Sem Vendedor'
      if (!sellerMap[v]) {
        sellerMap[v] = { name: v, valor: 0.0, count: 0 }
      }
      sellerMap[v].valor += t.valor
      sellerMap[v].count += 1
    })

    const allSellers = Object.values(sellerMap)
    
    // Adicionar o valor de Serviços manualmente para Gabriel Medeiros
    if (servicosRealizado > 0) {
      let gm = allSellers.find(s => s.name === 'Gabriel Medeiros')
      if (!gm) {
        gm = { name: 'Gabriel Medeiros', valor: 0.0, count: 0 }
        allSellers.push(gm)
      }
      gm.valor += servicosRealizado
    }
    
    // Identificar o que é "Outros Canais" em vez de "Vendedores Físicos"
    const OUTROS_CANAIS = ['Mercado Livre', 'Site', 'Retorno de golpe', 'Sem Vendedor']

    const salesTeam = allSellers
      .filter(s => !OUTROS_CANAIS.includes(s.name) && s.valor > 0)
      .sort((a, b) => b.valor - a.valor)
      
    let otherChannels = allSellers
      .filter(s => OUTROS_CANAIS.includes(s.name) && s.valor > 0)
      .sort((a, b) => b.valor - a.valor)

    // O somatório de todos os vendedores inclui agora Vendas, Locação e Serviços.
    // Para não duplicar, totalRealizadoReal é simplesmente a soma de todo mundo:
    const totalRealizadoReal = salesTeam.reduce((sum, s) => sum + s.valor, 0)
                             + otherChannels.reduce((sum, s) => sum + s.valor, 0)
                             
    // O KPI de "Vendas" puras deve ser o Total menos os outros serviços:
    const vendasRealizadoReal = totalRealizadoReal - servicosRealizado - locacaoRealizado

    // 6. Dados para gráfico histórico mensal (jan-dez)
    const historyMonths = data.byPeriod
      .filter(p => p.ano === yearNum)
      .sort((a, b) => a.mes - b.mes)
      .map(p => ({
        mes: p.mes,
        name: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'][p.mes - 1],
        'Faturamento': p.historico_faturamento || 0,
        'Meta': p.historico_meta || 0
      }))

    const pctAtingidoReal = totalMeta > 0 ? (totalRealizadoReal / totalMeta) * 100 : 0
    const ticketMedioReal = countTransactions > 0 ? vendasRealizadoReal / countTransactions : 0

    const result = {
      transactions: filteredTxs,
      byPeriod: filteredPeriods,
      salesTeam,
      otherChannels,
      historyMonths,
      kpis: {
        vendasRealizado:  vendasRealizadoReal,
        servicosRealizado,
        locacaoRealizado,
        totalRealizado:   totalRealizadoReal,
        totalMeta,
        pctAtingido:      pctAtingidoReal,
        ticketMedio:      ticketMedioReal,
        vendasDiaValor,
        vendasDiaLabel,
        countTransactions
      }
    }

    setCache(cacheKey, result)
    return result
  }, [data, filters])
}

// Hook de paginação
export function usePagination(items = [], pageSize = 10) {
  const [page, setPage] = useState(1)
  const totalPages = Math.ceil(items.length / pageSize)
  const paginated  = items.slice((page - 1) * pageSize, page * pageSize)

  const goTo = (p) => setPage(Math.max(1, Math.min(p, totalPages)))
  const prev  = () => goTo(page - 1)
  const next  = () => goTo(page + 1)

  return { paginated, page, totalPages, goTo, prev, next, setPage }
}
