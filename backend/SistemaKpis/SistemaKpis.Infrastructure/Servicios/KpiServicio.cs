using Microsoft.EntityFrameworkCore;
using SistemaKpis.Application.DTOs.KPIs;
using SistemaKpis.Application.Interfaces;
using SistemaKpis.Core.Entidades.Catalogos;
using SistemaKpis.Core.Entidades.Configuracion;
using SistemaKpis.Core.Entidades.Transacciones;
using SistemaKpis.Infrastructure.Data;

namespace SistemaKpis.Infrastructure.Servicios;

public class KpiServicio : IKpiServicio
{
    private readonly KpisDbContext _context;

    public KpiServicio(KpisDbContext context)
    {
        _context = context;
    }

    public async Task<KpiGeneralDto> ObtenerKpiGeneralAsync(int usuarioId, DateTime fechaInicio, DateTime fechaFin)
    {
        var ventas = await _context.Ventas
            .Include(v => v.Detalles)
            .Where(v => v.UsuarioId == usuarioId &&
                       v.FechaVenta >= fechaInicio &&
                       v.FechaVenta <= fechaFin &&
                       v.Estado == "completada")
            .ToListAsync();

        var ventasCount = ventas.Count;
        var ingresosTotales = ventas.Sum(v => v.MontoTotal);
        var ticketPromedio = ventasCount > 0 ? ingresosTotales / ventasCount : 0;

        var cumplimientoMeta = await CalcularCumplimientoMetaAsync(usuarioId, fechaInicio, fechaFin);

        var diasTranscurridos = (DateTime.Today - fechaInicio).Days + 1;
        var diasTotales = (fechaFin - fechaInicio).Days + 1;
        var ritmoEsperado = (decimal)diasTranscurridos / diasTotales * 100;
        var ritmoAvance = cumplimientoMeta - ritmoEsperado;

        var proyeccionCierre = ventasCount > 0
            ? (ingresosTotales / diasTranscurridos) * diasTotales
            : 0;

        var mejorRacha = await CalcularMejorRachaAsync(usuarioId, fechaInicio, fechaFin);
        var variacionPeriodoAnterior = await CalcularVariacionPeriodoAnteriorAsync(usuarioId, fechaInicio, fechaFin);

        var usuario = await _context.Usuarios.FindAsync(usuarioId);

        return new KpiGeneralDto
        {
            UsuarioId = usuarioId,
            NombreVendedor = usuario?.NombreCompleto ?? "",
            CumplimientoMeta = cumplimientoMeta,
            VentasPeriodo = ventasCount,
            TicketPromedio = ticketPromedio,
            IngresosTotales = ingresosTotales,
            RitmoAvance = ritmoAvance,
            ProyeccionCierre = proyeccionCierre,
            MejorRacha = mejorRacha,
            VariacionPeriodoAnterior = variacionPeriodoAnterior
        };
    }

    public async Task<decimal> CalcularCumplimientoMetaAsync(int usuarioId, DateTime fechaInicio, DateTime fechaFin)
    {
        var meta = await _context.Metas
            .Include(m => m.Periodo)
            .FirstOrDefaultAsync(m => m.UsuarioId == usuarioId &&
                                     m.Periodo.FechaInicio <= fechaFin &&
                                     m.Periodo.FechaFin >= fechaInicio);

        if (meta == null || meta.MetaMonetaria == 0)
            return 0;

        var ventasTotales = await _context.Ventas
            .Where(v => v.UsuarioId == usuarioId &&
                       v.FechaVenta >= fechaInicio &&
                       v.FechaVenta <= fechaFin &&
                       v.Estado == "completada")
            .SumAsync(v => v.MontoTotal);

        return (ventasTotales / meta.MetaMonetaria) * 100;
    }

    public async Task<int> CalcularMejorRachaAsync(int usuarioId, DateTime fechaInicio, DateTime fechaFin)
    {
        var ventas = await _context.Ventas
            .Where(v => v.UsuarioId == usuarioId &&
                       v.FechaVenta >= fechaInicio &&
                       v.FechaVenta <= fechaFin &&
                       v.Estado == "completada")
            .OrderBy(v => v.FechaVenta)
            .Select(v => v.FechaVenta.Date)
            .Distinct()
            .ToListAsync();

        if (!ventas.Any())
            return 0;

        int rachaActual = 1;
        int rachaMaxima = 1;

        for (int i = 1; i < ventas.Count; i++)
        {
            var diasDiferencia = (ventas[i] - ventas[i - 1]).Days;
            if (diasDiferencia == 1)
            {
                rachaActual++;
                rachaMaxima = Math.Max(rachaMaxima, rachaActual);
            }
            else
            {
                rachaActual = 1;
            }
        }

        return rachaMaxima;
    }

