@echo off
REM ========================================
REM Sistema KPIs - Script de Despliegue
REM ========================================

echo ========================================
echo   SISTEMA KPIs - DOCKER COMPOSE
echo ========================================
echo.

cd /d "%~dp0"

REM Verificar que existe el compose.yaml
if not exist "compose.yaml" (
    echo ERROR: No se encontro compose.yaml
    echo Asegurate de estar en la carpeta docker/
    pause
    exit /b 1
)

REM Verificar Docker
docker --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Docker no esta instalado o no esta en el PATH
    pause
    exit /b 1
)

echo [OK] Docker instalado
echo.

echo [1/4] Verificando estructura de archivos...
echo.

REM Verificar backend
if not exist "..\backend\SistemaKpis\Dockerfile" (
    echo ERROR: Falta backend\SistemaKpis\Dockerfile
    pause
    exit /b 1
)
echo   [OK] Backend Dockerfile

REM Verificar frontend
if not exist "..\frontend\sistema-kpis-frontend\Dockerfile" (
    echo ERROR: Falta frontend\sistema-kpis-frontend\Dockerfile
    pause
    exit /b 1
)
echo   [OK] Frontend Dockerfile

REM Verificar nginx.conf
if not exist "..\frontend\sistema-kpis-frontend\nginx.conf" (
    echo ERROR: Falta frontend\sistema-kpis-frontend\nginx.conf
    pause
    exit /b 1
)
echo   [OK] nginx.conf

REM Verificar init-scripts
if not exist "init-scripts\kpis-realm.json" (
    echo ERROR: Falta init-scripts\kpis-realm.json
    pause
    exit /b 1
)
echo   [OK] kpis-realm.json

echo.
echo [2/4] Construyendo e iniciando contenedores...
echo.

docker compose up -d --build

if errorlevel 1 (
    echo ERROR: Fallo al iniciar los contenedores
    pause
    exit /b 1
)

echo.
echo [3/4] Esperando a que los servicios esten saludables...
echo.

REM Esperar a PostgreSQL
set /a intentos=30
:wait_postgres
    docker compose exec -T postgres pg_isready -U postgres -d kpis_db >nul 2>&1
    if %errorlevel%==0 goto postgres_ok
    set /a intentos-=1
    if %intentos%==0 (
        echo ERROR: PostgreSQL no respondio a tiempo
        goto mostrar_estado
    )
    timeout /t 2 /nobreak >nul
    goto wait_postgres
:postgres_ok
echo   - PostgreSQL: OK

REM Esperar a Keycloak
set /a intentos=60
:wait_keycloak
    curl -s http://localhost:8080/health/ready >nul 2>&1
    if %errorlevel%==0 goto keycloak_ok
    set /a intentos-=1
    if %intentos%==0 (
        echo ERROR: Keycloak no respondio a tiempo
        goto mostrar_estado
    )
    timeout /t 2 /nobreak >nul
    goto wait_keycloak
:keycloak_ok
echo   - Keycloak: OK

REM Esperar a Backend
set /a intentos=30
:wait_backend
    curl -s http://localhost:5129/health >nul 2>&1
    if %errorlevel%==0 goto backend_ok
    set /a intentos-=1
    if %intentos%==0 (
        echo ERROR: Backend no respondio a tiempo
        goto mostrar_estado
    )
    timeout /t 2 /nobreak >nul
    goto wait_backend
:backend_ok
echo   - Backend: OK

REM Esperar a Frontend
set /a intentos=20
:wait_frontend
    curl -s http://localhost:4200/health >nul 2>&1
    if %errorlevel%==0 goto frontend_ok
    curl -s http://localhost:4200/ >nul 2>&1
    if %errorlevel%==0 goto frontend_ok
    set /a intentos-=1
    if %intentos%==0 (
        echo ADVERTENCIA: Frontend no respondio, pero puede seguir levantando
        goto frontend_skip
    )
    timeout /t 2 /nobreak >nul
    goto wait_frontend
:frontend_ok
echo   - Frontend: OK

:frontend_skip

echo.
echo [4/4] Mostrando estado de servicios...
echo.

:mostrar_estado
echo.
echo ========================================
echo   SERVICIOS INICIADOS
echo ========================================
echo.
docker compose ps

echo.
echo ========================================
echo   ACCESOS
echo ========================================
echo.
echo   Frontend:     http://localhost:4200
echo   Keycloak:     http://localhost:8080
echo   Backend API:  http://localhost:5129
echo   PostgreSQL:   localhost:5432
echo.
echo   Keycloak Admin: admin / admin
echo   Usuarios prueba: admin / admin123  ^|  user / user123
echo.
echo ========================================
echo   COMANDOS UTILES
echo ========================================
echo.
echo   Ver logs:     docker compose logs -f
echo   Detener:     docker compose down
echo   Reiniciar:   docker compose restart
echo   Empezar de nuevo: docker compose down -v
echo.
pause
