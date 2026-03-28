using SistemaKpis.Core.Entidades.Transacciones;

namespace SistemaKpis.Core.Interfaces;

public interface IVentaRepositorio : IRepositorioBase<Venta>
{
    Task<IEnumerable<Venta>> ObtenerVentasConDetallesAsync();
    Task<Venta?> ObtenerVentaConDetallesAsync(int id);
}