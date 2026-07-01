# Resumo de Atualizações e Funcionamento do Dashboard (Criado em 19/06/2026)

Este documento foi criado para servir de "memória" para futuras sessões de Inteligência Artificial ou novos desenvolvedores. Leia este arquivo antes de realizar manutenções no projeto.

## 1. Como a Aplicação Funciona (Arquitetura)
*   **Frontend**: Next.js (com hospedagem na Vercel). O front-end não possui conexão direta com banco de dados (embora existam pacotes do Supabase no `package.json`, eles não são utilizados ativamente).
*   **Dados (ETL)**: Os dados do sistema são totalmente extraídos de três planilhas locais (Vendas, Locações e Serviços) e agrupados em um único arquivo de dados estático (`public/data/dados.json`).
*   **Hospedagem de Código**: O código-fonte oficial fica hospedado no GitHub: `https://github.com/Douglascriffer/Comercial`.

## 2. Fluxo de Atualização (Deploy)
Toda vez que uma alteração é feita no código ou nas planilhas, o fluxo de atualização é:
1. Executar o processador de dados (antigamente `python bridge_data.py`, hoje atualizado para suportar rodar via Node.js: `node generate_json.js`) para ler as planilhas do Excel e gerar o novo `dados.json`.
2. Enviar o código e o JSON para o **GitHub** (`git add .`, `git commit -m "..."`, `git push`).
3. Enviar a versão de produção para a **Vercel** usando a CLI local (`vercel --prod --yes`).
*Nota: O arquivo `ATUALIZAR_DASHBOARD.bat` automatiza esse fluxo.*

## 3. Principais Alterações Implementadas Recentemente (Junho/2026)
*   **Inclusão da Planilha de Serviços**:
    *   Foi integrado o arquivo `1- ACOMPANHAMENTO SERVIÇOS 2026.xlsx`.
    *   **Regra de Negócio de Serviços**: O extrator (`generate_json.js`) navega mês a mês capturando a célula **I2** (Meta Mensal) e a célula **D11** (Valor já Faturado). Ele calcula automaticamente a diferença (`servicos_falta`).
*   **Equipe de Vendas Dinâmica**:
    *   No arquivo `lib/hooks.js`, a lista de vendedores parou de ser uma lista engessada (hardcoded com 6 nomes).
    *   **Regra atual**: Todos os nomes que venderem mais que R$ 0,00 no mês selecionado aparecerão automaticamente no ranking e painel da "Equipe de Vendas".
    *   **Canais Separados**: As strings `'Mercado Livre'`, `'Site'`, `'Retorno de golpe'` e `'Sem Vendedor'` foram isoladas para entrarem sempre na categoria secundária de "Outros Canais".
*   **Separação de Repositório**:
    *   O link oficial do Git na pasta raiz foi desconectado do repositório `criffer-erp` e migrado em definitivo para `https://github.com/Douglascriffer/Comercial.git` para separar os sistemas.
*   **Nova Estrutura de Vendas vs Metas**:
    *   O painel foi reorganizado com abas de navegação no topo, dividindo a tela principal em duas janelas distintas: **VENDAS** e **METAS**.
    *   **Filtro Automático de Mês**: A navegação superior agora inicia com o *Mês Atual* pré-selecionado nativamente (`new Date().getMonth() + 1`), acabando com travamentos de filtro em meses passados.
    *   **Atualização do ETL (generate_json.js)**: As rotinas de coleta do Excel foram fortemente editadas para ler corretamente a linha de meta das empresas, metas comerciais e calculo do restante (`restante_empresa` e `restante_comercial`). 
    *   **Novo Card de "Faturamento A Realizar"**: Adicionado um bloco inteligente na aba de metas que exibe quantos dias úteis faltam para o mês acabar e o valor matemático do faturamento exigido por dia (Empresa e Comercial).
    *   **Ajuste Fino Visual (Tipografia e Design)**: 
        *   O "R$" foi removido dos card da aba de metas. O valor passou a ser formatado como puro com milhar matemático (ex: `935.202`) e sem decimais, acompanhando a mesma lógica de Javascript utilizada na aba Vendas.
        *   A fonte e tipografia de todos os números da Aba Metas foram padronizados (`fontWeight: 400`, `letterSpacing: -0.5px`, CSS class `.numeric`).
        *   Os ícones e cabeçalhos dos cards da aba Metas foram centralizados de maneira simétrica (títulos ao centro fixo, logotipos/ícones do lado esquerdo de forma absoluta).
