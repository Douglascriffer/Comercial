import os
import json
import pandas as pd
import openpyxl
from datetime import datetime

# Configurações de Caminhos
EXCEL_PATH = r"Y:\.SAP VENDA\DASHBOARD VENDAS\Não usar, fazendo teste para DASHBOARD COMERCIAL.xlsx"
JSON_OUTPUT = r"Y:\.SAP VENDA\DASHBOARD VENDAS\public\data\dados.json"

def log(msg):
    print(f"[{datetime.now().strftime('%H:%M:%S')}] {msg}")

def ensure_dirs():
    dir_path = os.path.dirname(JSON_OUTPUT)
    if not os.path.exists(dir_path):
        os.makedirs(dir_path)
        log(f"Diretório criado: {dir_path}")

def is_numeric_ped(x):
    try:
        val = float(x)
        import math
        return not math.isnan(val)
    except:
        return False

def clean_vendor(v):
    if pd.isna(v) or v is None:
        return 'Sem Vendedor'
    s = str(v).strip()
    if s == '' or s.upper() in ['NAN', 'NONE', '0', '0.0']:
        return 'Sem Vendedor'
    
    # Padronização
    s_lower = s.lower()
    if 'klein' in s_lower:
        return 'Gabriel Klein'
    if 'rogislei' in s_lower:
        return 'Rogislei'
    if 'gabriel ferreira' in s_lower:
        return 'Gabriel Ferreira'
    if 'dias' in s_lower:
        return 'Gabriel Dias'
    if 'mercado' in s_lower:
        return 'Mercado Livre'
    if 'site' in s_lower:
        return 'Site'
    if 'retorno' in s_lower and 'golpe' in s_lower:
        return 'Retorno de golpe'
    
    return s

