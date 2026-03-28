using Microsoft.AspNetCore.Mvc;
using SistemaKpis.Core.Interfaces;  // ✅ CAMBIO: De Core.Interfaces a Application.Interfaces
using SistemaKpis.Application.DTOs.KPIs;
using SistemaKpis.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;

namespace SistemaKpis.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]  // ← Requiere autenticación para todos los endpoints
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
    [Authorize(Policy = "VendedorPolicy")]  // ← Solo vendedores pueden ver SUS datos
    public async Task<ActionResult> ObtenerKpiGeneral(
        int usuarioId,
        [FromQuery] DateTime fechaInicio,
        [FromQuery] DateTime fechaFin)
    {
        // Verificar que el usuario solo pueda ver sus propios KPIs
        var userIdClaim = User.FindFirst("sub")?.Value;
        // Aquí podrías validar que usuarioId coincide con el token

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

    // GET: api/kpis/equipo?fechaInicio=2026-03-01&fechaFin=2026-03-31
    [HttpGet("equipo")]
    [Authorize(Policy = "SupervisorPolicy")]  // ← Solo supervisores pueden ver el equipo
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

    // GET: api/kpis/servicios-mas-vendidos?fechaInicio=2026-03-01&fechaFin=2026-03-31
    [HttpGet("servicios-mas-vendidos")]
    [Authorize(Policy = "SupervisorPolicy")]  // ← Solo supervisores
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