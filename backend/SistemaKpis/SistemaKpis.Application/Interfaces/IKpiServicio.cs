using SistemaKpis.Application.DTOs.KPIs;

namespace SistemaKpis.Application.Interfaces;

public interface IKpiServicio
{
    Task<KpiGeneralDto> ObtenerKpiGeneralAsync(int usuarioId, DateTime fechaInicio, DateTime fechaFin);
    Task<ResumenEquipoDto> ObtenerResumenEquipoAsync(DateTime fechaInicio, DateTime fechaFin);
    Task<List<ServicioMasVendidoDto>> ObtenerServiciosMasVendidosAsync(DateTime fechaInicio, DateTime fechaFin);
    Task<decimal> CalcularCumplimientoMetaAsync(int usuarioId, DateTime fechaInicio, DateTime fechaFin);
    Task<int> CalcularMejorRachaAsync(int usuarioId, DateTime fechaInicio, DateTime fechaFin);
}