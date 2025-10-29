using Microsoft.EntityFrameworkCore.Migrations;

namespace WebPodryd_System.Data.Migrations
{
    public partial class RemoveOperationsPer8HoursFromContractTemplates : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Удаляем ненужную колонку
            migrationBuilder.DropColumn(
                name: "OperationsPer8Hours",
                table: "ContractTemplates");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Восстанавливаем колонку при откате
            migrationBuilder.AddColumn<int>(
                name: "OperationsPer8Hours",
                table: "ContractTemplates",
                type: "int",
                nullable: true);
        }
    }
}