    public async Task<ResumenEquipoDto> ObtenerResumenEquipoAsync(DateTime fechaInicio, DateTime fechaFin)
    {
        var usuarios = await _context.Usuarios
            .Include(u => u.Rol)
            .Where(u => u.Rol.Nombre == "vendedor" && u.Activo)
            .ToListAsync();

        var ranking = new List<RankingEquipoDto>();

        foreach (var usuario in usuarios)
        {
            var cumplimiento = await CalcularCumplimientoMetaAsync(usuario.Id, fechaInicio, fechaFin);

            var ventas = await _context.Ventas
                .Where(v => v.UsuarioId == usuario.Id &&
                           v.FechaVenta >= fechaInicio &&
                           v.FechaVenta <= fechaFin &&
                           v.Estado == "completada")
                .ToListAsync();

            ranking.Add(new RankingEquipoDto
            {
                UsuarioId = usuario.Id,
                NombreVendedor = usuario.NombreCompleto,
                CumplimientoMeta = cumplimiento,
                IngresosTotales = ventas.Sum(v => v.MontoTotal),
                VentasPeriodo = ventas.Count
            });
        }

        ranking = ranking.OrderByDescending(r => r.CumplimientoMeta).ToList();

        for (int i = 0; i < ranking.Count; i++)
        {
            ranking[i].Posicion = i + 1;
        }

        var vendedoresEnRiesgo = ranking.Count(r => r.CumplimientoMeta < 50);

        return new ResumenEquipoDto
        {
            CumplimientoPromedio = ranking.Any() ? ranking.Average(r => r.CumplimientoMeta) : 0,
            TotalVendedores = usuarios.Count,
            VendedoresEnRiesgo = vendedoresEnRiesgo,
            IngresosTotalesEquipo = ranking.Sum(r => r.IngresosTotales),
            Ranking = ranking
        };
    }

    public async Task<List<ServicioMasVendidoDto>> ObtenerServiciosMasVendidosAsync(DateTime fechaInicio, DateTime fechaFin)
    {
        var serviciosMasVendidos = await _context.DetallesVenta
            .Include(d => d.Servicio)
            .Join(_context.Ventas,
                  d => d.VentaId,
                  v => v.Id,
                  (d, v) => new { d, v })
            .Where(x => x.v.FechaVenta >= fechaInicio &&
                       x.v.FechaVenta <= fechaFin &&
                       x.v.Estado == "completada")
            .GroupBy(x => x.d.ServicioId)
            .Select(g => new ServicioMasVendidoDto
            {
                ServicioId = g.Key,
                NombreServicio = g.First().d.Servicio != null ? g.First().d.Servicio.Nombre : "",
                CantidadVendida = g.Sum(x => x.d.Cantidad),
                IngresosGenerados = g.Sum(x => x.d.Subtotal)
            })
            .OrderByDescending(s => s.CantidadVendida)
            .Take(10)
            .ToListAsync();

        return serviciosMasVendidos;
    }

    private async Task<decimal> CalcularVariacionPeriodoAnteriorAsync(int usuarioId, DateTime fechaInicio, DateTime fechaFin)
    {
        var diasPeriodo = (fechaFin - fechaInicio).Days + 1;
        var fechaInicioAnterior = fechaInicio.AddDays(-diasPeriodo);
        var fechaFinAnterior = fechaInicio.AddDays(-1);

        var ventasActuales = await _context.Ventas
            .Where(v => v.UsuarioId == usuarioId &&
                       v.FechaVenta >= fechaInicio &&
                       v.FechaVenta <= fechaFin &&
                       v.Estado == "completada")
            .SumAsync(v => v.MontoTotal);

        var ventasAnteriores = await _context.Ventas
            .Where(v => v.UsuarioId == usuarioId &&
                       v.FechaVenta >= fechaInicioAnterior &&
                       v.FechaVenta <= fechaFinAnterior &&
                       v.Estado == "completada")
            .SumAsync(v => v.MontoTotal);

        if (ventasAnteriores == 0)
            return ventasActuales > 0 ? 100 : 0;

        return ((ventasActuales - ventasAnteriores) / ventasAnteriores) * 100;
    }
}