@echo off
cd /d "Y:\.SAP VENDA\DASHBOARD VENDAS"

echo =====================================
echo INICIANDO PROCESSAMENTO AUTOMATICO
echo =====================================
echo.

:: 1. Executar processador Node.js
echo [1/3] Processando dados do Excel...
node generate_json.js

:: 2. Sincronizar no Git
echo [2/3] Atualizando repositorio no GitHub...
git pull
git add .
git commit -m "Atualizacao automatica agendada"
git push

:: 3. Deploy na Vercel
echo [3/3] Enviando atualizacao para a Vercel...
cmd /c "vercel --prod --yes"

echo.
echo =====================================
echo DASHBOARD COMERCIAL ATUALIZADO COM SUCESSO!
echo =====================================
