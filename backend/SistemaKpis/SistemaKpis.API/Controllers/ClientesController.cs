using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SistemaKpis.Core.Entidades.Catalogos;
using SistemaKpis.Infrastructure.Data;

namespace SistemaKpis.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ClientesController : ControllerBase
{
    private readonly KpisDbContext _context;

    public ClientesController(KpisDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<List<ClienteDto>>> ObtenerClientes([FromQuery] string? buscar)
    {
        var query = _context.Clientes.Where(c => c.Activo).AsQueryable();
        
        if (!string.IsNullOrWhiteSpace(buscar))
            query = query.Where(c => c.NombreCompleto.Contains(buscar));

        var clientes = await query
            .OrderBy(c => c.NombreCompleto)
            .Select(c => new ClienteDto(c.Id, c.NombreCompleto, c.Correo, c.Telefono))
            .Take(50)
            .ToListAsync();

        return Ok(clientes);
    }

    [HttpPost]
    public async Task<ActionResult<ClienteDto>> CrearCliente(CrearClienteRequest request)
    {
        var existe = await _context.Clientes.AnyAsync(c => c.NombreCompleto == request.NombreCompleto);
        if (existe) return BadRequest("Ya existe un cliente con ese nombre");

        var cliente = new Cliente
        {
            NombreCompleto = request.NombreCompleto,
            Correo = request.Correo,
            Telefono = request.Telefono,
            Activo = true
        };

        _context.Clientes.Add(cliente);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(ObtenerClientes), new ClienteDto(cliente.Id, cliente.NombreCompleto, cliente.Correo, cliente.Telefono));
    }
}

public record ClienteDto(int Id, string NombreCompleto, string? Correo, string? Telefono);
public record CrearClienteRequest(string NombreCompleto, string? Correo, string? Telefono);
