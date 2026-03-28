using SistemaKpis.Core.Entidades.Base;
using SistemaKpis.Core.Entidades.Catalogos;

namespace SistemaKpis.Core.Entidades.Transacciones;

public class Venta : EntidadBase
{
    public int UsuarioId { get; set; } // Vendedor
    public int ClienteId { get; set; }
    public DateTime FechaVenta { get; set; } = DateTime.UtcNow;
    public decimal MontoTotal { get; set; }
    public int CantidadServicios { get; set; } // Para KPIs de conteo
    public string Estado { get; set; } = "completada"; // "completada", "cancelada"

    // Navegación
    public virtual Usuario Vendedor { get; set; } = null!;
    public virtual Cliente Cliente { get; set; } = null!;
    public virtual ICollection<DetalleVenta> Detalles { get; set; } = new List<DetalleVenta>();
}