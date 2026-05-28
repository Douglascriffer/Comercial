@echo off
echo ===========================================
echo    INICIADOR - DASHBOARD COMERCIAL VENDAS
echo ===========================================
echo.

cd /d "Y:\.SAP VENDA\DASHBOARD VENDAS"

:: 1. Verificar se Node existe
node -v > nul 2>&1
if %errorlevel% neq 0 (
    echo [ERRO] O motor (Node.js) NAO esta no seu sistema.
    echo.
    echo PASSO A PASSO:
    echo 1. Va em: https://nodejs.org/
    echo 2. Baixe e instale a versao LTS.
    echo 3. REINICIE seu computador.
    echo.
    pause
    exit
)

:: 2. Instalar dependencias se nao existir
if not exist "node_modules\" (
    echo [INFO] Instalando pecas do sistema (node_modules)...
    echo Isso acontece apenas na primeira vez e pode levar 2-3 minutos.
    npm install
)

:: 3. Rodar site
echo.
echo [OK] Tudo pronto! Iniciando o site agora...
echo Mantenha esta janela aberta enquanto usa o site.
echo.
npm run dev

:: 4. Se der erro ao rodar, travar a janela para ler
if %errorlevel% neq 0 (
    echo.
    echo [ERRO] O site nao conseguiu ligar.
    echo Verifique o erro acima e me mande uma foto ou print.
    pause
)
