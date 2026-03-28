using SistemaKpis.Core.Entidades.Base;
using SistemaKpis.Core.Entidades.Transacciones;

namespace SistemaKpis.Core.Entidades.Catalogos;

public class Rol : EntidadBase
{
    public string Nombre { get; set; } = string.Empty; // "vendedor", "supervisor"

    // Navegación
    public virtual ICollection<Usuario> Usuarios { get; set; } = new List<Usuario>();
}