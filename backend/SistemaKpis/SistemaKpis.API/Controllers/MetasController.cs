using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SistemaKpis.Core.Entidades.Catalogos;
using SistemaKpis.Core.Entidades.Configuracion;
using SistemaKpis.Infrastructure.Data;

namespace SistemaKpis.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class MetasController : ControllerBase
{
    private readonly KpisDbContext _context;
    private readonly ILogger<MetasController> _logger;
    private const int ROL_SUPERVISOR_ID = 1;
    private const int ROL_VENDEDOR_ID = 2;

    public MetasController(KpisDbContext context, ILogger<MetasController> logger)
    {
        _context = context;
        _logger = logger;
    }

    private async Task<Usuario?> ObtenerUsuarioAutenticado()
    {
        var keycloakId = User.FindFirst("sub")?.Value 
            ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(keycloakId) || !Guid.TryParse(keycloakId, out var keycloakGuid))
            return null;
        return await _context.Usuarios.Include(u => u.Rol).FirstOrDefaultAsync(u => u.KeycloakId == keycloakGuid && u.Activo);
    }

    private bool EsSupervisor(Usuario? u) => u?.RolId == ROL_SUPERVISOR_ID;

    [HttpGet("periodos")]
    public async Task<ActionResult<List<PeriodoDto>>> ObtenerPeriodos()
    {
        var usuario = await ObtenerUsuarioAutenticado();
        if (usuario == null) return Unauthorized();

        var periodos = await _context.Periodos
            .OrderByDescending(p => p.FechaInicio)
            .Select(p => new PeriodoDto(p.Id, p.Nombre, p.FechaInicio, p.FechaFin, p.Tipo))
            .ToListAsync();

        return Ok(periodos);
    }

    [HttpGet("periodo-actual")]
    public async Task<ActionResult<PeriodoDto>> ObtenerPeriodoActual()
    {
        var usuario = await ObtenerUsuarioAutenticado();
        if (usuario == null) return Unauthorized();

        var hoy = DateTime.UtcNow;
        var periodo = await _context.Periodos
            .Where(p => p.FechaInicio <= hoy && p.FechaFin >= hoy)
            .OrderByDescending(p => p.FechaInicio)
            .FirstOrDefaultAsync();

        if (periodo == null)
        {
            periodo = await _context.Periodos
                .OrderByDescending(p => p.FechaInicio)
                .FirstOrDefaultAsync();
        }

        if (periodo == null) return NotFound("No hay periodos disponibles");

        return Ok(new PeriodoDto(periodo.Id, periodo.Nombre, periodo.FechaInicio, periodo.FechaFin, periodo.Tipo));
    }

    [HttpGet]
    public async Task<ActionResult<List<MetaDto>>> ObtenerMetas([FromQuery] int? vendedorId)
    {
        var usuario = await ObtenerUsuarioAutenticado();
        if (usuario == null) return Unauthorized();

        var query = _context.Metas.Include(m => m.Usuario).Include(m => m.Periodo).AsQueryable();

        if (EsSupervisor(usuario))
        {
            if (vendedorId.HasValue) query = query.Where(m => m.UsuarioId == vendedorId.Value);
        }
        else
        {
            query = query.Where(m => m.UsuarioId == usuario.Id);
        }

        var metas = await query.OrderByDescending(m => m.Periodo.FechaInicio)
            .Select(m => new MetaDto(m.Id, m.UsuarioId, m.Usuario.NombreCompleto, m.PeriodoId, m.Periodo.Nombre, m.Periodo.FechaInicio, m.Periodo.FechaFin, m.MetaMonetaria, m.MetaCantidad))
            .ToListAsync();

        return Ok(metas);
    }

    [HttpPost]
    public async Task<ActionResult<MetaDto>> AsignarMeta(AsignarMetaRequest request)
    {
        var usuario = await ObtenerUsuarioAutenticado();
        if (usuario == null) return Unauthorized();
        if (!EsSupervisor(usuario)) return Forbid("Solo supervisores pueden asignar metas");

        if (request.UsuarioId <= 0) return BadRequest("Debe seleccionar un vendedor");
        if (request.MetaMonetaria <= 0) return BadRequest("La meta monetaria debe ser mayor a 0");
        if (request.MetaCantidad <= 0) return BadRequest("La meta en cantidad debe ser mayor a 0");

        var vendedor = await _context.Usuarios.FirstOrDefaultAsync(u => u.Id == request.UsuarioId && u.RolId == ROL_VENDEDOR_ID && u.Activo);
        if (vendedor == null) return BadRequest("Vendedor no encontrado");

        var periodo = await _context.Periodos.FindAsync(request.PeriodoId);
        if (periodo == null) return BadRequest("Periodo no encontrado");

        var existe = await _context.Metas.AnyAsync(m => m.UsuarioId == request.UsuarioId && m.PeriodoId == request.PeriodoId);
        if (existe) return BadRequest("Ya existe una meta para este vendedor en este periodo");

        var meta = new Meta
        {
            UsuarioId = request.UsuarioId,
            PeriodoId = request.PeriodoId,
            MetaMonetaria = request.MetaMonetaria,
            MetaCantidad = request.MetaCantidad
        };

        _context.Metas.Add(meta);
        await _context.SaveChangesAsync();

        var metaCreada = await _context.Metas.Include(m => m.Usuario).Include(m => m.Periodo).FirstAsync(m => m.Id == meta.Id);
        return CreatedAtAction(nameof(ObtenerMetas), new MetaDto(metaCreada.Id, metaCreada.UsuarioId, metaCreada.Usuario.NombreCompleto, metaCreada.PeriodoId, metaCreada.Periodo.Nombre, metaCreada.Periodo.FechaInicio, metaCreada.Periodo.FechaFin, metaCreada.MetaMonetaria, metaCreada.MetaCantidad));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<MetaDto>> ActualizarMeta(int id, ActualizarMetaRequest request)
    {
        var usuario = await ObtenerUsuarioAutenticado();
        if (usuario == null) return Unauthorized();
        if (!EsSupervisor(usuario)) return Forbid();

        var meta = await _context.Metas.Include(m => m.Usuario).Include(m => m.Periodo).FirstOrDefaultAsync(m => m.Id == id);
        if (meta == null) return NotFound();

        meta.MetaMonetaria = request.MetaMonetaria;
        meta.MetaCantidad = request.MetaCantidad;
        await _context.SaveChangesAsync();

        return Ok(new MetaDto(meta.Id, meta.UsuarioId, meta.Usuario.NombreCompleto, meta.PeriodoId, meta.Periodo.Nombre, meta.Periodo.FechaInicio, meta.Periodo.FechaFin, meta.MetaMonetaria, meta.MetaCantidad));
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> EliminarMeta(int id)
    {
        var usuario = await ObtenerUsuarioAutenticado();
        if (usuario == null) return Unauthorized();
        if (!EsSupervisor(usuario)) return Forbid();

        var meta = await _context.Metas.FindAsync(id);
        if (meta == null) return NotFound();

        _context.Metas.Remove(meta);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}

public record MetaDto(int Id, int UsuarioId, string NombreVendedor, int PeriodoId, string PeriodoNombre, DateTime FechaInicio, DateTime FechaFin, decimal MetaMonetaria, int MetaCantidad);
public record PeriodoDto(int Id, string Nombre, DateTime FechaInicio, DateTime FechaFin, string Tipo);
public record AsignarMetaRequest(int UsuarioId, int PeriodoId, decimal MetaMonetaria, int MetaCantidad);
public record ActualizarMetaRequest(decimal MetaMonetaria, int MetaCantidad);
