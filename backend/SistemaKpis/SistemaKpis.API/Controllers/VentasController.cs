using Microsoft.AspNetCore.Mvc;
using SistemaKpis.Application.DTOs.Ventas;
using SistemaKpis.Core.Entidades.Transacciones;
using SistemaKpis.Core.Interfaces;

namespace SistemaKpis.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class VentasController : ControllerBase
{
    private readonly IVentaRepositorio _ventaRepositorio;
    private readonly ILogger<VentasController> _logger;

    public VentasController(
        IVentaRepositorio ventaRepositorio,
        ILogger<VentasController> logger)
    {
        _ventaRepositorio = ventaRepositorio;
        _logger = logger;
    }

    // GET: api/ventas
    [HttpGet]
    public async Task<ActionResult<IEnumerable<VentaDto>>> ObtenerVentas()
    {
        var ventas = await _ventaRepositorio.ObtenerVentasConDetallesAsync();

        var ventasDto = ventas.Select(v => new VentaDto
        {
            Id = v.Id,
            UsuarioId = v.UsuarioId,
            ClienteId = v.ClienteId,
            FechaVenta = v.FechaVenta,
            MontoTotal = v.MontoTotal,
            CantidadServicios = v.CantidadServicios,
            Estado = v.Estado,
            NombreVendedor = v.Vendedor?.NombreCompleto,
            NombreCliente = v.Cliente?.NombreCompleto,
            Detalles = v.Detalles.Select(d => new DetalleVentaDto
            {
                Id = d.Id,
                VentaId = d.VentaId,
                ServicioId = d.ServicioId,
                Cantidad = d.Cantidad,
                PrecioUnitario = d.PrecioUnitario,
                Subtotal = d.Subtotal,
                NombreServicio = d.Servicio?.Nombre
            }).ToList()
        });

        return Ok(ventasDto);
    }

    // GET: api/ventas/5
    [HttpGet("{id}")]
    public async Task<ActionResult<VentaDto>> ObtenerVenta(int id)
    {
        var venta = await _ventaRepositorio.ObtenerVentaConDetallesAsync(id);

        if (venta == null)
        {
            return NotFound(new { message = $"Venta con ID {id} no encontrada" });
        }

        var ventaDto = new VentaDto
        {
            Id = venta.Id,
            UsuarioId = venta.UsuarioId,
            ClienteId = venta.ClienteId,
            FechaVenta = venta.FechaVenta,
            MontoTotal = venta.MontoTotal,
            CantidadServicios = venta.CantidadServicios,
            Estado = venta.Estado,
            NombreVendedor = venta.Vendedor?.NombreCompleto,
            NombreCliente = venta.Cliente?.NombreCompleto,
            Detalles = venta.Detalles.Select(d => new DetalleVentaDto
            {
                Id = d.Id,
                VentaId = d.VentaId,
                ServicioId = d.ServicioId,
                Cantidad = d.Cantidad,
                PrecioUnitario = d.PrecioUnitario,
                Subtotal = d.Subtotal,
                NombreServicio = d.Servicio?.Nombre
            }).ToList()
        };

        return Ok(ventaDto);
    }

    // POST: api/ventas
    [HttpPost]
    public async Task<ActionResult<VentaDto>> CrearVenta(CrearVentaDto dto)
    {
        try
        {
            // Calcular totales
            var montoTotal = 0m;
            var cantidadServicios = 0;

            foreach (var detalle in dto.Detalles)
            {
                var subtotal = detalle.Cantidad * detalle.PrecioUnitario;
                montoTotal += subtotal;
                cantidadServicios += detalle.Cantidad;
            }

            // Crear venta
            var venta = new Venta
            {
                UsuarioId = dto.UsuarioId,
                ClienteId = dto.ClienteId,
                FechaVenta = dto.FechaVenta,
                MontoTotal = montoTotal,
                CantidadServicios = cantidadServicios,
                Estado = dto.Estado,
                Detalles = dto.Detalles.Select(d => new DetalleVenta
                {
                    ServicioId = d.ServicioId,
                    Cantidad = d.Cantidad,
                    PrecioUnitario = d.PrecioUnitario,
                    Subtotal = d.Cantidad * d.PrecioUnitario
                }).ToList()
            };

            await _ventaRepositorio.AgregarAsync(venta);

            // Retornar la venta creada con detalles
            var ventaCreada = await _ventaRepositorio.ObtenerVentaConDetallesAsync(venta.Id);

            var ventaDto = new VentaDto
            {
                Id = ventaCreada!.Id,
                UsuarioId = ventaCreada.UsuarioId,
                ClienteId = ventaCreada.ClienteId,
                FechaVenta = ventaCreada.FechaVenta,
                MontoTotal = ventaCreada.MontoTotal,
                CantidadServicios = ventaCreada.CantidadServicios,
                Estado = ventaCreada.Estado,
                Detalles = ventaCreada.Detalles.Select(d => new DetalleVentaDto
                {
                    Id = d.Id,
                    VentaId = d.VentaId,
                    ServicioId = d.ServicioId,
                    Cantidad = d.Cantidad,
                    PrecioUnitario = d.PrecioUnitario,
                    Subtotal = d.Subtotal
                }).ToList()
            };

            return CreatedAtAction(nameof(ObtenerVenta), new { id = venta.Id }, ventaDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al crear venta");
            return BadRequest(new { message = "Error al crear la venta", error = ex.Message });
        }
    }
}