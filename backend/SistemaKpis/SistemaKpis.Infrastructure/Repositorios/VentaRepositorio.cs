using Microsoft.EntityFrameworkCore;
using SistemaKpis.Core.Entidades.Transacciones;
using SistemaKpis.Core.Interfaces;
using SistemaKpis.Infrastructure.Data;

namespace SistemaKpis.Infrastructure.Repositorios;

public class VentaRepositorio : RepositorioBase<Venta>, IVentaRepositorio
{
    public VentaRepositorio(KpisDbContext context) : base(context) { }

    public async Task<IEnumerable<Venta>> ObtenerVentasConDetallesAsync()
    {
        return await _dbSet
            .Include(v => v.Vendedor)
            .Include(v => v.Cliente)
            .Include(v => v.Detalles)
                .ThenInclude(d => d.Servicio)
            .ToListAsync();
    }

    public async Task<Venta?> ObtenerVentaConDetallesAsync(int id)
    {
        return await _dbSet
            .Include(v => v.Vendedor)
            .Include(v => v.Cliente)
            .Include(v => v.Detalles)
                .ThenInclude(d => d.Servicio)
            .FirstOrDefaultAsync(v => v.Id == id);
    }
}