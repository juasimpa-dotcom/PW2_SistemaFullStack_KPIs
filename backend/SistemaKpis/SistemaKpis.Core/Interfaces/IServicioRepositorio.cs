using SistemaKpis.Core.Entidades.Catalogos;

namespace SistemaKpis.Core.Interfaces;

public interface IServicioRepositorio : IRepositorioBase<Servicio>
{
    Task<IEnumerable<Servicio>> ObtenerPorCategoriaAsync(int categoriaId);
    Task<Servicio?> ObtenerPorCodigoSkuAsync(string codigoSku);
}