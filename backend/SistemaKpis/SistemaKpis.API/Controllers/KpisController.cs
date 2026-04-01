using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SistemaKpis.Core.Entidades.Catalogos;
using SistemaKpis.Infrastructure.Data;

namespace SistemaKpis.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class KpisController : ControllerBase
{
    private readonly KpisDbContext _context;
    private readonly ILogger<KpisController> _logger;
    private const int ROL_SUPERVISOR_ID = 1;
    private const int ROL_VENDEDOR_ID = 2;

    public KpisController(KpisDbContext context, ILogger<KpisController> logger)
    {
        _context = context;
        _logger = logger;
    }

    private async Task<Usuario?> ObtenerUsuarioAutenticado()
    {
        var keycloakId = User.FindFirst("sub")?.Value;
        if (string.IsNullOrEmpty(keycloakId) || !Guid.TryParse(keycloakId, out var keycloakGuid))
            return null;
        return await _context.Usuarios.Include(u => u.Rol).FirstOrDefaultAsync(u => u.KeycloakId == keycloakGuid && u.Activo);
    }

    private bool EsSupervisor(Usuario? u) => u?.RolId == ROL_SUPERVISOR_ID;

    // KPIs DEL VENDEDOR
    [HttpGet("vendedor")]
    public async Task<ActionResult<KpisVendedorDto>> ObtenerKpisVendedor([FromQuery] DateTime fechaInicio, [FromQuery] DateTime fechaFin)
    {
        var usuario = await ObtenerUsuarioAutenticado();
        if (usuario == null) return Unauthorized();
        if (!EsSupervisor(usuario)) return Forbid();

        var ventas = await _context.Ventas.Where(v => v.UsuarioId == usuario.Id && v.FechaVenta >= fechaInicio && v.FechaVenta <= fechaFin).ToListAsync();

        var meta = await _context.Metas.Include(m => m.Periodo).Where(m => m.UsuarioId == usuario.Id && m.Periodo.FechaInicio <= fechaFin && m.Periodo.FechaFin >= fechaInicio).FirstOrDefaultAsync();

        decimal ingresoTotal = ventas.Sum(v => v.MontoTotal);
        int cantidadVentas = ventas.Count;
        int cantidadServicios = ventas.Sum(v => v.CantidadServicios);
        decimal ticketPromedio = cantidadVentas > 0 ? ingresoTotal / cantidadVentas : 0;

        decimal metaMonetaria = meta?.MetaMonetaria ?? 1;
        int metaCantidad = meta?.MetaCantidad ?? 1;

        double porcentajeCumplimiento = metaMonetaria > 0 ? (double)(ingresoTotal / metaMonetaria) * 100 : 0;
        double porcentajeUnidades = metaCantidad > 0 ? (double)(cantidadServicios / metaCantidad) * 100 : 0;

        int diasTotales = (int)(fechaFin - fechaInicio).TotalDays + 1;
        int diasTranscurridos = Math.Min((int)(DateTime.UtcNow - fechaInicio).TotalDays + 1, diasTotales);
        diasTranscurridos = Math.Max(1, diasTranscurridos);

        double ritmoAvance = diasTotales > 0 ? porcentajeCumplimiento / diasTranscurridos : 0;
        double proyeccionCierre = diasTranscurridos > 0 ? (double)ingresoTotal / diasTranscurridos * diasTotales : 0;

        return Ok(new KpisVendedorDto(
            ingresoTotal, cantidadVentas, cantidadServicios, ticketPromedio,
            porcentajeCumplimiento, porcentajeUnidades, metaMonetaria, metaCantidad,
            ritmoAvance, proyeccionCierre, diasTotales, diasTranscurridos
        ));
    }

    [HttpGet("vendedor/{vendedorId}")]
    public async Task<ActionResult<KpisVendedorDto>> ObtenerKpisVendedorPorId(int vendedorId, [FromQuery] DateTime fechaInicio, [FromQuery] DateTime fechaFin)
    {
        var usuario = await ObtenerUsuarioAutenticado();
        if (usuario == null) return Unauthorized();
        if (!EsSupervisor(usuario)) return Forbid();

        var ventas = await _context.Ventas.Where(v => v.UsuarioId == vendedorId && v.FechaVenta >= fechaInicio && v.FechaVenta <= fechaFin).ToListAsync();
        var vendedor = await _context.Usuarios.FindAsync(vendedorId);
        if (vendedor == null) return NotFound();

        var meta = await _context.Metas.Include(m => m.Periodo).Where(m => m.UsuarioId == vendedorId && m.Periodo.FechaInicio <= fechaFin && m.Periodo.FechaFin >= fechaInicio).FirstOrDefaultAsync();

        decimal ingresoTotal = ventas.Sum(v => v.MontoTotal);
        int cantidadVentas = ventas.Count;
        int cantidadServicios = ventas.Sum(v => v.CantidadServicios);
        decimal ticketPromedio = cantidadVentas > 0 ? ingresoTotal / cantidadVentas : 0;

        decimal metaMonetaria = meta?.MetaMonetaria ?? 1;
        int metaCantidad = meta?.MetaCantidad ?? 1;

        double porcentajeCumplimiento = metaMonetaria > 0 ? (double)(ingresoTotal / metaMonetaria) * 100 : 0;
        double porcentajeUnidades = metaCantidad > 0 ? (double)(cantidadServicios / metaCantidad) * 100 : 0;

        int diasTotales = (int)(fechaFin - fechaInicio).TotalDays + 1;
        int diasTranscurridos = Math.Min((int)(DateTime.UtcNow - fechaInicio).TotalDays + 1, diasTotales);
        diasTranscurridos = Math.Max(1, diasTranscurridos);

        double ritmoAvance = diasTotales > 0 ? porcentajeCumplimiento / diasTranscurridos : 0;
        double proyeccionCierre = diasTranscurridos > 0 ? (double)ingresoTotal / diasTranscurridos * diasTotales : 0;

        return Ok(new KpisVendedorDto(
            ingresoTotal, cantidadVentas, cantidadServicios, ticketPromedio,
            porcentajeCumplimiento, porcentajeUnidades, metaMonetaria, metaCantidad,
            ritmoAvance, proyeccionCierre, diasTotales, diasTranscurridos
        ));
    }

