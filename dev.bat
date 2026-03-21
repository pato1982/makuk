@echo off
cd /d "%~dp0"

title Makuk Dev
color 0A
cls

echo.
echo  =========================================
echo   MAKUK - Ambiente de Desarrollo
echo  =========================================
echo.

:: ---- PASO 1: Limpiar procesos anteriores en puertos 3001 y 5173/5175 ----
echo  [1/4] Liberando puertos anteriores...

for /f "tokens=5" %%p in ('netstat -ano 2^>nul ^| findstr ":3001 " ^| findstr "LISTENING"') do (
    echo        Cerrando proceso en puerto 3001 (PID %%p)...
    taskkill /PID %%p /F >nul 2>&1
)
for /f "tokens=5" %%p in ('netstat -ano 2^>nul ^| findstr ":5173 " ^| findstr "LISTENING"') do (
    echo        Cerrando proceso en puerto 5173 (PID %%p)...
    taskkill /PID %%p /F >nul 2>&1
)
for /f "tokens=5" %%p in ('netstat -ano 2^>nul ^| findstr ":5175 " ^| findstr "LISTENING"') do (
    echo        Cerrando proceso en puerto 5175 (PID %%p)...
    taskkill /PID %%p /F >nul 2>&1
)
echo        OK
echo.

:: ---- PASO 2: Tunel SSH para MySQL remoto ----
echo  [2/4] Verificando tunel SSH (MySQL en VPS)...

netstat -ano 2>nul | findstr ":3306 " | findstr "LISTENING" >nul 2>&1
if %errorlevel%==0 (
    echo        OK - Tunel ya activo en puerto 3306
) else (
    echo        Abriendo tunel SSH hacia makuk...
    start "Makuk SSH Tunnel" /min cmd /c "ssh -L 3306:localhost:3306 -N makuk"
    timeout /t 5 /nobreak >nul
    netstat -ano 2>nul | findstr ":3306 " | findstr "LISTENING" >nul 2>&1
    if %errorlevel%==0 (
        echo        OK - Tunel SSH conectado
    ) else (
        color 0C
        echo.
        echo   !! ERROR: No se pudo abrir el tunel SSH !!
        echo.
        echo   Verifica:
        echo     - Conexion a internet activa
        echo     - Alias "makuk" definido en ~/.ssh/config
        echo     - Servidor VPS accesible (ssh makuk)
        echo.
        pause
        exit /b 1
    )
)
echo.

:: ---- PASO 3: Backend Express ----
echo  [3/4] Iniciando Backend (puerto 3001)...
start "Makuk Backend" cmd /k "cd /d "%~dp0backend" && npm run dev"
timeout /t 5 /nobreak >nul
echo        OK - Backend iniciado
echo.

:: ---- PASO 4: Frontend Vite ----
echo  [4/4] Iniciando Frontend (puerto 5173)...
start "Makuk Frontend" cmd /k "cd /d "%~dp0" && npm run dev"
timeout /t 5 /nobreak >nul
echo        OK - Frontend iniciado
echo.

:: ---- Abrir navegador ----
echo  Abriendo navegador...
start "" "http://localhost:5173"
echo.

:: ---- Resumen ----
echo  =========================================
echo   Todo listo!
echo  =========================================
echo.
echo   Tunel SSH : localhost:3306 --^> makuk VPS
echo   Backend   : http://localhost:3001
echo   Frontend  : http://localhost:5173
echo.
echo   Panel admin : http://localhost:5173/admin
echo   Ventas      : http://localhost:5173/admin/control
echo.
echo   Ventanas abiertas: "Makuk Backend" y "Makuk Frontend"
echo   El tunel SSH corre minimizado en segundo plano.
echo.
echo   Para detener todo: cierra las ventanas de cada proceso.
echo.
timeout /t 8 /nobreak >nul
exit
