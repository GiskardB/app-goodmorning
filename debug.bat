@echo off
echo Avvio app in modalita' debug...
echo.

cd /d "%~dp0"

:: Verifica che node_modules esista
if not exist "node_modules" (
    echo Installazione dipendenze...
    npm install
    echo.
)

:: Avvia Vite in modalita' dev
npm run dev

pause
