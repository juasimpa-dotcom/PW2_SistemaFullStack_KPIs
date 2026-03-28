using SistemaKpis.Core.Entidades.Base;

namespace SistemaKpis.Core.Entidades.Transacciones;

public class DetalleVenta : EntidadBase
{
    public int VentaId { get; set; }
    public int ServicioId { get; set; } // ✅ CAMBIO: antes producto_id
    public int Cantidad { get; set; }
    public decimal PrecioUnitario { get; set; }
    public decimal Subtotal { get; set; }

    // Navegación
    public virtual Venta Venta { get; set; } = null!;
    public virtual Servicio Servicio { get; set; } = null!;
}