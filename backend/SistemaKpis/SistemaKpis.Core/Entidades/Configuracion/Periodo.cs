using SistemaKpis.Core.Entidades.Base;

namespace SistemaKpis.Core.Entidades.Configuracion;

public class Periodo : EntidadBase
{
    public string Nombre { get; set; } = string.Empty; // "Enero 2026", "Q1 2026"
    public DateTime FechaInicio { get; set; }
    public DateTime FechaFin { get; set; }
    public string Tipo { get; set; } = "mensual"; // "mensual", "trimestral"

    // Navegación
    public virtual ICollection<Meta> Metas { get; set; } = new List<Meta>();
}