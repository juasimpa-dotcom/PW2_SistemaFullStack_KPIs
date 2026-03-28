namespace SistemaKpis.Application.DTOs;

public class ServicioDto
{
    public int Id { get; set; }
    public int CategoriaId { get; set; }
    public string CodigoSku { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public decimal PrecioActual { get; set; }
    public string? Descripcion { get; set; }
    public string? NombreCategoria { get; set; }
}

public class CrearServicioDto
{
    public int CategoriaId { get; set; }
    public string CodigoSku { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public decimal PrecioActual { get; set; }
    public string? Descripcion { get; set; }
}

public class ActualizarServicioDto
{
    public int CategoriaId { get; set; }
    public string CodigoSku { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public decimal PrecioActual { get; set; }
    public string? Descripcion { get; set; }
}