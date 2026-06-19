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

## 4. Onde Encontrar Arquivos Importantes
*   `lib/hooks.js`: Onde ocorre a filtragem dos vendedores por nome e mês.
*   `generate_json.js`: Script Node responsável por ler as 3 planilhas Excel (Vendas, Locações e Serviços) e cuspir os indicadores do dashboard no `/public/data/dados.json`.
*   `ATUALIZAR_DASHBOARD.bat`: Script padrão para atualizar o front e a vercel.
