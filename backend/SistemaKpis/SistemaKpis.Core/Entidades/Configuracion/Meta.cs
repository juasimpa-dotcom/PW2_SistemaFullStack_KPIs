using SistemaKpis.Core.Entidades.Base;

namespace SistemaKpis.Core.Entidades.Configuracion;

public class Meta : EntidadBase
{
    public int UsuarioId { get; set; }
    public int PeriodoId { get; set; }
    public decimal MetaMonetaria { get; set; }
    public int MetaCantidad { get; set; }

    // Navegación
    public virtual Usuario Usuario { get; set; } = null!;
    public virtual Periodo Periodo { get; set; } = null!;
}