def process_excel():
    if not os.path.exists(EXCEL_PATH):
        log(f"ERRO: Arquivo Excel não encontrado em {EXCEL_PATH}.")
        return None

    try:
        log(f"Lendo Excel: {EXCEL_PATH}...")
        xl = pd.ExcelFile(EXCEL_PATH)
        
        result = {
            "byPeriod": [],
            "bySeller": [],
            "transactions": [],
            "meta": {"2026": []}
        }
        
        # Mapeamento de nome de sheet para número do mês
        months_map = {
            'JANEIRO': 1, 'FEVEREIRO': 2, 'MARÇO': 3, 'ABRIL': 4, 'MAIO': 5,
            'JUNHO': 6, 'JULHO': 7, 'AGOSTO': 8, 'SETEMBRO': 9, 'OUTUBRO': 10,
            'NOVEMBRO': 11, 'DEZEMBRO': 12
        }
        
        months_names = {
            1: 'Janeiro', 2: 'Fevereiro', 3: 'Março', 4: 'Abril', 5: 'Maio',
            6: 'Junho', 7: 'Julho', 8: 'Agosto', 9: 'Setembro', 10: 'Outubro',
            11: 'Novembro', 12: 'Dezembro'
        }

        # 1. Carregar as metas e realizados anuais da sheet META ANUAL
        annual_metrics = {}
        for m in range(1, 13):
            annual_metrics[m] = {
                "vendas_meta": 0.0, "vendas_realizado": 0.0,
                "locacao_meta": 0.0, "locacao_realizado": 0.0,
                "servicos_meta": 0.0, "servicos_realizado": 0.0,
                "total_meta": 0.0
            }

        if "META ANUAL" in xl.sheet_names:
            log("Processando metas e realizados da sheet META ANUAL...")
            # Lemos sem cabeçalho para garantir correspondência exata de índices
            df_meta = pd.read_excel(EXCEL_PATH, sheet_name="META ANUAL", header=None)
            
            # Mapeamento de colunas para meses (índices 1 a 12 na planilha)
            for m in range(1, 13):
                # Total Meta (row index 4, which is row 5)
                mt = df_meta.iloc[4, m]
                
                # Vendas (row index 10 para meta, 11 para vendido)
                mv = df_meta.iloc[10, m]
                rv = df_meta.iloc[11, m]
                
                # Locação (row index 19 para meta, 20 para vendido)
                ml = df_meta.iloc[19, m]
                rl = df_meta.iloc[20, m]
                
                # Serviços (row index 29 para meta, 30 para vendido)
                ms = df_meta.iloc[29, m]
                rs = df_meta.iloc[30, m]

                def clean_val(val):
                    if pd.isna(val) or val is None:
                        return 0.0
                    try:
                        return float(val)
                    except:
                        return 0.0

                annual_metrics[m] = {
                    "vendas_meta": clean_val(mv),
                    "vendas_realizado": clean_val(rv),
                    "locacao_meta": clean_val(ml),
                    "locacao_realizado": clean_val(rl),
                    "servicos_meta": clean_val(ms),
                    "servicos_realizado": clean_val(rs),
                    "total_meta": clean_val(mt)
                }
                
                # Adicionar na estrutura "meta" para retrocompatibilidade se necessário
                result["meta"]["2026"].append({
                    "mes": m,
                    "label": months_names[m][:3],
                    "meta_empresa": clean_val(mv),
                    "meta_nossa": clean_val(mv) # Copiando meta de vendas
                })
        
        # 2. Processar cada um dos 12 meses do ano
        for m_num in range(1, 13):
            month_name_upper = months_names[m_num].upper()
            
            # Procurar se a sheet do mês existe
            sheet_found_name = None
            for s_name in xl.sheet_names:
                if s_name.upper() == month_name_upper or (s_name.upper() == 'MARÇO' and month_name_upper == 'MARÇO') or (s_name.upper() == 'MARCO' and month_name_upper == 'MARÇO'):
                    sheet_found_name = s_name
                    break
            
            tx_list = []
            tx_sum = 0.0
            
            if sheet_found_name:
                log(f"Processando vendas detalhadas da sheet: {sheet_found_name} (Mês {m_num})...")
                df = xl.parse(sheet_found_name)
                
                # Filtrar transações válidas (Número do Pedido numérico)
                df_tx = df[df['Número do Pedido'].apply(is_numeric_ped)].copy()
                df_tx['Valor'] = pd.to_numeric(df_tx['Valor'], errors='coerce').fillna(0.0)
                
                tx_sum = df_tx['Valor'].sum()
                
                # Adicionar transações individuais para a lista global de transações
                for _, row in df_tx.iterrows():
                    ped_val = row.get('Número do Pedido')
                    try:
                        ped_val = int(float(ped_val))
                    except:
                        ped_val = str(ped_val)
                        
                    cli_val = str(row.get('Cliente', '')).strip()
                    val_val = float(row.get('Valor', 0.0))
                    v_val = clean_vendor(row.get('Vendedor'))
                    
                    # Tratar a data
                    dt_val = row.get('Data')
                    if isinstance(dt_val, datetime):
                        dt_str = dt_val.strftime("%Y-%m-%d")
                    elif pd.notna(dt_val):
                        try:
                            dt_str = pd.to_datetime(str(dt_val).strip()).strftime("%Y-%m-%d")
                        except:
                            dt_str = str(dt_val)
                    else:
                        dt_str = f"2026-{m_num:02d}-01"
                        
                    obs_val = str(row.get('Observações', '')).strip()
                    if obs_val == 'nan' or pd.isna(row.get('Observações')):
                        obs_val = ''
                    
                    tx_record = {
                        "ano": 2026,
                        "mes": m_num,
                        "pedido": ped_val,
                        "cliente": cli_val,
                        "valor": val_val,
                        "vendedor": v_val,
                        "data": dt_str,
                        "obs": obs_val
                    }
                    result["transactions"].append(tx_record)
                    tx_list.append(tx_record)
                    
                    # Agrupar por vendedor no mês
                    # Procurar se já existe registro desse vendedor no bySeller
                    existing = next((item for item in result["bySeller"] if item["ano"] == 2026 and item["mes"] == m_num and item["vendedor"] == v_val), None)
                    if existing:
                        existing["valor"] += val_val
                        existing["count"] += 1
                    else:
                        result["bySeller"].append({
                            "ano": 2026,
                            "mes": m_num,
                            "vendedor": v_val,
                            "valor": val_val,
                            "count": 1
                        })
            
            # 3. Consolidar os dados financeiros deste mês
            metrics = annual_metrics[m_num]
            vendas_meta = metrics["vendas_meta"]
            vendas_realizado = metrics["vendas_realizado"]
            
            # Se o faturamento na META ANUAL for zero ou nan, mas temos transações detalhadas,
            # usamos a soma das transações como o faturamento de vendas realizado!
            if (vendas_realizado == 0.0 or pd.isna(vendas_realizado)) and tx_sum > 0:
                vendas_realizado = tx_sum
                log(f"  Mês {m_num}: Faturamento da META ANUAL vazio. Usando soma das transações: R$ {vendas_realizado:,.2f}")
            
            locacao_meta = metrics["locacao_meta"]
            locacao_realizado = metrics["locacao_realizado"]
            servicos_meta = metrics["servicos_meta"]
            servicos_realizado = metrics["servicos_realizado"]
            
            total_meta = metrics["total_meta"]
            total_realizado = vendas_realizado + locacao_realizado + servicos_realizado

            result["byPeriod"].append({
                "ano": 2026,
                "mes": m_num,
                "label": months_names[m_num].capitalize() + "/26",
                "vendas_meta": vendas_meta,
                "vendas_realizado": vendas_realizado,
                "locacao_meta": locacao_meta,
                "locacao_realizado": locacao_realizado,
                "servicos_meta": servicos_meta,
                "servicos_realizado": servicos_realizado,
                "total_meta": total_meta,
                "total_realizado": total_realizado,
                "count": len(tx_list)
            })

        log("Processamento concluído com sucesso.")
        return result
    except Exception as e:
        log(f"ERRO no processamento: {str(e)}")
        import traceback
        traceback.print_exc()
        return None

def clean_nans(obj):
    if isinstance(obj, dict):
        return {k: clean_nans(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [clean_nans(i) for i in obj]
    elif isinstance(obj, float):
        import math
        if math.isnan(obj) or math.isinf(obj):
            return 0.0
    return obj

def main():
    ensure_dirs()
    final_data = process_excel()
    
    if final_data:
        # Limpar NaNs
        final_data = clean_nans(final_data)
        
        json_str = json.dumps(final_data, ensure_ascii=False, indent=2)
        with open(JSON_OUTPUT, 'w', encoding='utf-8') as f:
            f.write(json_str)
        log(f"Dados sincronizados com sucesso em {JSON_OUTPUT}")
    else:
        log("Falha na sincronização.")

if __name__ == "__main__":
    main()
