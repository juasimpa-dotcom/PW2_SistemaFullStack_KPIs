using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SistemaKpis.Core.Entidades.Catalogos;
using SistemaKpis.Infrastructure.Data;
using System.Security.Claims;

namespace SistemaKpis.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SyncController : ControllerBase
{
    private readonly KpisDbContext _context;
    private readonly ILogger<SyncController> _logger;
    private const int ROL_SUPERVISOR_ID = 1;
    private const int ROL_VENDEDOR_ID = 2;

    public SyncController(KpisDbContext context, ILogger<SyncController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpPost("sync-user")]
    public async Task<ActionResult<UsuarioDto>> SincronizarUsuario()
    {
        var keycloakId = User.FindFirst("sub")?.Value 
            ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            
        if (string.IsNullOrEmpty(keycloakId))
        {
            _logger.LogError("No se encontró claim 'sub' en el token");
            return BadRequest("Keycloak ID no encontrado en el token");
        }
            
        Guid keycloakGuid;
        if (!Guid.TryParse(keycloakId, out keycloakGuid))
        {
            _logger.LogError("Keycloak ID no es un GUID válido: {KeycloakId}", keycloakId);
            return BadRequest("Keycloak ID inválido: " + keycloakId);
        }

        var usuario = await _context.Usuarios.Include(u => u.Rol).FirstOrDefaultAsync(u => u.KeycloakId == keycloakGuid);
        
        if (usuario == null)
        {
            var username = User.FindFirst("preferred_username")?.Value ?? User.FindFirst(ClaimTypes.Name)?.Value ?? "";
            var email = User.FindFirst("email")?.Value ?? $"{username}@keycloak.local";
            
            bool esSupervisor = User.IsInRole("supervisor") || User.IsInRole("realm_access_supervisor");
            
            if (!esSupervisor)
            {
                var realmRoles = User.FindFirst("realm_access")?.Value;
                if (!string.IsNullOrEmpty(realmRoles))
                {
                    try
                    {
                        using var jsonDoc = System.Text.Json.JsonDocument.Parse(realmRoles);
                        if (jsonDoc.RootElement.TryGetProperty("roles", out var roles))
                        {
                            esSupervisor = roles.EnumerateArray().Any(r => r.GetString() == "supervisor");
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "Error al parsear realm_access");
                    }
                }

                var resourceAccess = User.FindFirst("resource_access")?.Value;
                if (!string.IsNullOrEmpty(resourceAccess))
                {
                    try
                    {
                        using var jsonDoc = System.Text.Json.JsonDocument.Parse(resourceAccess);
                        if (jsonDoc.RootElement.TryGetProperty("api-kpis-client", out var clientRoles))
                        {
                            if (clientRoles.TryGetProperty("roles", out var roles))
                            {
                                esSupervisor = roles.EnumerateArray().Any(r => r.GetString() == "supervisor");
                            }
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "Error al parsear resource_access");
                    }
                }
            }
            
            _logger.LogInformation("Usuario {Username} - roles detectados: supervisor={EsSupervisor}", username, esSupervisor);

            var nombreCompleto = User.FindFirst("name")?.Value ?? User.FindFirst("given_name")?.Value ?? username;
            
            usuario = new Usuario
            {
                KeycloakId = keycloakGuid,
                RolId = esSupervisor ? ROL_SUPERVISOR_ID : ROL_VENDEDOR_ID,
                NombreCompleto = nombreCompleto,
                Correo = email,
                Activo = true,
                FechaCreacion = DateTime.UtcNow
            };

            _context.Usuarios.Add(usuario);
            await _context.SaveChangesAsync();
            
            usuario = await _context.Usuarios.Include(u => u.Rol).FirstAsync(u => u.Id == usuario.Id);
            _logger.LogInformation("Usuario sincronizado automáticamente: {Nombre} ({Rol})", usuario.NombreCompleto, usuario.Rol.Nombre);
        }

        return Ok(new UsuarioDto(usuario.Id, usuario.KeycloakId, usuario.NombreCompleto, usuario.Correo, usuario.Rol.Nombre, usuario.Activo, usuario.FechaCreacion));
    }

    [HttpGet("usuarios")]
    public async Task<ActionResult<List<UsuarioDto>>> ObtenerTodosLosUsuarios()
    {
        var usuarios = await _context.Usuarios.Include(u => u.Rol)
            .OrderBy(u => u.NombreCompleto)
            .Select(u => new UsuarioDto(u.Id, u.KeycloakId, u.NombreCompleto, u.Correo, u.Rol.Nombre, u.Activo, u.FechaCreacion))
            .ToListAsync();
        return Ok(usuarios);
    }
}

public record UsuarioDto(int Id, Guid KeycloakId, string NombreCompleto, string Correo, string Rol, bool Activo, DateTime FechaCreacion);
