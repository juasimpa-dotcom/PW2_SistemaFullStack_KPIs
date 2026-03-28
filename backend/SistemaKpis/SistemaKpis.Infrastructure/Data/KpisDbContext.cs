using Microsoft.EntityFrameworkCore;
using SistemaKpis.Core.Entidades.Base;
using SistemaKpis.Core.Entidades.Catalogos;
using SistemaKpis.Core.Entidades.Transacciones;
using SistemaKpis.Core.Entidades.Configuracion;

namespace SistemaKpis.Infrastructure.Data;

public class KpisDbContext : DbContext
{
	public KpisDbContext(DbContextOptions<KpisDbContext> options) : base(options) { }

	// DbSets - Catálogos
	public DbSet<Rol> Roles => Set<Rol>();
	public DbSet<Usuario> Usuarios => Set<Usuario>();
	public DbSet<Categoria> Categorias => Set<Categoria>();
	public DbSet<Servicio> Servicios => Set<Servicio>();
	public DbSet<Cliente> Clientes => Set<Cliente>();

	// DbSets - Configuración
	public DbSet<Periodo> Periodos => Set<Periodo>();
	public DbSet<Meta> Metas => Set<Meta>();
	public DbSet<Alerta> Alertas => Set<Alerta>();

	// DbSets - Transacciones
	public DbSet<Venta> Ventas => Set<Venta>();
	public DbSet<DetalleVenta> DetallesVenta => Set<DetalleVenta>();

	protected override void OnModelCreating(ModelBuilder modelBuilder)
	{
		base.OnModelCreating(modelBuilder);

		// Configurar nombres de tablas en singular (opcional)
		modelBuilder.Entity<Rol>().ToTable("roles");
		modelBuilder.Entity<Usuario>().ToTable("usuarios");
		modelBuilder.Entity<Categoria>().ToTable("categorias");
		modelBuilder.Entity<Servicio>().ToTable("servicios");
		modelBuilder.Entity<Cliente>().ToTable("clientes");
		modelBuilder.Entity<Periodo>().ToTable("periodos");
		modelBuilder.Entity<Meta>().ToTable("metas");
		modelBuilder.Entity<Alerta>().ToTable("alertas");
		modelBuilder.Entity<Venta>().ToTable("ventas");
		modelBuilder.Entity<DetalleVenta>().ToTable("detalles_venta");

		// Configurar relaciones
		modelBuilder.Entity<Usuario>()
			.HasOne(u => u.Rol)
			.WithMany(r => r.Usuarios)
			.HasForeignKey(u => u.RolId);

		modelBuilder.Entity<Servicio>()
			.HasOne(s => s.Categoria)
			.WithMany(c => c.Servicios)
			.HasForeignKey(s => s.CategoriaId);

		modelBuilder.Entity<Venta>()
			.HasOne(v => v.Vendedor)
			.WithMany(u => u.Ventas)
			.HasForeignKey(v => v.UsuarioId);

		modelBuilder.Entity<Venta>()
			.HasOne(v => v.Cliente)
			.WithMany(c => c.Ventas)
			.HasForeignKey(v => v.ClienteId);

		modelBuilder.Entity<DetalleVenta>()
			.HasOne(d => d.Venta)
			.WithMany(v => v.Detalles)
			.HasForeignKey(d => d.VentaId);

		modelBuilder.Entity<DetalleVenta>()
			.HasOne(d => d.Servicio)
			.WithMany(s => s.DetallesVenta)
			.HasForeignKey(d => d.ServicioId);

		modelBuilder.Entity<Meta>()
			.HasOne(m => m.Usuario)
			.WithMany(u => u.Metas)
			.HasForeignKey(m => m.UsuarioId);

		modelBuilder.Entity<Meta>()
			.HasOne(m => m.Periodo)
			.WithMany(p => p.Metas)
			.HasForeignKey(m => m.PeriodoId);

		modelBuilder.Entity<Alerta>()
			.HasOne(a => a.Usuario)
			.WithMany(u => u.Alertas)
			.HasForeignKey(a => a.UsuarioId);
	}
}