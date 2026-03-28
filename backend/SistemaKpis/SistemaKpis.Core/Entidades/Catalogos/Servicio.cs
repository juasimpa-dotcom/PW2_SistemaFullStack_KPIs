using SistemaKpis.Core.Entidades.Base;
using SistemaKpis.Core.Entidades.Transacciones;

namespace SistemaKpis.Core.Entidades.Catalogos;

public class Servicio : EntidadBase
{
    public int CategoriaId { get; set; }
    public string CodigoSku { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public decimal PrecioActual { get; set; }
    public string? Descripcion { get; set; }

    // Navegación
    public virtual Categoria Categoria { get; set; } = null!;
    public virtual ICollection<DetalleVenta> DetallesVenta { get; set; } = new List<DetalleVenta>();
}