*   **Atualizações da Transmissão Automática (24/06/2026)**:
    *   O ciclo de transmissão automática de tela (modo TV) teve seu intervalo alterado de 10 para 40 segundos por slide.
    *   A etapa com a "Tabela de Transações Detalhadas" foi completamente removida da aplicação para simplificar o visual.
    *   A transmissão agora alterna em um loop contínuo apenas entre as abas de **VENDAS** e **METAS**.
*   **Polling Silencioso e Correção de Rede (24/06/2026)**:
    *   **Auto-Refresh Invisível**: Adicionado um temporizador em `app/page.jsx` e `lib/hooks.js` que busca novos dados do `dados.json` a cada 10 minutos. Isso permite que a TV receba atualizações automaticamente sem a necessidade de dar "F5" (refresh manual) na página, e sem exibir bolinha de carregamento.
    *   **Correção do Script de Atualização**: O arquivo `ATUALIZAR_DASHBOARD.bat` foi modificado para injetar a variável `GIT_ASK_YESNO=false`. Isso resolve definitivamente o problema do Git travar com a mensagem *"Rename from ... failed. Should I try again? (y/n)"*, que ocorria devido a um conflito de cache no servidor de rede Windows SMB. Adicionalmente, as configurações locais do Git (`gc.auto 0`, `core.fscache false`) foram ajustadas.
*   **Correção de Travamento do Vercel CLI (25/06/2026)**:
    *   O arquivo `ATUALIZAR_DASHBOARD.bat` foi modificado para incluir `set CI=true` antes do comando de deploy. Isso evita que a interface de linha de comando da Vercel pause a execução automática para perguntar sobre atualizações disponíveis (`Would you like to upgrade now? (Y/n)`), garantindo que a rotina agendada (ex: 17h) finalize perfeitamente sem intervenção humana.
*   **Correção de Cálculo da Meta de Serviços e Deploy (29/06/2026)**:
    *   Foi corrigido o cálculo do "Restante Comercial" e "Restante Empresa" na extração de Serviços dentro do script `generate_json.js`. Ele agora calcula dinamicamente a diferença exata através do `realizado` (`D11`) em vez de herdar dados residuais da planilha.
    *   O script `ATUALIZAR_DASHBOARD.bat` foi modernizado. A linha de processamento de dados que usava o comando obsoleto `python bridge_data.py` foi oficialmente substituída para rodar de forma nativa com Node.js através do comando `node generate_json.js`.
*   **Correção de Cálculo da Meta de Locação (01/07/2026)**:
    *   Foi corrigido o cálculo do "Restante Comercial" e "Restante Empresa" na extração de Locações dentro do script `generate_json.js`. O cálculo agora é feito matematicamente (subtraindo o realizado da meta) para evitar que o Card de "Faturamento a Realizar" fique zerado devido a dados residuais ou falhas de leitura na planilha Excel.

## 4. Onde Encontrar Arquivos Importantes
*   `lib/hooks.js`: Onde ocorre a filtragem dos vendedores por nome e mês.
*   `generate_json.js`: Script Node responsável por ler as 3 planilhas Excel (Vendas, Locações e Serviços) e cuspir os indicadores do dashboard no `/public/data/dados.json`.
*   `ATUALIZAR_DASHBOARD.bat`: Script padrão para atualizar o front e a vercel.
