#!/bin/bash

# ========================================
# Sistema KPIs - Script de Despliegue (Linux/Mac)
# ========================================

echo "========================================"
echo "  SISTEMA KPIs - DOCKER COMPOSE"
echo "========================================"
echo ""

cd "$(dirname "$0")"

echo "[1/4] Verificando Docker..."
if ! command -v docker &> /dev/null; then
    echo "ERROR: Docker no esta instalado"
    exit 1
fi

echo "[2/4] Construyendo e iniciando contenedores..."
echo ""
docker compose up -d --build

if [ $? -ne 0 ]; then
    echo "ERROR: Fallo al iniciar los contenedores"
    exit 1
fi

echo ""
echo "[3/4] Esperando a que los servicios esten saludables..."
echo ""

# Función para verificar servicio
check_service() {
    local name=$1
    local url=$2
    local max_attempts=30
    
    for i in $(seq 1 $max_attempts); do
        if curl -sf "$url" > /dev/null 2>&1; then
            echo "   - $name: OK"
            return 0
        fi
        sleep 2
    done
    echo "   - $name: ADVERTENCIA (puede seguir iniciando)"
    return 1
}

check_service "PostgreSQL" "http://localhost:5432"
check_service "Keycloak" "http://localhost:8080/health/ready"
check_service "Backend" "http://localhost:5129/health"
check_service "Frontend" "http://localhost:4200/health"

echo ""
echo "[4/4] Mostrando estado de servicios..."
echo ""
docker compose ps

echo ""
echo "========================================"
echo "  SERVICIOS INICIADOS"
echo "========================================"
echo ""
echo "  Frontend:     http://localhost:4200"
echo "  Keycloak:     http://localhost:8080"
echo "  Backend API:  http://localhost:5129"
echo "  PostgreSQL:   localhost:5432"
echo ""
echo "  Keycloak Admin: admin / admin"
echo ""
echo "========================================"
echo "  COMANDOS UTILES"
echo ""
echo "  Ver logs:     docker compose logs -f"
echo "  Detener:     docker compose down"
echo "  Reiniciar:   docker compose restart"
echo ""
echo "Para acceder a la aplicación, abre: http://localhost:4200"
echo ""