using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SistemaKpis.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AgregarActivoCliente : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "Activo",
                table: "clientes",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "Correo",
                table: "clientes",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Activo",
                table: "clientes");

            migrationBuilder.DropColumn(
                name: "Correo",
                table: "clientes");
        }
    }
}
