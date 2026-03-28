namespace SistemaKpis.Application.DTOs.Ventas;

public class VentaDto
{
	public int Id { get; set; }
	public int UsuarioId { get; set; }
	public int ClienteId { get; set; }
	public DateTime FechaVenta { get; set; }
	public decimal MontoTotal { get; set; }
	public int CantidadServicios { get; set; }
	public string Estado { get; set; } = "completada";
	public string? NombreVendedor { get; set; }
	public string? NombreCliente { get; set; }
	public List<DetalleVentaDto> Detalles { get; set; } = new();
}

public class CrearVentaDto
{
	public int UsuarioId { get; set; }
	public int ClienteId { get; set; }
	public DateTime FechaVenta { get; set; } = DateTime.UtcNow;
	public string Estado { get; set; } = "completada";
	public List<CrearDetalleVentaDto> Detalles { get; set; } = new();
}

public class DetalleVentaDto
{
	public int Id { get; set; }
	public int VentaId { get; set; }
	public int ServicioId { get; set; }
	public int Cantidad { get; set; }
	public decimal PrecioUnitario { get; set; }
	public decimal Subtotal { get; set; }
	public string? NombreServicio { get; set; }
}

public class CrearDetalleVentaDto
{
	public int ServicioId { get; set; }
	public int Cantidad { get; set; }
	public decimal PrecioUnitario { get; set; }
}