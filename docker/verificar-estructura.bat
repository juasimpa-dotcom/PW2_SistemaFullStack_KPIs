@echo off
REM ========================================
REM Sistema KPIs - Verificador de Estructura
REM ========================================

echo.
echo ========================================
echo   VERIFICANDO ESTRUCTURA DEL PROYECTO
echo ========================================
echo.

set ERRORES=0
set RAIZ=%cd%

REM Verificar que estamos en la carpeta correcta
if not exist "docker\compose.yaml" (
    echo [ERROR] No se encontro docker\compose.yaml
    echo.
    echo Asegurate de ejecutar este script desde la carpeta del proyecto.
    echo La estructura debe ser:
    echo   proyecto/
    echo   ^|- docker/
    echo   ^|- backend/
    echo   ^|- frontend/
    echo.
    pause
    exit /b 1
)

echo [OK] compose.yaml encontrado

REM Verificar Docker
docker --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker no esta instalado o no esta en el PATH
    set /a ERRORES+=1
) else (
    echo [OK] Docker instalado
)

REM Verificar estructura de carpetas
echo.
echo Verificando estructura...

if exist "backend\SistemaKpis\Dockerfile" (
    echo [OK] Backend Dockerfile
) else (
    echo [ERROR] Falta: backend\SistemaKpis\Dockerfile
    set /a ERRORES+=1
)

if exist "frontend\sistema-kpis-frontend\Dockerfile" (
    echo [OK] Frontend Dockerfile
) else (
    echo [ERROR] Falta: frontend\sistema-kpis-frontend\Dockerfile
    set /a ERRORES+=1
)

if exist "frontend\sistema-kpis-frontend\nginx.conf" (
    echo [OK] nginx.conf
) else (
    echo [ERROR] Falta: frontend\sistema-kpis-frontend\nginx.conf
    set /a ERRORES+=1
)

if exist "docker\init-scripts\kpis-realm.json" (
    echo [OK] kpis-realm.json
) else (
    echo [ERROR] Falta: docker\init-scripts\kpis-realm.json
    set /a ERRORES+=1
)

echo.

if %ERRORES% gtr 0 (
    echo ========================================
    echo   STRUCTURE INCOMPLETA
    echo ========================================
    echo.
    echo Faltan %ERRORES% archivos/carpetas.
    echo Revisa la estructura del proyecto.
    echo.
    echo Estructura necesaria:
    echo   proyecto/
    echo   ^|- docker/
    echo   ^|   ^|- compose.yaml
    echo   ^|   ^|- iniciar.bat
    echo   ^|   ^|- init-scripts/
    echo   ^|   ^   ^- kpis-realm.json
    echo   ^|- backend/
    echo   ^|   ^- SistemaKpis/
    echo   ^|       ^- Dockerfile
    echo   ^|- frontend/
    echo   ^|   ^- sistema-kpis-frontend/
    echo   ^|       ^- Dockerfile
    echo   ^|       ^- nginx.conf
    echo.
    pause
    exit /b 1
)

echo ========================================
echo   ESTRUCTURA CORRECTA
echo ========================================
echo.
echo Todo esta listo. Ejecutando el sistema...
echo.

REM Ir a la carpeta docker y ejecutar
cd docker
call iniciar.bat
