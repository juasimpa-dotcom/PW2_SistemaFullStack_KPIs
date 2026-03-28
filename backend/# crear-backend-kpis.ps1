# crear-backend-kpis.ps1

Write-Host "Creando solución Backend para Sistema de Análisis de KPIs (.NET 9.0)" -ForegroundColor Cyan

$APP_NAME = "SistemaKpis"

# Crear solución
Write-Host "Creando solución..." -ForegroundColor Yellow
dotnet new sln -n $APP_NAME

# Crear proyectos
Write-Host "Creando proyectos..." -ForegroundColor Yellow
dotnet new webapi -n "$APP_NAME.API" -f net9.0
dotnet new classlib -n "$APP_NAME.Core" -f net9.0
dotnet new classlib -n "$APP_NAME.Application" -f net9.0
dotnet new classlib -n "$APP_NAME.Infrastructure" -f net9.0

# Agregar proyectos a la solución
Write-Host "Agregando proyectos..." -ForegroundColor Yellow
dotnet sln add "$APP_NAME.API/$APP_NAME.API.csproj"
dotnet sln add "$APP_NAME.Core/$APP_NAME.Core.csproj"
dotnet sln add "$APP_NAME.Application/$APP_NAME.Application.csproj"
dotnet sln add "$APP_NAME.Infrastructure/$APP_NAME.Infrastructure.csproj"

# Referencias
Write-Host "Estableciendo referencias..." -ForegroundColor Yellow

Set-Location "$APP_NAME.API"
dotnet add reference "../$APP_NAME.Application/$APP_NAME.Application.csproj"
dotnet add reference "../$APP_NAME.Infrastructure/$APP_NAME.Infrastructure.csproj"
Set-Location ..

Set-Location "$APP_NAME.Application"
dotnet add reference "../$APP_NAME.Core/$APP_NAME.Core.csproj"
Set-Location ..

Set-Location "$APP_NAME.Infrastructure"
dotnet add reference "../$APP_NAME.Core/$APP_NAME.Core.csproj"
Set-Location ..

Write-Host "Estructura creada correctamente" -ForegroundColor Green

# Paquetes NuGet
Write-Host "Agregando paquetes..." -ForegroundColor Yellow

Set-Location "$APP_NAME.API"
dotnet add package Microsoft.EntityFrameworkCore.Design --version 9.0.3
dotnet add package Microsoft.AspNetCore.Authentication.JwtBearer --version 9.0.3
dotnet add package Swashbuckle.AspNetCore --version 7.3.1
dotnet add package Serilog.AspNetCore --version 9.0.0
dotnet add package Serilog.Sinks.PostgreSQL --version 2.3.0
dotnet add package Serilog.Enrichers.Environment --version 3.0.1
dotnet add package Microsoft.AspNetCore.OpenApi --version 9.0.3
Set-Location ..

Set-Location "$APP_NAME.Application"
dotnet add package FluentValidation --version 11.11.0
dotnet add package FluentValidation.DependencyInjectionExtensions --version 11.11.0
dotnet add package MediatR --version 12.4.1
dotnet add package Microsoft.Extensions.Logging.Abstractions --version 9.0.3
Set-Location ..

Set-Location "$APP_NAME.Infrastructure"
dotnet add package Npgsql.EntityFrameworkCore.PostgreSQL --version 9.0.4
dotnet add package Microsoft.EntityFrameworkCore --version 9.0.3
dotnet add package Microsoft.EntityFrameworkCore.Tools --version 9.0.3
dotnet add package Microsoft.Extensions.Options.ConfigurationExtensions --version 9.0.3
dotnet add package System.IdentityModel.Tokens.Jwt --version 8.6.1
Set-Location ..

Set-Location "$APP_NAME.Core"
dotnet add package Microsoft.Extensions.Logging.Abstractions --version 9.0.3
Set-Location ..

# Restaurar y compilar
Write-Host "Restaurando y compilando..." -ForegroundColor Yellow
dotnet restore
dotnet build

# Crear carpetas
Write-Host "Creando estructura de carpetas..." -ForegroundColor Yellow

New-Item -ItemType Directory -Force -Path "$APP_NAME.Application/DTOs/Ventas"
New-Item -ItemType Directory -Force -Path "$APP_NAME.Application/DTOs/KPIs"
New-Item -ItemType Directory -Force -Path "$APP_NAME.Application/Interfaces"
New-Item -ItemType Directory -Force -Path "$APP_NAME.Application/Servicios"

New-Item -ItemType Directory -Force -Path "$APP_NAME.Core/Entidades/Base"
New-Item -ItemType Directory -Force -Path "$APP_NAME.Core/Entidades/Transacciones"
New-Item -ItemType Directory -Force -Path "$APP_NAME.Core/Entidades/Catalogos"
New-Item -ItemType Directory -Force -Path "$APP_NAME.Core/Entidades/Configuracion"

New-Item -ItemType Directory -Force -Path "$APP_NAME.Infrastructure/Data/Configuraciones"
New-Item -ItemType Directory -Force -Path "$APP_NAME.Infrastructure/Repositorios"
New-Item -ItemType Directory -Force -Path "$APP_NAME.Infrastructure/Keycloak"

New-Item -ItemType Directory -Force -Path "$APP_NAME.API/Controllers"
New-Item -ItemType Directory -Force -Path "$APP_NAME.API/Middleware"
New-Item -ItemType Directory -Force -Path "$APP_NAME.API/Extensiones"

# Crear archivo EntidadBase
@"
namespace SistemaKpis.Core.Entidades.Base;

public abstract class EntidadBase
{
    public int Id { get; set; }
    public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;
    public DateTime? FechaActualizacion { get; set; }
}
"@ | Set-Content "$APP_NAME.Core/Entidades/Base/EntidadBase.cs"

# Crear appsettings.json
@"
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=kpis_db;Username=postgres;Password=postgres"
  },
  "Keycloak": {
    "AuthServerUrl": "http://localhost:8080",
    "Realm": "kpis-realm",
    "ClientId": "api-kpis-client"
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*"
}
"@ | Set-Content "$APP_NAME.API/appsettings.json"

Write-Host "¡Proyecto creado exitosamente!" -ForegroundColor Green