    // KPIs DEL SUPERVISOR - Ranking de equipo
    [HttpGet("ranking-equipo")]
    public async Task<ActionResult<List<RankingVendedorDto>>> ObtenerRankingEquipo([FromQuery] DateTime fechaInicio, [FromQuery] DateTime fechaFin)
    {
        var usuario = await ObtenerUsuarioAutenticado();
        if (usuario == null) return Unauthorized();
        if (!EsSupervisor(usuario)) return Forbid();

        var vendedores = await _context.Usuarios.Where(u => u.RolId == ROL_VENDEDOR_ID && u.Activo).ToListAsync();
        var ranking = new List<RankingVendedorDto>();

        foreach (var vendedor in vendedores)
        {
            var ventas = await _context.Ventas.Where(v => v.UsuarioId == vendedor.Id && v.FechaVenta >= fechaInicio && v.FechaVenta <= fechaFin).ToListAsync();
            var meta = await _context.Metas.Where(m => m.UsuarioId == vendedor.Id && m.Periodo.FechaInicio <= fechaFin && m.Periodo.FechaFin >= fechaInicio).FirstOrDefaultAsync();

            decimal ingresoTotal = ventas.Sum(v => v.MontoTotal);
            decimal metaMonetaria = meta?.MetaMonetaria ?? 1;
            double porcentajeAvance = metaMonetaria > 0 ? (double)(ingresoTotal / metaMonetaria) * 100 : 0;

            ranking.Add(new RankingVendedorDto(vendedor.Id, vendedor.NombreCompleto, ingresoTotal, metaMonetaria, porcentajeAvance, ventas.Count));
        }

        return Ok(ranking.OrderByDescending(r => r.PorcentajeAvance).ToList());
    }

    // KPIs - Servicio más vendido
    [HttpGet("servicios-mas-vendidos")]
    public async Task<ActionResult<List<ServicioVendidoDto>>> ObtenerServiciosMasVendidos([FromQuery] DateTime fechaInicio, [FromQuery] DateTime fechaFin, [FromQuery] int? vendedorId)
    {
        var usuario = await ObtenerUsuarioAutenticado();
        if (usuario == null) return Unauthorized();
        if (!EsSupervisor(usuario)) return Forbid();

        var query = _context.DetallesVenta.Include(d => d.Servicio).Include(d => d.Venta)
            .Where(d => d.Venta.FechaVenta >= fechaInicio && d.Venta.FechaVenta <= fechaFin && d.Venta.Estado == "completada")
            .AsQueryable();

        if (vendedorId.HasValue) query = query.Where(d => d.Venta.UsuarioId == vendedorId.Value);

        var servicios = await query.GroupBy(d => new { d.ServicioId, d.Servicio.Nombre })
            .Select(g => new ServicioVendidoDto(g.Key.Nombre, g.Sum(d => d.Cantidad), g.Sum(d => d.Subtotal)))
            .OrderByDescending(s => s.CantidadVendida)
            .Take(10)
            .ToListAsync();

        return Ok(servicios);
    }

    // KPIs - Vendedores en riesgo (< 50% de avance)
    [HttpGet("vendedores-en-riesgo")]
    public async Task<ActionResult<List<RankingVendedorDto>>> ObtenerVendedoresEnRiesgo([FromQuery] DateTime fechaInicio, [FromQuery] DateTime fechaFin)
    {
        var usuario = await ObtenerUsuarioAutenticado();
        if (usuario == null) return Unauthorized();
        if (!EsSupervisor(usuario)) return Forbid();

        var ranking = await ObtenerRankingEquipo(fechaInicio, fechaFin);
        if (ranking.Result is not OkObjectResult ok) return ranking.Result!;

        var rankingList = (List<RankingVendedorDto>)ok.Value!;
        return Ok(rankingList.Where(r => r.PorcentajeAvance < 50).OrderBy(r => r.PorcentajeAvance).ToList());
    }

