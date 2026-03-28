using SistemaKpis.Core.Entidades.Base;
using SistemaKpis.Core.Entidades.Catalogos;
using SistemaKpis.Core.Entidades.Transacciones;
using SistemaKpis.Core.Entidades.Configuracion;

namespace SistemaKpis.Core.Entidades.Catalogos;

public class Usuario : EntidadBase
{
    public Guid KeycloakId { get; set; } // ID externo de Keycloak
    public int RolId { get; set; }
    public string NombreCompleto { get; set; } = string.Empty;
    public string Correo { get; set; } = string.Empty;
    public bool Activo { get; set; } = true;

    // Navegación
    public virtual Rol Rol { get; set; } = null!;
    public virtual ICollection<Venta> Ventas { get; set; } = new List<Venta>();
    public virtual ICollection<Meta> Metas { get; set; } = new List<Meta>();
    public virtual ICollection<Alerta> Alertas { get; set; } = new List<Alerta>();
}