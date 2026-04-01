using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SistemaKpis.Core.Entidades.Catalogos;
using SistemaKpis.Infrastructure.Data;

namespace SistemaKpis.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UsuariosController : ControllerBase
{
    private readonly KpisDbContext _context;
    private readonly ILogger<UsuariosController> _logger;
    private const int ROL_SUPERVISOR_ID = 1;
    private const int ROL_VENDEDOR_ID = 2;

    public UsuariosController(KpisDbContext context, ILogger<UsuariosController> logger)
    {
        _context = context;
        _logger = logger;
    }

    private async Task<Usuario?> ObtenerUsuarioAutenticado()
    {
        var keycloakId = User.FindFirst("sub")?.Value;
        if (string.IsNullOrEmpty(keycloakId) || !Guid.TryParse(keycloakId, out var keycloakGuid))
            return null;
        return await _context.Usuarios
            .Include(u => u.Rol)
            .FirstOrDefaultAsync(u => u.KeycloakId == keycloakGuid && u.Activo);
    }

    private bool EsSupervisor(Usuario? u) => u?.RolId == ROL_SUPERVISOR_ID;

    [HttpGet]
    public async Task<ActionResult<List<UsuarioDto>>> ObtenerVendedores([FromQuery] string? buscar, [FromQuery] bool soloActivos = true)
    {
        var usuario = await ObtenerUsuarioAutenticado();
        if (usuario == null) return Unauthorized();
        if (!EsSupervisor(usuario)) return Forbid();

        var query = _context.Usuarios.Include(u => u.Rol).Where(u => u.RolId == ROL_VENDEDOR_ID).AsQueryable();
        if (soloActivos) query = query.Where(u => u.Activo);
        if (!string.IsNullOrWhiteSpace(buscar)) query = query.Where(u => u.NombreCompleto.Contains(buscar) || u.Correo.Contains(buscar));

        var vendedores = await query.OrderBy(u => u.NombreCompleto)
            .Select(u => new UsuarioDto(u.Id, u.KeycloakId, u.NombreCompleto, u.Correo, u.Rol.Nombre, u.Activo, u.FechaCreacion))
            .ToListAsync();
        return Ok(vendedores);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<UsuarioDto>> ObtenerVendedor(int id)
    {
        var usuario = await ObtenerUsuarioAutenticado();
        if (usuario == null) return Unauthorized();
        if (!EsSupervisor(usuario)) return Forbid();

        var vendedor = await _context.Usuarios.Include(u => u.Rol).FirstOrDefaultAsync(u => u.Id == id && u.RolId == ROL_VENDEDOR_ID);
        if (vendedor == null) return NotFound("Vendedor no encontrado");

        return Ok(new UsuarioDto(vendedor.Id, vendedor.KeycloakId, vendedor.NombreCompleto, vendedor.Correo, vendedor.Rol.Nombre, vendedor.Activo, vendedor.FechaCreacion));
    }

    [HttpPost]
    public async Task<ActionResult<UsuarioDto>> CrearVendedor(CrearVendedorRequest request)
    {
        var usuario = await ObtenerUsuarioAutenticado();
        if (usuario == null) return Unauthorized();
        if (!EsSupervisor(usuario)) return Forbid();

        var existe = await _context.Usuarios.AnyAsync(u => u.Correo == request.Correo || u.KeycloakId == request.KeycloakId);
        if (existe) return BadRequest("Ya existe un usuario con este correo o KeycloakId");

        var vendedor = new Usuario { KeycloakId = request.KeycloakId, RolId = ROL_VENDEDOR_ID, NombreCompleto = request.NombreCompleto, Correo = request.Correo, Activo = true };
        _context.Usuarios.Add(vendedor);
        await _context.SaveChangesAsync();

        var vendedorCreado = await _context.Usuarios.Include(u => u.Rol).FirstAsync(u => u.Id == vendedor.Id);
        return CreatedAtAction(nameof(ObtenerVendedor), new { id = vendedor.Id },
            new UsuarioDto(vendedorCreado.Id, vendedorCreado.KeycloakId, vendedorCreado.NombreCompleto, vendedorCreado.Correo, vendedorCreado.Rol.Nombre, vendedorCreado.Activo, vendedorCreado.FechaCreacion));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<UsuarioDto>> ActualizarVendedor(int id, ActualizarVendedorRequest request)
    {
        var usuario = await ObtenerUsuarioAutenticado();
        if (usuario == null) return Unauthorized();
        if (!EsSupervisor(usuario)) return Forbid();

        var vendedor = await _context.Usuarios.FirstOrDefaultAsync(u => u.Id == id && u.RolId == ROL_VENDEDOR_ID);
        if (vendedor == null) return NotFound("Vendedor no encontrado");

        vendedor.NombreCompleto = request.NombreCompleto;
        vendedor.Correo = request.Correo;
        vendedor.Activo = request.Activo;
        await _context.SaveChangesAsync();

        var actualizado = await _context.Usuarios.Include(u => u.Rol).FirstAsync(u => u.Id == id);
        return Ok(new UsuarioDto(actualizado.Id, actualizado.KeycloakId, actualizado.NombreCompleto, actualizado.Correo, actualizado.Rol.Nombre, actualizado.Activo, actualizado.FechaCreacion));
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> EliminarVendedor(int id)
    {
        var usuario = await ObtenerUsuarioAutenticado();
        if (usuario == null) return Unauthorized();
        if (!EsSupervisor(usuario)) return Forbid();

        var vendedor = await _context.Usuarios.FirstOrDefaultAsync(u => u.Id == id && u.RolId == ROL_VENDEDOR_ID);
        if (vendedor == null) return NotFound("Vendedor no encontrado");

        vendedor.Activo = false;
        await _context.SaveChangesAsync();
        return NoContent();
    }
}

public record UsuarioDto(int Id, Guid KeycloakId, string NombreCompleto, string Correo, string Rol, bool Activo, DateTime FechaCreacion);
public record CrearVendedorRequest(Guid KeycloakId, string NombreCompleto, string Correo);
public record ActualizarVendedorRequest(string NombreCompleto, string Correo, bool Activo);
