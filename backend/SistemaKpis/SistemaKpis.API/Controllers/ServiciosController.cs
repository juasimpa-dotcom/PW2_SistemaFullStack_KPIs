using Microsoft.AspNetCore.Mvc;
using SistemaKpis.Application.DTOs;
using SistemaKpis.Core.Entidades.Catalogos;
using SistemaKpis.Core.Interfaces;

namespace SistemaKpis.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ServiciosController : ControllerBase
{
    private readonly IServicioRepositorio _servicioRepositorio;
    private readonly ILogger<ServiciosController> _logger;

    public ServiciosController(
        IServicioRepositorio servicioRepositorio,
        ILogger<ServiciosController> logger)
    {
        _servicioRepositorio = servicioRepositorio;
        _logger = logger;
    }

    // GET: api/servicios
    [HttpGet]
    public async Task<ActionResult<IEnumerable<ServicioDto>>> ObtenerServicios()
    {
        var servicios = await _servicioRepositorio.ObtenerTodosAsync();

        var serviciosDto = servicios.Select(s => new ServicioDto
        {
            Id = s.Id,
            CategoriaId = s.CategoriaId,
            CodigoSku = s.CodigoSku,
            Nombre = s.Nombre,
            PrecioActual = s.PrecioActual,
            Descripcion = s.Descripcion
        });

        return Ok(serviciosDto);
    }

    // GET: api/servicios/5
    [HttpGet("{id}")]
    public async Task<ActionResult<ServicioDto>> ObtenerServicio(int id)
    {
        var servicio = await _servicioRepositorio.ObtenerPorIdAsync(id);

        if (servicio == null)
        {
            return NotFound(new { message = $"Servicio con ID {id} no encontrado" });
        }

        var servicioDto = new ServicioDto
        {
            Id = servicio.Id,
            CategoriaId = servicio.CategoriaId,
            CodigoSku = servicio.CodigoSku,
            Nombre = servicio.Nombre,
            PrecioActual = servicio.PrecioActual,
            Descripcion = servicio.Descripcion
        };

        return Ok(servicioDto);
    }

    // POST: api/servicios
    [HttpPost]
    public async Task<ActionResult<ServicioDto>> CrearServicio(CrearServicioDto dto)
    {
        var servicio = new Servicio
        {
            CategoriaId = dto.CategoriaId,
            CodigoSku = dto.CodigoSku,
            Nombre = dto.Nombre,
            PrecioActual = dto.PrecioActual,
            Descripcion = dto.Descripcion
        };

        await _servicioRepositorio.AgregarAsync(servicio);

        var servicioDto = new ServicioDto
        {
            Id = servicio.Id,
            CategoriaId = servicio.CategoriaId,
            CodigoSku = servicio.CodigoSku,
            Nombre = servicio.Nombre,
            PrecioActual = servicio.PrecioActual,
            Descripcion = servicio.Descripcion
        };

        return CreatedAtAction(nameof(ObtenerServicio), new { id = servicio.Id }, servicioDto);
    }

    // PUT: api/servicios/5
    [HttpPut("{id}")]
    public async Task<IActionResult> ActualizarServicio(int id, ActualizarServicioDto dto)
    {
        var servicio = await _servicioRepositorio.ObtenerPorIdAsync(id);

        if (servicio == null)
        {
            return NotFound(new { message = $"Servicio con ID {id} no encontrado" });
        }

        servicio.CategoriaId = dto.CategoriaId;
        servicio.CodigoSku = dto.CodigoSku;
        servicio.Nombre = dto.Nombre;
        servicio.PrecioActual = dto.PrecioActual;
        servicio.Descripcion = dto.Descripcion;

        await _servicioRepositorio.ActualizarAsync(servicio);

        return NoContent();
    }

    // DELETE: api/servicios/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> EliminarServicio(int id)
    {
        var servicio = await _servicioRepositorio.ObtenerPorIdAsync(id);

        if (servicio == null)
        {
            return NotFound(new { message = $"Servicio con ID {id} no encontrado" });
        }

        await _servicioRepositorio.EliminarAsync(id);

        return NoContent();
    }
}