    // KPIs - Resumen general del equipo
    [HttpGet("resumen-equipo")]
    public async Task<ActionResult<ResumenEquipoDto>> ObtenerResumenEquipo([FromQuery] DateTime fechaInicio, [FromQuery] DateTime fechaFin)
    {
        var usuario = await ObtenerUsuarioAutenticado();
        if (usuario == null) return Unauthorized();
        if (!EsSupervisor(usuario)) return Forbid();

        var ventas = await _context.Ventas.Include(v => v.Vendedor).Where(v => v.FechaVenta >= fechaInicio && v.FechaVenta <= fechaFin && v.Estado == "completada").ToListAsync();
        var vendedores = await _context.Usuarios.Where(u => u.RolId == ROL_VENDEDOR_ID && u.Activo).CountAsync();

        decimal ingresoTotal = ventas.Sum(v => v.MontoTotal);
        int cantidadVentas = ventas.Count;
        int cantidadServicios = ventas.Sum(v => v.CantidadServicios);
        decimal ticketPromedio = cantidadVentas > 0 ? ingresoTotal / cantidadVentas : 0;

        var ranking = await ObtenerRankingEquipo(fechaInicio, fechaFin);
        var rankingList = ranking.Result is OkObjectResult okR ? (List<RankingVendedorDto>)okR.Value! : new List<RankingVendedorDto>();
        decimal metaTotal = rankingList.Sum(r => r.MetaMonetaria);
        double promedioAvance = rankingList.Count > 0 ? rankingList.Average(r => r.PorcentajeAvance) : 0;

        return Ok(new ResumenEquipoDto(ingresoTotal, cantidadVentas, cantidadServicios, ticketPromedio, vendedores, metaTotal, promedioAvance));
    }

    // EXPORTAR REPORTE
    [HttpGet("exportar")]
    public async Task<FileResult> ExportarReporte([FromQuery] DateTime fechaInicio, [FromQuery] DateTime fechaFin, [FromQuery] int? vendedorId)
    {
        var usuario = await ObtenerUsuarioAutenticado();
        if (usuario == null) return null!;
        if (!EsSupervisor(usuario)) return null!;

        var vendedorNombre = "Todos";
        var query = _context.Ventas.Include(v => v.Vendedor).Where(v => v.FechaVenta >= fechaInicio && v.FechaVenta <= fechaFin && v.Estado == "completada").AsQueryable();

        if (vendedorId.HasValue)
        {
            query = query.Where(v => v.UsuarioId == vendedorId.Value);
            vendedorNombre = _context.Usuarios.Find(vendedorId.Value)?.NombreCompleto ?? "Vendedor";
        }

        var ventas = await query.OrderBy(v => v.FechaVenta).ToListAsync();

        var csv = new System.Text.StringBuilder();
        csv.AppendLine("Reporte de Ventas");
        csv.AppendLine($"Generado:{DateTime.Now:yyyy-MM-dd HH:mm}");
        csv.AppendLine($"Periodo: {fechaInicio:yyyy-MM-dd} al {fechaFin:yyyy-MM-dd}");
        csv.AppendLine($"Vendedor: {vendedorNombre}");
        csv.AppendLine("");
        csv.AppendLine("ID,Vendedor,Fecha,Monto,Unidades,Estado");

        foreach (var v in ventas)
        {
            csv.AppendLine($"{v.Id},{v.Vendedor.NombreCompleto},{v.FechaVenta:yyyy-MM-dd},{v.MontoTotal},{v.CantidadServicios},{v.Estado}");
        }

        csv.AppendLine("");
        csv.AppendLine($"TOTAL,,,,{ventas.Sum(v => v.MontoTotal)},{ventas.Sum(v => v.CantidadServicios)}");

        var bytes = System.Text.Encoding.UTF8.GetBytes(csv.ToString());
        return File(bytes, "text/csv", $"reporte_ventas_{vendedorNombre.Replace(" ", "_")}_{DateTime.Now:yyyyMMdd}.csv");
    }
}

// DTOs
public record KpisVendedorDto(
    decimal IngresoTotal, int CantidadVentas, int CantidadServicios, decimal TicketPromedio,
    double PorcentajeCumplimiento, double PorcentajeUnidades, decimal MetaMonetaria, int MetaCantidad,
    double RitmoAvance, double ProyeccionCierre, int DiasTotales, int DiasTranscurridos);

public record RankingVendedorDto(int VendedorId, string NombreVendedor, decimal IngresoTotal, decimal MetaMonetaria, double PorcentajeAvance, int CantidadVentas);

public record ServicioVendidoDto(string NombreServicio, int CantidadVendida, decimal TotalVendido);

public record ResumenEquipoDto(decimal IngresoTotal, int CantidadVentas, int CantidadServicios, decimal TicketPromedio, int TotalVendedores, decimal MetaTotal, double PromedioAvance);
