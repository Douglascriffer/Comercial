const fs = require('fs');
const XLSX = require('xlsx');
const path = require('path');

const EXCEL_VENDAS_PATH = "Y:\\.SAP VENDA\\DASHBOARD VENDAS\\1- ACOMPANHAMENTO VENDAS 2026.xlsx";
const EXCEL_LOCACOES_PATH = "Y:\\.SAP VENDA\\DASHBOARD VENDAS\\1- ACOMPANHAMENTO LOCAÇÕES 2026.xlsx";
const EXCEL_SERVICOS_PATH = "Y:\\.SAP VENDA\\DASHBOARD VENDAS\\1- ACOMPANHAMENTO SERVIÇOS 2026.xlsx";
const JSON_OUTPUT = "Y:\\.SAP VENDA\\DASHBOARD VENDAS\\public\\data\\dados.json";

const monthsNames = {
    1: 'Janeiro', 2: 'Fevereiro', 3: 'Março', 4: 'Abril', 5: 'Maio',
    6: 'Junho', 7: 'Julho', 8: 'Agosto', 9: 'Setembro', 10: 'Outubro',
    11: 'Novembro', 12: 'Dezembro'
};

function log(msg) {
    console.log(`[${new Date().toLocaleTimeString()}] ${msg}`);
}

function cleanVendor(v) {
    if (v === null || v === undefined) return 'Sem Vendedor';
    let s = String(v).trim();
    if (s === '' || ['NAN', 'NONE', '0', '0.0'].includes(s.toUpperCase())) return 'Sem Vendedor';
    
    let lower = s.toLowerCase();
    if (lower.includes('klein')) return 'Gabriel Klein';
    if (lower.includes('rogislei')) return 'Rogislei';
    if (lower.includes('gabriel ferreira')) return 'Gabriel Ferreira';
    if (lower.includes('dias')) return 'Gabriel Dias';
    if (lower.includes('mercado')) return 'Mercado Livre';
    if (lower.includes('site')) return 'Site';
    if (lower.includes('retorno') && lower.includes('golpe')) return 'Retorno de golpe';
    
    return s;
}

function processSheet(ws, m_num, result, txList, isLocacao) {
    let rows = XLSX.utils.sheet_to_json(ws, { defval: null, cellDates: true });
    if (rows.length === 0) return 0.0;
    
    let colMap = {};
    for (let k of Object.keys(rows[0])) {
        colMap[k.trim().toLowerCase()] = k;
    }
    
    let pedidoCol = colMap['número do pedido'] || colMap['contrato'];
    if (!pedidoCol) return 0.0;
    
    let valorCol = colMap['valor'];
    if (!valorCol) return 0.0;
    
    let txSum = 0.0;
    
    for (let row of rows) {
        let ped = row[pedidoCol];
        let pedNum = parseFloat(ped);
        if (isNaN(pedNum)) continue;
        
        let val = parseFloat(row[valorCol]);
        if (isNaN(val)) val = 0.0;
        
        txSum += val;
        
        let clienteCol = colMap['cliente'];
        let cli = clienteCol ? String(row[clienteCol] || '').trim() : '';
        
        let vendedorCol = colMap['vendedor'];
        let vend = cleanVendor(row[vendedorCol]);
        
        let dataCol = colMap['data'];
        let dt = row[dataCol];
        let dtStr = `2026-${String(m_num).padStart(2, '0')}-01`;
        if (dt instanceof Date) {
            dtStr = dt.toISOString().split('T')[0];
        } else if (dt) {
            dtStr = String(dt);
        }
        
        let obsCol = colMap['observações'] || colMap['observacoes'];
        let obs = obsCol ? String(row[obsCol] || '').trim() : '';
        if (obs.toLowerCase() === 'nan') obs = '';
        
        let finalPed = isLocacao ? `LOC-${pedNum}` : String(pedNum);
        
        let txRecord = {
            ano: 2026,
            mes: m_num,
            pedido: finalPed,
            cliente: cli,
            valor: val,
            vendedor: vend,
            data: dtStr,
            obs: obs,
            tipo: isLocacao ? "Locação" : "Venda"
        };
        
        result.transactions.push(txRecord);
        txList.push(txRecord);
        
        let existing = result.bySeller.find(s => s.ano === 2026 && s.mes === m_num && s.vendedor === vend);
        if (existing) {
            existing.valor += val;
            existing.count += 1;
        } else {
            result.bySeller.push({
                ano: 2026,
                mes: m_num,
                vendedor: vend,
                valor: val,
                count: 1
            });
        }
    }
    
    return txSum;
}

