using SistemaKpis.Core.Entidades.Base;
using SistemaKpis.Core.Entidades.Transacciones;

namespace SistemaKpis.Core.Entidades.Catalogos;

public class Categoria : EntidadBase
{
    public string Nombre { get; set; } = string.Empty;

    // Navegación
    public virtual ICollection<Servicio> Servicios { get; set; } = new List<Servicio>();
}