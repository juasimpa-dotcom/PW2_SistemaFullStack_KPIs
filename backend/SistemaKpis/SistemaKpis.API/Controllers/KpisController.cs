using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SistemaKpis.Application.Interfaces;

namespace SistemaKpis.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]  // ← Requiere autenticación (sin políticas)
public class KpisController : ControllerBase
{
    private readonly IKpiServicio _kpiServicio;
    private readonly ILogger<KpisController> _logger;

    public KpisController(
        IKpiServicio kpiServicio,
        ILogger<KpisController> logger)
    {
        _kpiServicio = kpiServicio;
        _logger = logger;
    }

    // GET: api/kpis/usuario/5?fechaInicio=2026-03-01&fechaFin=2026-03-31
    [HttpGet("usuario/{usuarioId}")]
    [Authorize]  // ← CAMBIAR: Quitar Policy = "VendedorPolicy"
    public async Task<ActionResult> ObtenerKpiGeneral(
        int usuarioId,
        [FromQuery] DateTime fechaInicio,
        [FromQuery] DateTime fechaFin)
    {
        try
        {
            var kpi = await _kpiServicio.ObtenerKpiGeneralAsync(usuarioId, fechaInicio, fechaFin);
            return Ok(kpi);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener KPI del usuario {UsuarioId}", usuarioId);
            return StatusCode(500, new { message = "Error al calcular KPIs", error = ex.Message });
        }
    }

    // GET: api/kpis/equipo
    [HttpGet("equipo")]
    [Authorize]  // ← CAMBIAR: Quitar Policy = "SupervisorPolicy"
    public async Task<ActionResult> ObtenerResumenEquipo(
        [FromQuery] DateTime fechaInicio,
        [FromQuery] DateTime fechaFin)
    {
        try
        {
            var resumen = await _kpiServicio.ObtenerResumenEquipoAsync(fechaInicio, fechaFin);
            return Ok(resumen);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener resumen del equipo");
            return StatusCode(500, new { message = "Error al calcular KPIs del equipo", error = ex.Message });
        }
    }

    // GET: api/kpis/servicios-mas-vendidos
    [HttpGet("servicios-mas-vendidos")]
    [Authorize]  // ← CAMBIAR: Quitar Policy = "SupervisorPolicy"
    public async Task<ActionResult> ObtenerServiciosMasVendidos(
        [FromQuery] DateTime fechaInicio,
        [FromQuery] DateTime fechaFin)
    {
        try
        {
            var servicios = await _kpiServicio.ObtenerServiciosMasVendidosAsync(fechaInicio, fechaFin);
            return Ok(servicios);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener servicios más vendidos");
            return StatusCode(500, new { message = "Error al obtener servicios", error = ex.Message });
        }
    }
}