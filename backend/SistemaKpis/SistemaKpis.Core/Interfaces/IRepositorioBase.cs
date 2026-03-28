using SistemaKpis.Core.Entidades.Base;

namespace SistemaKpis.Core.Interfaces;

public interface IRepositorioBase<T> where T : EntidadBase
{
    Task<IEnumerable<T>> ObtenerTodosAsync();
    Task<T?> ObtenerPorIdAsync(int id);
    Task<T> AgregarAsync(T entidad);
    Task ActualizarAsync(T entidad);
    Task EliminarAsync(int id);
}