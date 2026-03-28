using Microsoft.EntityFrameworkCore;
using SistemaKpis.Core.Entidades.Catalogos;
using SistemaKpis.Core.Interfaces;
using SistemaKpis.Infrastructure.Data;

namespace SistemaKpis.Infrastructure.Repositorios;

public class ServicioRepositorio : RepositorioBase<Servicio>, IServicioRepositorio
{
    public ServicioRepositorio(KpisDbContext context) : base(context) { }

    public async Task<IEnumerable<Servicio>> ObtenerPorCategoriaAsync(int categoriaId)
    {
        return await _dbSet
            .Where(s => s.CategoriaId == categoriaId)
            .ToListAsync();
    }

    public async Task<Servicio?> ObtenerPorCodigoSkuAsync(string codigoSku)
    {
        return await _dbSet
            .FirstOrDefaultAsync(s => s.CodigoSku == codigoSku);
    }
}