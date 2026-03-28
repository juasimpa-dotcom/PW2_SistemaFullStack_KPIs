using SistemaKpis.Core.Entidades.Base;
using SistemaKpis.Core.Entidades.Transacciones;

namespace SistemaKpis.Core.Entidades.Catalogos;

public class Cliente : EntidadBase
{
    public string NombreCompleto { get; set; } = string.Empty;
    public string? Telefono { get; set; }

    // Navegación
    public virtual ICollection<Venta> Ventas { get; set; } = new List<Venta>();
}