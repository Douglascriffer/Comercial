'use client'
import { useState, useMemo, useEffect } from 'react'
import { Search, ChevronLeft, ChevronRight, Download, FileText } from 'lucide-react'
import { usePagination } from '@/lib/hooks'

function fmtCurrency(v) {
  return `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  // Converter YYYY-MM-DD para DD/MM/YYYY
  const parts = dateStr.split('-')
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`
  }
  return dateStr
}

export default function TabelaTransacoes({ transactions = [], darkMode = false }) {
  const [search, setSearch] = useState('')
  const [vendedorFilter, setVendedorFilter] = useState('all')

  const t = {
    card: darkMode ? '#1e1e2d' : '#e2e8f0',
    border: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
    text: darkMode ? '#ffffff' : '#000000',
    textMuted: darkMode ? '#ffffff' : '#000000',
    thBg: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.04)',
    rowHover: darkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.03)',
    pillBg: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    inputBg: darkMode ? 'rgba(255,255,255,0.04)' : '#ffffff',
    inputText: darkMode ? '#ffffff' : '#000000'
  }

  // Obter lista única de vendedores para o filtro select
  const uniqueSellers = useMemo(() => {
    const list = new Set()
    transactions.forEach(t => {
      if (t.vendedor) list.add(t.vendedor)
    })
    return Array.from(list).sort()
  }, [transactions])

  // Filtrar e Ordenar dados
  const filteredTxs = useMemo(() => {
    const result = transactions.filter(item => {
      // Filtro de Vendedor
      if (vendedorFilter !== 'all' && item.vendedor !== vendedorFilter) return false
      
      // Filtro de Busca (Cliente ou Pedido)
      if (search.trim() !== '') {
        const query = search.toLowerCase()
        const matchCli = (item.cliente || '').toLowerCase().includes(query)
        const matchPed = String(item.pedido).toLowerCase().includes(query)
        const matchObs = (item.obs || '').toLowerCase().includes(query)
        if (!matchCli && !matchPed && !matchObs) return false
      }
      
      return true
    });

    // Ordenar por Pedido decrescente (do maior/mais recente para o menor/mais antigo)
    return result.sort((a, b) => {
      const numA = Number(a.pedido);
      const numB = Number(b.pedido);
      if (!isNaN(numA) && !isNaN(numB)) {
        return numB - numA;
      }
      return String(b.pedido || '').localeCompare(String(a.pedido || ''));
    });
  }, [transactions, search, vendedorFilter])

  // Paginação
  const pageSize = 10
  const { paginated, page, totalPages, goTo, prev, next, setPage } = usePagination(filteredTxs, pageSize)

  // Resetar página quando a busca ou filtro muda
  useEffect(() => {
    setPage(1)
  }, [search, vendedorFilter, setPage])

  // Exportar para CSV simples
  const exportToCSV = () => {
    if (filteredTxs.length === 0) return
    const headers = ['Pedido', 'Cliente', 'Vendedor', 'Valor (R$)', 'Data', 'Observações']
    const rows = filteredTxs.map(t => [
      t.pedido,
      `"${t.cliente.replace(/"/g, '""')}"`,
      t.vendedor,
      t.valor.toFixed(2),
      t.data,
      `"${(t.obs || '').replace(/"/g, '""')}"`
    ])
    
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n')
      
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `comercial_vendas_export_${filtersLabel()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const filtersLabel = () => {
    if (vendedorFilter !== 'all') return vendedorFilter.toLowerCase().replace(/\s+/g, '_')
    return 'todas'
  }

  return (
    <div style={{
      background: t.card,
      border: `1px solid ${t.border}`,
      borderRadius: 12,
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      boxShadow: darkMode ? '0 4px 20px rgba(0,0,0,0.15)' : '0 4px 20px rgba(0,0,0,0.02)'
    }}>
      {/* Topo da Tabela: Busca e Ações */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <h3 style={{ fontSize: 16, color: t.text, margin: 0 }}>Registro de Vendas Detalhado</h3>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {/* Caixa de Busca */}
          <div style={{ position: 'relative', minWidth: 200 }}>
            <Search size={16} color={t.textMuted} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              placeholder="Buscar cliente, pedido..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 36px',
                background: t.inputBg,
                border: `1px solid ${t.border}`,
                borderRadius: 8,
                fontSize: 14,
                color: t.inputText,
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
            />
          </div>

          {/* Filtro Vendedor */}
          <select
            value={vendedorFilter}
            onChange={e => setVendedorFilter(e.target.value)}
            style={{
              padding: '8px 12px',
              background: t.inputBg,
              border: `1px solid ${t.border}`,
              borderRadius: 8,
              fontSize: 14,
              color: t.inputText,
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="all" style={{ background: t.card, color: t.text }}>Todos os Vendedores</option>
            {uniqueSellers.map(seller => (
              <option key={seller} value={seller} style={{ background: t.card, color: t.text }}>{seller}</option>
            ))}
          </select>

          {/* Botão de Exportar */}
          <button 
            onClick={exportToCSV}
            disabled={filteredTxs.length === 0}
            style={{
              padding: '8px 16px',
              background: '#ec6e2a',
              color: '#ffffff',
              border: 'none',
              borderRadius: 8,
              fontSize: 14,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              cursor: filteredTxs.length === 0 ? 'not-allowed' : 'pointer',
              opacity: filteredTxs.length === 0 ? 0.5 : 1
            }}
          >
            <Download size={14} />
            Exportar
          </button>
        </div>
      </div>

      {/* Grid de Tabela */}
      <div style={{ overflowX: 'auto', border: `1px solid ${t.border}`, borderRadius: 8 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14, textAlign: 'left', minWidth: 700 }}>
          <thead>
            <tr style={{ background: t.thBg, borderBottom: `1px solid ${t.border}` }}>
              <th style={{ padding: '12px 16px', color: t.text }}>Pedido</th>
              <th style={{ padding: '12px 16px', color: t.text }}>Cliente</th>
              <th style={{ padding: '12px 16px', color: t.text }}>Vendedor</th>
              <th style={{ padding: '12px 16px', color: t.text }}>Valor</th>
              <th style={{ padding: '12px 16px', color: t.text }}>Data</th>
              <th style={{ padding: '12px 16px', color: t.text }}>Observações</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: t.textMuted }}>
                  Nenhum registro de venda encontrado para os filtros selecionados.
                </td>
              </tr>
            ) : (
              paginated.map((row, idx) => (
                <tr 
                  key={`${row.pedido}-${idx}`}
                  style={{ 
                    borderBottom: idx === paginated.length - 1 ? 'none' : `1px solid ${t.border}`,
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = t.rowHover}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <td style={{ padding: '12px 16px', color: '#ec6e2a' }} className="numeric">#{row.pedido}</td>
                  <td style={{ padding: '12px 16px', color: t.text, fontWeight: 400 }}>{row.cliente}</td>
                  <td style={{ padding: '12px 16px', color: t.text }}>
                    <span style={{ 
                      padding: '4px 8px', 
                      background: t.pillBg, 
                      borderRadius: 6, 
                      fontSize: 11,
                      color: row.vendedor === 'Sem Vendedor' ? t.textMuted : '#ec6e2a'
                    }}>
                      {row.vendedor}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', color: t.text, }} className="numeric">{fmtCurrency(row.valor)}</td>
                  <td style={{ padding: '12px 16px', color: t.text }} className="numeric">{formatDate(row.data)}</td>
                  <td style={{ 
                    padding: '12px 16px', 
                    color: t.textMuted, 
                    maxWidth: 200, 
                    whiteSpace: 'nowrap', 
                    overflow: 'hidden', 
                    textOverflow: 'ellipsis' 
                  }} title={row.obs}>
                    {row.obs || '—'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginação */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
          <span style={{ fontSize: 14, color: t.textMuted, fontWeight: 400 }}>
            Mostrando {paginated.length} de {filteredTxs.length} transações (Pág. {page}/{totalPages})
          </span>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button
              onClick={prev}
              disabled={page === 1}
              style={{
                width: 32,
                height: 32,
                borderRadius: 6,
                border: `1px solid ${t.border}`,
                background: page === 1 ? 'transparent' : t.inputBg,
                color: page === 1 ? t.textMuted : t.text,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: page === 1 ? 'not-allowed' : 'pointer',
                opacity: page === 1 ? 0.4 : 1
              }}
            >
              <ChevronLeft size={16} />
            </button>
            
            {/* Numeração de Páginas compacta */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let targetPage;
              if (totalPages <= 5) {
                targetPage = i + 1;
              } else {
                targetPage = page - 2 + i;
                if (page <= 2) targetPage = i + 1;
                if (page >= totalPages - 1) targetPage = totalPages - 4 + i;
              }
              if (targetPage < 1 || targetPage > totalPages) return null
              
              return (
                <button
                  key={targetPage}
                  onClick={() => goTo(targetPage)}
                  className="numeric"
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 6,
                    border: `1px solid ${page === targetPage ? '#ec6e2a' : t.border}`,
                    background: page === targetPage ? '#ec6e2a' : t.inputBg,
                    color: page === targetPage ? '#ffffff' : t.text,
                    fontSize: 14,
                    cursor: 'pointer'
                  }}
                >
                  {targetPage}
                </button>
              )
            })}
            
            <button
              onClick={next}
              disabled={page === totalPages}
              style={{
                width: 32,
                height: 32,
                borderRadius: 6,
                border: `1px solid ${page === totalPages ? 'transparent' : t.border}`,
                background: page === totalPages ? 'transparent' : t.inputBg,
                color: page === totalPages ? t.textMuted : t.text,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: page === totalPages ? 'not-allowed' : 'pointer',
                opacity: page === totalPages ? 0.4 : 1
              }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
