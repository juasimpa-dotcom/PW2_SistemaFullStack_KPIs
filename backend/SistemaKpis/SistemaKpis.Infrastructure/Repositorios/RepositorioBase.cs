using Microsoft.EntityFrameworkCore;
using SistemaKpis.Core.Entidades.Base;
using SistemaKpis.Core.Interfaces;
using SistemaKpis.Infrastructure.Data;

namespace SistemaKpis.Infrastructure.Repositorios;

public class RepositorioBase<T> : IRepositorioBase<T> where T : EntidadBase
{
    protected readonly KpisDbContext _context;
    protected readonly DbSet<T> _dbSet;

    public RepositorioBase(KpisDbContext context)
    {
        _context = context;
        _dbSet = context.Set<T>();
    }

    public virtual async Task<IEnumerable<T>> ObtenerTodosAsync()
    {
        return await _dbSet.ToListAsync();
    }

    public virtual async Task<T?> ObtenerPorIdAsync(int id)
    {
        return await _dbSet.FindAsync(id);
    }

    public virtual async Task<T> AgregarAsync(T entidad)
    {
        await _dbSet.AddAsync(entidad);
        await _context.SaveChangesAsync();
        return entidad;
    }

    public virtual async Task ActualizarAsync(T entidad)
    {
        _dbSet.Update(entidad);
        await _context.SaveChangesAsync();
    }

    public virtual async Task EliminarAsync(int id)
    {
        var entidad = await _dbSet.FindAsync(id);
        if (entidad != null)
        {
            _dbSet.Remove(entidad);
            await _context.SaveChangesAsync();
        }
    }
}