function run() {
    log(`Lendo ${EXCEL_VENDAS_PATH}`);
    let wbVendas = XLSX.readFile(EXCEL_VENDAS_PATH, { cellDates: true });
    
    let wbLocacoes = null;
    if (fs.existsSync(EXCEL_LOCACOES_PATH)) {
        log(`Lendo ${EXCEL_LOCACOES_PATH}`);
        wbLocacoes = XLSX.readFile(EXCEL_LOCACOES_PATH, { cellDates: true });
    }
    
    let wbServicos = null;
    if (fs.existsSync(EXCEL_SERVICOS_PATH)) {
        log(`Lendo ${EXCEL_SERVICOS_PATH}`);
        wbServicos = XLSX.readFile(EXCEL_SERVICOS_PATH, { cellDates: true });
    }
    
    let result = {
        byPeriod: [],
        bySeller: [],
        transactions: [],
        meta: { "2026": [] }
    };
    
    let annualMetrics = {};
    for (let i = 1; i <= 12; i++) {
        annualMetrics[i] = {
            vendas_meta: 0, vendas_realizado: 0,
            locacao_meta: 0, locacao_realizado: 0,
            servicos_meta: 0, servicos_realizado: 0,
            total_meta: 0
        };
    }
    
    if (wbVendas.SheetNames.includes('META ANUAL')) {
        log('Processando META ANUAL');
        let wsMeta = wbVendas.Sheets['META ANUAL'];
        let rowsMeta = XLSX.utils.sheet_to_json(wsMeta, { header: 1, defval: 0 });
        
        for (let m = 1; m <= 12; m++) {
            let mt = parseFloat(rowsMeta[4]?.[m]) || 0;
            let mv = parseFloat(rowsMeta[10]?.[m]) || 0;
            let rv = parseFloat(rowsMeta[11]?.[m]) || 0;
            let ml = parseFloat(rowsMeta[19]?.[m]) || 0;
            let rl = parseFloat(rowsMeta[20]?.[m]) || 0;
            let ms = parseFloat(rowsMeta[29]?.[m]) || 0;
            let rs = parseFloat(rowsMeta[30]?.[m]) || 0;
            
            annualMetrics[m] = {
                vendas_meta: mv, vendas_realizado: rv,
                locacao_meta: ml, locacao_realizado: rl,
                servicos_meta: ms, servicos_realizado: rs,
                total_meta: mt
            };
            
            result.meta["2026"].push({
                mes: m,
                label: monthsNames[m].substring(0,3),
                meta_empresa: mv,
                meta_nossa: mv
            });
        }
    }
    
    for (let m = 1; m <= 12; m++) {
        let mName = monthsNames[m].toUpperCase();
        let mNameAlt = mName.replace('Ç', 'C');
        
        let sheetVendasName = wbVendas.SheetNames.find(s => s.toUpperCase() === mName || s.toUpperCase() === mNameAlt);
        
        let txList = [];
        let vendasSum = 0.0;
        let vMeta = 0, vFat = 0;
        if (sheetVendasName) {
            log(`Processando Vendas Mês ${m}`);
            let wsV = wbVendas.Sheets[sheetVendasName];
            vendasSum = processSheet(wsV, m, result, txList, false);
            
            vMeta = wsV['I2'] ? parseFloat(wsV['I2'].v) : 0;
            vFat = wsV['H1'] ? parseFloat(wsV['H1'].v) : 0;
            if (isNaN(vMeta)) vMeta = 0;
            if (isNaN(vFat)) vFat = 0;
        }
        
        let locacoesSum = 0.0;
        let lMeta = 0, lFat = 0;
        if (wbLocacoes) {
            let sheetLocacoesName = wbLocacoes.SheetNames.find(s => s.toUpperCase() === mName || s.toUpperCase() === mNameAlt);
            if (sheetLocacoesName) {
                log(`Processando Locações Mês ${m}`);
                let wsL = wbLocacoes.Sheets[sheetLocacoesName];
                locacoesSum = processSheet(wsL, m, result, txList, true);
                
                lMeta = wsL['I2'] ? parseFloat(wsL['I2'].v) : 0;
                lFat = wsL['H1'] ? parseFloat(wsL['H1'].v) : 0;
                if (isNaN(lMeta)) lMeta = 0;
                if (isNaN(lFat)) lFat = 0;
            }
        }
        
        let sMeta = 0, sFat = 0;
        if (wbServicos) {
            let sheetServicosName = wbServicos.SheetNames.find(s => s.toUpperCase() === mName || s.toUpperCase() === mNameAlt);
            if (sheetServicosName) {
                log(`Processando Serviços Mês ${m}`);
                let wsServicos = wbServicos.Sheets[sheetServicosName];
                
                sMeta = wsServicos['I2'] ? parseFloat(wsServicos['I2'].v) : 0;
                if (isNaN(sMeta)) sMeta = 0;
                
                sFat = wsServicos['H1'] ? parseFloat(wsServicos['H1'].v) : 0;
                if (isNaN(sFat)) sFat = 0;
                
                let sRealizado = wsServicos['D11'] ? parseFloat(wsServicos['D11'].v) : 0;
                if (isNaN(sRealizado)) sRealizado = 0;
                
                annualMetrics[m].servicos_meta = sMeta;
                annualMetrics[m].servicos_realizado = sRealizado;
            }
        }
        
        let metrics = annualMetrics[m];
        let vendasReal = metrics.vendas_realizado;
        if ((vendasReal === 0 || isNaN(vendasReal)) && vendasSum > 0) {
            vendasReal = vendasSum;
        }
        
        let locacaoReal = metrics.locacao_realizado;
        if (locacoesSum > 0) {
            locacaoReal = locacoesSum;
        }
        
        let servicosFalta = metrics.servicos_meta - metrics.servicos_realizado;
        
        // Se a planilha do mês não existe para nenhuma área, desconsiderar no histórico (ou apenas colocar o valor de onde existe)
        // Se a sheet existe e tem valores, eles já estão nas vars vMeta, lMeta, sMeta, etc.
        let historicoMeta = vMeta + lMeta + sMeta;
        let historicoFat = vFat + lFat + sFat;
        
        result.byPeriod.push({
            ano: 2026,
            mes: m,
            label: monthsNames[m] + '/26',
            vendas_meta: metrics.vendas_meta,
            vendas_realizado: vendasReal,
            locacao_meta: metrics.locacao_meta,
            locacao_realizado: locacaoReal,
            servicos_meta: metrics.servicos_meta,
            servicos_realizado: metrics.servicos_realizado,
            servicos_falta: servicosFalta,
            total_meta: metrics.total_meta,
            total_realizado: vendasReal + locacaoReal + metrics.servicos_realizado,
            historico_meta: historicoMeta,
            historico_faturamento: historicoFat,
            count: txList.length
        });
    }
    
    fs.writeFileSync(JSON_OUTPUT, JSON.stringify(result, null, 2));
    log('Processamento concluído com sucesso.');
}

run();
