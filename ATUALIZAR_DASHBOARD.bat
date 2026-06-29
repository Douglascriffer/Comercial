@echo off
cd /d "Y:\.SAP VENDA\DASHBOARD VENDAS"

echo =====================================
echo INICIANDO PROCESSAMENTO DO EXCEL E ATUALIZACAO DO SITE
echo =====================================
echo.

:: 1. Executar processador python
set GIT_ASK_YESNO=false
echo [1/3] Processando dados do Excel...
node generate_json.js
if %errorlevel% neq 0 (
    echo.
    echo [ERRO] Falha ao processar os dados do Excel. Verifique se o Python esta instalado
    echo e se a planilha nao esta aberta no Excel.
    pause
    exit
)

:: 2. Sincronizar no Git
echo [2/3] Atualizando repositorio no GitHub...
git pull
git add .
git commit -m "Atualizacao automatica de vendas"
git push

:: 3. Deploy na Vercel
echo [3/3] Enviando atualizacao para a Vercel...
set CI=true
vercel --prod --yes

echo =====================================
echo DASHBOARD COMERCIAL ATUALIZADO COM SUCESSO!
echo =====================================
echo.
pause
