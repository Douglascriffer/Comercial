const XLSX = require('xlsx')
const path = require('path')

const EXCEL_PATH = "Y:\\.SAP VENDA\\DASHBOARD VENDAS\\Não usar, fazendo teste para DASHBOARD COMERCIAL.xlsx"

const wb = XLSX.readFile(EXCEL_PATH, { cellDates: true })

console.log('\n=== SHEETS DISPONÍVEIS ===')
console.log(wb.SheetNames.join(', '))

// Analisar as sheets de meses
const MESES = ['JANEIRO','FEVEREIRO','MARÇO','MARCO','ABRIL','MAIO']

for (const sheetName of wb.SheetNames) {
  const upper = sheetName.toUpperCase().replace('Ç','C').replace('Ã','A')
  if (!['JANEIRO','FEVEREIRO','MARCO','MARCO','ABRIL','MAIO'].some(m => upper.includes(m))) continue

  const ws = wb.Sheets[sheetName]
  
  // Ler sem header para ver as colunas reais (A, B, C, D, E, F...)
  const rowsRaw = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' })
  
  console.log(`\n${'='.repeat(60)}`)
  console.log(`SHEET: ${sheetName}`)
  console.log(`${'='.repeat(60)}`)
  
  // Mostrar cabeçalhos (primeiras 3 linhas)
  for (let i = 0; i < Math.min(4, rowsRaw.length); i++) {
    const row = rowsRaw[i]
    const cols = row.slice(0, 10) // Colunas A até J
    const labels = ['A','B','C','D','E','F','G','H','I','J']
    console.log(`  Linha ${i+1}: `)
    cols.forEach((val, idx) => {
      if (val !== '' && val !== null && val !== undefined) {
        console.log(`    Col ${labels[idx]}: "${val}"`)
      }
    })
  }

  // Ler com cabeçalho para ver os nomes das colunas
  const rowsNamed = XLSX.utils.sheet_to_json(ws, { defval: null })
  if (rowsNamed.length > 0) {
    console.log(`\n  Colunas nomeadas (cabeçalho da planilha):`)
    const headers = Object.keys(rowsNamed[0])
    headers.forEach((h, i) => console.log(`    [${i}] "${h}"`))
    
    // Mostrar primeiras 5 linhas de dados
    console.log(`\n  Primeiras 5 linhas de dados:`)
    rowsNamed.slice(0, 5).forEach((row, i) => {
      console.log(`    Linha ${i+1}: ${JSON.stringify(row)}`)
    })
    
    // Contar quantas têm coluna D (índice 3) vazia vs preenchida
    // e verificar se coluna F (índice 5) tem dados nesses casos
    const colNames = Object.keys(rowsNamed[0])
    const colD = colNames[3]
    const colF = colNames[5]
    console.log(`\n  Análise Col D="${colD}" vs Col F="${colF}":`)
    let dVazia = 0, fPreenchida = 0
    rowsNamed.forEach(row => {
      const d = row[colD]
      const f = row[colF]
      const dEmpty = d === null || d === '' || d === undefined
      if (dEmpty) {
        dVazia++
        if (f !== null && f !== '' && f !== undefined) fPreenchida++
      }
    })
    console.log(`    Linhas com Col D vazia: ${dVazia}`)
    console.log(`    Dessas, Col F preenchida: ${fPreenchida}`)
    
    // Exemplos de linhas com D vazia
    if (dVazia > 0) {
      console.log(`\n  Exemplos de linhas com Col D vazia:`)
      rowsNamed.filter(r => !r[colD]).slice(0, 5).forEach(row => {
        console.log(`    ${JSON.stringify(row)}`)
      })
    }
  }
}
