import os
import json
import pandas as pd
from datetime import datetime

EXCEL_PATH = r"Y:\.SAP VENDA\DASHBOARD VENDAS\Não usar, fazendo teste para DASHBOARD COMERCIAL.xlsx"
JSON_PATH  = r"Y:\.SAP VENDA\DASHBOARD VENDAS\public\data\dados.json"

print("=" * 70)
print("  AUDITORIA JANEIRO/2026 — Dashboard vs Planilha Excel")
print("=" * 70)

# ─── 1. LER O JSON ──────────────────────────────────────────────────────────
with open(JSON_PATH, encoding='utf-8') as f:
    dados_json = json.load(f)

jan_period = next((p for p in dados_json['byPeriod'] if p['mes'] == 1 and p['ano'] == 2026), None)
jan_txs    = [t for t in dados_json['transactions'] if t['mes'] == 1 and t['ano'] == 2026]
jan_sellers = [s for s in dados_json['bySeller'] if s['mes'] == 1 and s['ano'] == 2026]

print("\n📋 DADOS DO JSON (dados.json) — Janeiro/2026")
print(f"  Vendas Realizado  : R$ {jan_period['vendas_realizado']:>15,.2f}")
print(f"  Locação Realizado : R$ {jan_period['locacao_realizado']:>15,.2f}")
print(f"  Serviços Realizado: R$ {jan_period['servicos_realizado']:>15,.2f}")
print(f"  Total Realizado   : R$ {jan_period['total_realizado']:>15,.2f}")
print(f"  Total Meta        : R$ {jan_period['total_meta']:>15,.2f}")
print(f"  Qtd Transações    : {jan_period['count']} pedidos")

soma_txs_json = sum(t['valor'] for t in jan_txs)
print(f"\n  SOMA das transactions[] jan: R$ {soma_txs_json:>15,.2f}")

print("\n  Vendedores (bySeller jan):")
for s in sorted(jan_sellers, key=lambda x: -x['valor']):
    print(f"    {s['vendedor']:<30} R$ {s['valor']:>12,.2f}  ({s['count']} pedidos)")

soma_sellers = sum(s['valor'] for s in jan_sellers)
print(f"  SOMA bySeller jan           : R$ {soma_sellers:>15,.2f}")

# ─── 2. LER O EXCEL ─────────────────────────────────────────────────────────
print("\n" + "─" * 70)
print("📊 LENDO EXCEL...")

xl = pd.ExcelFile(EXCEL_PATH)
print(f"  Sheets disponíveis: {xl.sheet_names}")

# ─── 3. SHEET META ANUAL ────────────────────────────────────────────────────
print("\n─── META ANUAL (coluna Jan = índice 1) ───")
if "META ANUAL" in xl.sheet_names:
    df_meta = pd.read_excel(EXCEL_PATH, sheet_name="META ANUAL", header=None)
    print(f"  Shape: {df_meta.shape}")
    
    # Imprimir primeiras 35 linhas do Excel para diagnóstico
    print("\n  Conteúdo das primeiras 35 linhas (col 0 = rótulo, col 1 = JAN):")
    for i in range(min(35, len(df_meta))):
        label_val = df_meta.iloc[i, 0] if len(df_meta.columns) > 0 else ''
        jan_val   = df_meta.iloc[i, 1] if len(df_meta.columns) > 1 else ''
        print(f"    Row[{i:2d}]: {str(label_val):<40} | Jan={jan_val}")
    
    # Extrair os valores que o bridge_data.py usa
    try:
        mt  = df_meta.iloc[4,  1]   # Total Meta
        mv  = df_meta.iloc[10, 1]   # Vendas Meta
        rv  = df_meta.iloc[11, 1]   # Vendas Realizado
        ml  = df_meta.iloc[19, 1]   # Locação Meta
        rl  = df_meta.iloc[20, 1]   # Locação Realizado
        ms  = df_meta.iloc[29, 1]   # Serviços Meta
        rs  = df_meta.iloc[30, 1]   # Serviços Realizado
        
        def clean(v):
            try:
                import math
                if v is None or (isinstance(v, float) and math.isnan(v)): return 0.0
                return float(v)
            except: return 0.0
        
        print(f"\n  Valores extraídos pelo bridge_data.py:")
        print(f"    Row[ 4] Total Meta       : R$ {clean(mt):>15,.2f}")
        print(f"    Row[10] Vendas Meta      : R$ {clean(mv):>15,.2f}")
        print(f"    Row[11] Vendas Realizado : R$ {clean(rv):>15,.2f}")
        print(f"    Row[19] Locação Meta     : R$ {clean(ml):>15,.2f}")
        print(f"    Row[20] Locação Realizado: R$ {clean(rl):>15,.2f}")
        print(f"    Row[29] Serviços Meta    : R$ {clean(ms):>15,.2f}")
        print(f"    Row[30] Serviços Realizado: R$ {clean(rs):>15,.2f}")
        total_excel = clean(rv) + clean(rl) + clean(rs)
        print(f"    TOTAL calculado (rv+rl+rs): R$ {total_excel:>15,.2f}")
        
    except Exception as e:
        print(f"  ERRO ao extrair META ANUAL: {e}")
