using SistemaKpis.Core.Entidades.Base;

namespace SistemaKpis.Core.Entidades.Configuracion;

public class Alerta : EntidadBase
{
    public int UsuarioId { get; set; }
    public string Tipo { get; set; } = string.Empty; // "rezago_meta", "riesgo", etc.
    public string Mensaje { get; set; } = string.Empty;
    public bool Leida { get; set; } = false;

    // Navegación
    public virtual Usuario Usuario { get; set; } = null!;
}