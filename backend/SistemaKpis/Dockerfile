# ETAPA 1: Build - Compilar la aplicación
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build

# Establecer trabajo
WORKDIR /src

# Copiar archivos de proyecto para caching de NuGet
COPY ["SistemaKpis.API/SistemaKpis.API.csproj", "SistemaKpis.API/"]
COPY ["SistemaKpis.Application/SistemaKpis.Application.csproj", "SistemaKpis.Application/"]
COPY ["SistemaKpis.Infrastructure/SistemaKpis.Infrastructure.csproj", "SistemaKpis.Infrastructure/"]
COPY ["SistemaKpis.Core/SistemaKpis.Core.csproj", "SistemaKpis.Core/"]

# Restaurar dependencias (caché)
RUN dotnet restore SistemaKpis.API/SistemaKpis.API.csproj

# Copiar todo el código fuente
COPY . .

# Compilar en modo Release
WORKDIR /src/SistemaKpis.API
RUN dotnet build -c Release -o /app/build --no-restore

# Publicar la aplicación
RUN dotnet publish -c Release -o /app/publish --no-build

# ETAPA 2: Runtime - Ejecutar la aplicación
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime

# Crear usuario no-root por seguridad
RUN groupadd -r appgroup && useradd -r -g appgroup appuser

WORKDIR /app

# Copiar archivos publicados desde etapa build
COPY --from=build /app/publish .

# Establecer permisos para usuario no-root
RUN chown -R appuser:appgroup /app

# Configurar usuario no-root
USER appuser

# Variables de entorno
ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production
ENV DOTNET_RUNNING_IN_CONTAINER=true

# Exponer puerto
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

# Punto de entrada
ENTRYPOINT ["dotnet", "SistemaKpis.API.dll"]