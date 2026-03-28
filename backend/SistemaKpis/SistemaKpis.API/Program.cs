using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using SistemaKpis.Application.Interfaces;
using SistemaKpis.Application.DTOs.KPIs;
using SistemaKpis.Core.Interfaces;  // ✅ AGREGAR ESTO - Para IRepositorioBase, IServicioRepositorio, IVentaRepositorio
using SistemaKpis.Infrastructure.Data;
using SistemaKpis.Infrastructure.Repositorios;
using SistemaKpis.Infrastructure.Servicios;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Agregar servicios al contenedor
builder.Services.AddControllers();

// Configurar Swagger con autenticación
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Sistema KPIs API",
        Version = "v1",
        Description = "API para gestión de KPIs de ventas con autenticación JWT"
    });

    // Agregar botón de autorización en Swagger
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Ingresa el token JWT en el formato: Bearer {token}"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// Registrar DbContext con PostgreSQL
builder.Services.AddDbContext<KpisDbContext>(options =>
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        b => b.MigrationsAssembly("SistemaKpis.Infrastructure")
    ));

// Configurar Autenticación JWT con Keycloak
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.Authority = builder.Configuration["Jwt:Authority"];
        options.Audience = builder.Configuration["Jwt:Audience"];
        options.RequireHttpsMetadata = false;  // ← Importante para desarrollo

        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Authority"],
            ValidAudience = builder.Configuration["Jwt:Audience"]
        };
    });

// Configurar Autorización por roles
builder.Services.AddAuthorizationBuilder()
    .AddPolicy("VendedorPolicy", policy =>
        policy.RequireRole("vendedor").RequireAuthenticatedUser())
    .AddPolicy("SupervisorPolicy", policy =>
        policy.RequireRole("supervisor", "vendedor").RequireAuthenticatedUser());

// Registrar repositorios
builder.Services.AddScoped(typeof(IRepositorioBase<>), typeof(RepositorioBase<>));
builder.Services.AddScoped<IServicioRepositorio, ServicioRepositorio>();
builder.Services.AddScoped<IVentaRepositorio, VentaRepositorio>();

// Registrar servicios de KPIs
builder.Services.AddScoped<IKpiServicio, KpiServicio>();

// Configurar CORS (para el frontend Angular)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular",
        builder => builder
            .WithOrigins("http://localhost:4200")
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials());
});

var app = builder.Build();

// Configurar el pipeline HTTP
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Sistema KPIs API v1");
        c.RoutePrefix = "swagger";
    });
}

app.UseHttpsRedirection();
app.UseCors("AllowAngular");

// ⚠️ IMPORTANTE: El orden de estos middlewares es CRÍTICO
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Endpoint público para health check
app.MapGet("/", () => "Sistema KPIs API - Running ✅");

// Endpoint para obtener token (solo desarrollo)
app.MapPost("/auth/login", async (HttpContext context, IConfiguration config) =>
{
    var keycloakUrl = config["Keycloak:AuthServerUrl"];
    var realm = config["Keycloak:Realm"];
    var clientId = config["Keycloak:ClientId"];
    var clientSecret = config["Keycloak:ClientSecret"];

    using var reader = new StreamReader(context.Request.Body);
    var body = await reader.ReadToEndAsync();
    var formData = System.Web.HttpUtility.ParseQueryString(body);

    var username = formData["username"];
    var password = formData["password"];

    if (string.IsNullOrEmpty(username) || string.IsNullOrEmpty(password))
    {
        return Results.BadRequest(new { error = "Username y password son requeridos" });
    }

    using var httpClient = new HttpClient();
    var tokenUrl = $"{keycloakUrl}/realms/{realm}/protocol/openid-connect/token";

    var content = new FormUrlEncodedContent(new[]
    {
        new KeyValuePair<string, string>("grant_type", "password"),
        new KeyValuePair<string, string>("client_id", clientId ?? ""),
        new KeyValuePair<string, string>("client_secret", clientSecret ?? ""),
        new KeyValuePair<string, string>("username", username ?? ""),
        new KeyValuePair<string, string>("password", password ?? "")
    });

    var response = await httpClient.PostAsync(tokenUrl, content);
    var responseContent = await response.Content.ReadAsStringAsync();

    if (!response.IsSuccessStatusCode)
    {
        return Results.Unauthorized();
    }

    return Results.Content(responseContent, "application/json");
});

app.Run();