else:
    print("  SHEET 'META ANUAL' NÃO ENCONTRADA!")

# ─── 4. SHEET JANEIRO ───────────────────────────────────────────────────────
print("\n─── SHEET JANEIRO ───")
sheet_jan = None
for s in xl.sheet_names:
    if s.upper() in ['JANEIRO', 'JAN']:
        sheet_jan = s
        break

if sheet_jan:
    df_jan = xl.parse(sheet_jan)
    print(f"  Shape: {df_jan.shape}")
    print(f"  Colunas: {list(df_jan.columns)}")
    
    # Filtrar apenas linhas com Número do Pedido numérico
    def is_numeric(x):
        try:
            import math
            v = float(x)
            return not math.isnan(v)
        except:
            return False
    
    df_tx = df_jan[df_jan['Número do Pedido'].apply(is_numeric)].copy()
    df_tx['Valor'] = pd.to_numeric(df_tx['Valor'], errors='coerce').fillna(0.0)
    
    soma_jan_excel = df_tx['Valor'].sum()
    print(f"\n  Total transações filtradas: {len(df_tx)}")
    print(f"  SOMA Valor (sheet Jan Excel): R$ {soma_jan_excel:>15,.2f}")
    
    # Comparar com JSON
    print(f"\n  SOMA transactions[] no JSON : R$ {soma_txs_json:>15,.2f}")
    diff_tx = soma_jan_excel - soma_txs_json
    print(f"  DIFERENÇA Excel vs JSON     : R$ {diff_tx:>15,.2f}  {'✅ OK' if abs(diff_tx) < 1 else '❌ DIVERGÊNCIA!'}")
    
    # Agrupamento por vendedor no Excel
    def clean_vendor(v):
        if pd.isna(v) or v is None: return 'Sem Vendedor'
        s = str(v).strip()
        if s == '' or s.upper() in ['NAN','NONE','0','0.0']: return 'Sem Vendedor'
        sl = s.lower()
        if 'klein' in sl: return 'Gabriel Klein'
        if 'rogislei' in sl: return 'Rogislei'
        if 'gabriel ferreira' in sl: return 'Gabriel Ferreira'
        if 'dias' in sl: return 'Gabriel Dias'
        if 'mercado' in sl: return 'Mercado Livre'
        if 'site' in sl: return 'Site'
        return s
    
    df_tx['Vendedor_clean'] = df_tx['Vendedor'].apply(clean_vendor)
    grupo_excel = df_tx.groupby('Vendedor_clean')['Valor'].sum().sort_values(ascending=False)
    
    print("\n  Vendedores (Excel Jan):")
    for vend, val in grupo_excel.items():
        print(f"    {vend:<30} R$ {val:>12,.2f}")
    
    # Comparar vendedor a vendedor
    print("\n─── COMPARAÇÃO VENDEDOR × VENDEDOR ───")
    print(f"  {'Vendedor':<30} {'Excel':>14}  {'JSON':>14}  {'DIFF':>14}  Status")
    print(f"  {'-'*30} {'-'*14}  {'-'*14}  {'-'*14}  {'-'*10}")
    
    sellers_json_map = {s['vendedor']: s['valor'] for s in jan_sellers}
    all_vendors = set(list(grupo_excel.index) + list(sellers_json_map.keys()))
    
    for v in sorted(all_vendors):
        val_excel = grupo_excel.get(v, 0.0)
        val_json  = sellers_json_map.get(v, 0.0)
        diff = val_excel - val_json
        ok = '✅' if abs(diff) < 1 else '❌'
        print(f"  {v:<30} R${val_excel:>13,.2f}  R${val_json:>13,.2f}  R${diff:>13,.2f}  {ok}")
    
    # ─── 5. DIAGNÓSTICO DE DIVERGÊNCIA ──────────────────────────────────────
    print("\n─── DIAGNÓSTICO DE DIVERGÊNCIA ───")
    diff_vendas = jan_period['vendas_realizado'] - soma_jan_excel
    print(f"  vendas_realizado (JSON)     : R$ {jan_period['vendas_realizado']:>15,.2f}")
    print(f"  Soma Sheet JANEIRO (Excel)  : R$ {soma_jan_excel:>15,.2f}")
    print(f"  Diferença                   : R$ {diff_vendas:>15,.2f}")
    
    if abs(diff_vendas) > 1:
        print("\n  ❌ DIVERGÊNCIA DETECTADA!")
        print(f"     O JSON mostra R$ {jan_period['vendas_realizado']:,.2f}")
        print(f"     O Excel (sheet JAN) soma R$ {soma_jan_excel:,.2f}")
        print(f"     Diferença: R$ {abs(diff_vendas):,.2f}")
        if jan_period['vendas_realizado'] == soma_jan_excel:
            print("     Mesmos valores — check manual necessário.")
        elif jan_period['vendas_realizado'] > soma_jan_excel:
            print("     JSON maior: o bridge_data.py pode estar usando META ANUAL (Row 11) em vez da sheet JANEIRO.")
        else:
            print("     Excel maior: há transações no sheet que não foram capturadas pelo JSON.")
    else:
        print("  ✅ Valores batem entre JSON e sheet JANEIRO!")
    
    # ─── 6. CHECAR TODOS OS VALORES ÚNICOS DE 'VENDEDOR' NA SHEET ───────────
    print("\n─── VALORES ÚNICOS DE VENDEDOR (raw, antes da limpeza) ───")
    raw_vendors = df_jan['Vendedor'].value_counts(dropna=False)
    for v, c in raw_vendors.items():
        print(f"    '{v}' — {c} ocorrências")
    
    # ─── 7. MOSTRAR LINHAS PROBLEMÁTICAS (não capturadas como numéricas) ─────
    df_non_tx = df_jan[~df_jan['Número do Pedido'].apply(is_numeric)]
    if len(df_non_tx) > 0:
        print(f"\n  ⚠️  {len(df_non_tx)} linhas IGNORADAS (Nº Pedido não numérico):")
        pd.set_option('display.max_columns', None)
        pd.set_option('display.width', 200)
        print(df_non_tx[['Número do Pedido','Cliente','Valor','Vendedor']].to_string())
    else:
        print("\n  ✅ Todas as linhas têm Nº de Pedido numérico.")

else:
    print("  ❌ SHEET DE JANEIRO NÃO ENCONTRADA!")
    print(f"  Sheets disponíveis: {xl.sheet_names}")

print("\n" + "=" * 70)
print("  FIM DA AUDITORIA")
print("=" * 70)
