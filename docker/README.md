# Sistema KPIs - Guía de Despliegue

## Requisitos Previos

- **Docker** versión 20.10 o superior
- **Docker Compose** versión 2.0 o superior
- **Puertos disponibles**: 4200, 5129, 5432, 8080
- **RAM mínima**: 4GB para Docker

## Arquitectura

```
┌─────────────────────────────────────────────────────────────────┐
│                        DOCKER COMPOSE                           │
│                                                                 │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐ │
│  │Frontend  │───▶│Backend   │───▶│PostgreSQL│    │Keycloak  │ │
│  │(Angular) │    │(.NET 9)  │    │   (DB)   │    │  (Auth)  │ │
│  │  :4200   │    │  :8080   │    │  :5432   │    │  :8080   │ │
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Inicio Rápido (3 pasos)

### 1. Navegar a la carpeta docker
```powershell
cd C:\Users\juasi\ProyectoWeb_FullStack\docker
```

### 2. Ejecutar el script de inicio
```powershell
.\iniciar.bat
```

O directamente con Docker Compose:
```powershell
docker compose up -d --build
```

### 3. Esperar a que todo esté listo (~2-3 minutos)

## URLs de Acceso

| Servicio | URL | Descripción |
|----------|-----|-------------|
| **Frontend** | http://localhost:4200 | Aplicación Angular |
| **Keycloak** | http://localhost:8080 | Admin console |
| **Backend API** | http://localhost:5129 | API REST |
| **PostgreSQL** | localhost:5432 | Base de datos |

## Credenciales

### Keycloak
- URL: http://localhost:8080
- Usuario: **admin**
- Contraseña: **admin**

### PostgreSQL
- Host: localhost:5432
- Usuario: **postgres**
- Contraseña: **12345678**
- Base de datos app: **kpis_db**
- Base de datos auth: **keycloak_db**

## Usuarios de Prueba (precargados)

| Usuario | Contraseña | Rol |
|---------|------------|-----|
| admin | admin123 | admin |
| user | user123 | user |

## Comandos Útiles

```powershell
# Ver estado de servicios
docker compose ps

# Ver logs en tiempo real
docker compose logs -f

# Reiniciar todos los servicios
docker compose restart

# Detener servicios
docker compose down

# Detener y eliminar datos (limpieza completa)
docker compose down -v

# Reconstruir y reiniciar
docker compose up -d --build
```

## Solución de Problemas

### Error: Puerto en uso
```powershell
# Identificar qué proceso usa el puerto
netstat -ano | findstr :4200
netstat -ano | findstr :5129
netstat -ano | findstr :8080
netstat -ano | findstr :5432
```

### Los contenedores no inician
```powershell
# Ver logs de un servicio específico
docker compose logs postgres
docker compose logs keycloak
docker compose logs backend
docker compose logs frontend
```

### Esperar más tiempo
- PostgreSQL tarda ~20s en estar listo
- Keycloak tarda ~60s en estar listo
- Backend tarda ~40s en estar listo

### Reiniciar desde cero
```powershell
docker compose down -v
docker compose up -d --build
```

## Estructura de Archivos

```
ProyectoWeb_FullStack/
├── backend/
│   └── SistemaKpis/
│       ├── Dockerfile              # Multi-stage .NET 9
│       └── [proyecto .NET Core]
├── frontend/
│   └── sistema-kpis-frontend/
│       ├── Dockerfile              # Multi-stage Angular+Nginx
│       ├── nginx.conf              # Config proxy
│       └── [proyecto Angular]
└── docker/
    ├── compose.yaml                # Orquestación
    ├── init-scripts/
    │   └── kpis-realm.json         # Config auto Keycloak
    └── README.md                   # Este archivo
```

## Verificación de Salud

```powershell
curl http://localhost:5129/health      # Backend
curl http://localhost:8080/health/ready # Keycloak
curl http://localhost:4200/health      # Frontend
```

---

**Listo!** La aplicación funciona en http://localhost:4200
