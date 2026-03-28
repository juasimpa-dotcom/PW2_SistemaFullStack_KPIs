namespace SistemaKpis.Application.DTOs.KPIs;

public class KpiGeneralDto
{
    public int UsuarioId { get; set; }
    public string NombreVendedor { get; set; } = string.Empty;
    public decimal CumplimientoMeta { get; set; } // %
    public int VentasPeriodo { get; set; } // COUNT
    public decimal TicketPromedio { get; set; } // $
    public decimal IngresosTotales { get; set; } // SUM
    public decimal RitmoAvance { get; set; } // %
    public decimal ProyeccionCierre { get; set; } // $
    public int MejorRacha { get; set; } // días consecutivos
    public decimal VariacionPeriodoAnterior { get; set; } // %
}

public class RankingEquipoDto
{
    public int Posicion { get; set; }
    public int UsuarioId { get; set; }
    public string NombreVendedor { get; set; } = string.Empty;
    public decimal CumplimientoMeta { get; set; }
    public decimal IngresosTotales { get; set; }
    public int VentasPeriodo { get; set; }
}

public class ResumenEquipoDto
{
    public decimal CumplimientoPromedio { get; set; }
    public int TotalVendedores { get; set; }
    public int VendedoresEnRiesgo { get; set; }
    public decimal IngresosTotalesEquipo { get; set; }
    public List<RankingEquipoDto> Ranking { get; set; } = new();
}

public class ServicioMasVendidoDto
{
    public int ServicioId { get; set; }
    public string NombreServicio { get; set; } = string.Empty;
    public int CantidadVendida { get; set; }
    public decimal IngresosGenerados { get; set; }
}