using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SistemaKpis.Core.Entidades.Catalogos;
using SistemaKpis.Core.Entidades.Transacciones;
using SistemaKpis.Infrastructure.Data;

namespace SistemaKpis.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class VentasController : ControllerBase
{
    private readonly KpisDbContext _context;
    private readonly ILogger<VentasController> _logger;

    private const int ROL_SUPERVISOR_ID = 1;
    private const int ROL_VENDEDOR_ID = 2;

    public VentasController(KpisDbContext context, ILogger<VentasController> logger)
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

        return await _context.Usuarios
            .Include(u => u.Rol)
            .FirstOrDefaultAsync(u => u.KeycloakId == keycloakGuid && u.Activo);
    }

    private bool EsSupervisor(Usuario u) => u.RolId == ROL_SUPERVISOR_ID;
    private bool EsVendedor(Usuario u) => u.RolId == ROL_VENDEDOR_ID;

    [HttpPost]
    public async Task<ActionResult<VentaFrontDto>> RegistrarVenta(RegistrarVentaRequest request)
    {
        var usuario = await ObtenerUsuarioAutenticado();
        if (usuario == null) return Unauthorized("Usuario no encontrado");
        if (!EsVendedor(usuario))
            return Forbid("Solo los vendedores pueden registrar ventas");

        if (request.MontoTotal <= 0)
            return BadRequest("El monto total debe ser mayor a 0");

        int clienteId = 1;
        
        if (!string.IsNullOrWhiteSpace(request.NombreCliente))
        {
            var clienteExistente = await _context.Clientes.FirstOrDefaultAsync(c => c.NombreCompleto == request.NombreCliente);
            if (clienteExistente != null)
            {
                clienteId = clienteExistente.Id;
            }
            else
            {
                var nuevoCliente = new Cliente { NombreCompleto = request.NombreCliente, Activo = true };
                _context.Clientes.Add(nuevoCliente);
                await _context.SaveChangesAsync();
                clienteId = nuevoCliente.Id;
            }
        }

        var venta = new Venta
        {
            UsuarioId = usuario.Id,
            ClienteId = clienteId,
            FechaVenta = request.FechaVenta ?? DateTime.UtcNow,
            MontoTotal = request.MontoTotal,
            CantidadServicios = request.CantidadServicios ?? 1,
            Estado = "completada"
        };

        _context.Ventas.Add(venta);
        await _context.SaveChangesAsync();

        if (request.ServicioId > 0)
        {
            var servicio = await _context.Servicios.FindAsync(request.ServicioId);
            if (servicio != null)
            {
                var detalle = new DetalleVenta
                {
                    VentaId = venta.Id,
                    ServicioId = request.ServicioId,
                    Cantidad = request.CantidadServicios ?? 1,
                    PrecioUnitario = servicio.PrecioActual,
                    Subtotal = request.MontoTotal
                };
                _context.DetallesVenta.Add(detalle);
                await _context.SaveChangesAsync();
            }
        }

        var cliente = await _context.Clientes.FindAsync(clienteId);
        return Ok(new VentaFrontDto(
            venta.Id,
            cliente?.NombreCompleto ?? "Sin cliente",
            venta.MontoTotal,
            venta.CantidadServicios,
            venta.FechaVenta,
            venta.Estado
        ));
    }

    [HttpGet("mis-ventas")]
    public async Task<ActionResult<List<VentaFrontDto>>> ObtenerMisVentas(
        [FromQuery] DateTime? fechaInicio, [FromQuery] DateTime? fechaFin)
    {
        var usuario = await ObtenerUsuarioAutenticado();
        if (usuario == null) return Unauthorized("Usuario no encontrado");

        var query = _context.Ventas
            .Where(v => v.UsuarioId == usuario.Id)
            .Include(v => v.Cliente)
            .AsQueryable();

        if (fechaInicio.HasValue) query = query.Where(v => v.FechaVenta >= fechaInicio.Value);
        if (fechaFin.HasValue) query = query.Where(v => v.FechaVenta <= fechaFin.Value);

        var ventas = await query
            .OrderByDescending(v => v.FechaVenta)
            .Select(v => new VentaFrontDto(
                v.Id,
                v.Cliente != null ? v.Cliente.NombreCompleto : "Sin cliente",
                v.MontoTotal,
                v.CantidadServicios,
                v.FechaVenta,
                v.Estado
            ))
            .ToListAsync();

        return Ok(ventas);
    }

    [HttpGet("equipo")]
    public async Task<ActionResult<VentasEquipoDto>> ObtenerVentasEquipo(
        [FromQuery] int? vendedorId,
        [FromQuery] DateTime? fechaInicio, [FromQuery] DateTime? fechaFin)
    {
        var usuario = await ObtenerUsuarioAutenticado();
        if (usuario == null) return Unauthorized("Usuario no encontrado");
        if (!EsSupervisor(usuario))
            return Forbid("Solo los supervisores pueden ver ventas del equipo");

        var query = _context.Ventas.Include(v => v.Vendedor).AsQueryable();

        if (vendedorId.HasValue) query = query.Where(v => v.UsuarioId == vendedorId.Value);
        if (fechaInicio.HasValue) query = query.Where(v => v.FechaVenta >= fechaInicio.Value);
        if (fechaFin.HasValue) query = query.Where(v => v.FechaVenta <= fechaFin.Value);

        var resumen = await query
            .GroupBy(v => v.UsuarioId)
            .Select(g => new
            {
                VendedorId = g.Key,
                VendedorNombre = g.First().Vendedor.NombreCompleto,
                TotalVentas = g.Sum(v => v.MontoTotal),
                TotalUnidades = g.Sum(v => v.CantidadServicios),
                CantidadVentas = g.Count()
            })
            .ToListAsync();

        var resumenObjects = resumen.Select(r => (object)r).ToList();

        return Ok(new VentasEquipoDto(
            resumenObjects,
            resumen.Sum(r => r.TotalVentas),
            new { Inicio = fechaInicio, Fin = fechaFin }
        ));
    }

    [HttpGet("mi-perfil")]
    public async Task<ActionResult<UsuarioPerfilDto>> ObtenerMiPerfil()
    {
        var usuario = await ObtenerUsuarioAutenticado();
        if (usuario == null) return Unauthorized("Usuario no encontrado");

        return Ok(new UsuarioPerfilDto(
            usuario.Id,
            usuario.NombreCompleto,
            usuario.Correo,
            usuario.Rol.Nombre,
            EsSupervisor(usuario)
        ));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Venta>> ObtenerVenta(int id)
    {
        var usuario = await ObtenerUsuarioAutenticado();
        if (usuario == null) return Unauthorized("Usuario no encontrado");

        var venta = await _context.Ventas
            .Include(v => v.Vendedor)
            .Include(v => v.Cliente)
            .Include(v => v.Detalles).ThenInclude(d => d.Servicio)
            .FirstOrDefaultAsync(v => v.Id == id);

        if (venta == null) return NotFound("Venta no encontrada");

        if (EsVendedor(usuario) && venta.UsuarioId != usuario.Id)
            return Forbid("No tienes permiso para ver esta venta");

        return venta;
    }
}

public record RegistrarVentaRequest(
    string? NombreCliente,
    int ClienteId,
    decimal MontoTotal,
    int? CantidadServicios,
    DateTime? FechaVenta,
    int ServicioId = 0);

public record VentaFrontDto(
    int Id,
    string Cliente,
    decimal Monto,
    int Unidades,
    DateTime Fecha,
    string Estado);

public record VentasEquipoDto(
    List<object> Resumen,
    decimal TotalGeneral,
    object Periodo);

public record UsuarioPerfilDto(
    int Id,
    string Nombre,
    string Email,
    string Rol,
    bool EsSupervisor);