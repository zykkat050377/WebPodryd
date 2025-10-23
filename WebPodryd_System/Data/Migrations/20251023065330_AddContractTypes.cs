using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace WebPodryd_System.Data.Migrations
{
    public partial class AddContractTypes : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_ContractTemplates_Name_Type",
                table: "ContractTemplates");

            migrationBuilder.RenameColumn(
                name: "ContractType",
                table: "Contracts",
                newName: "ContractTypeCode");

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "SigningEmployees",
                type: "datetime2",
                nullable: false,
                defaultValueSql: "GETUTCDATE()",
                oldClrType: typeof(DateTime),
                oldType: "datetime2");

            migrationBuilder.AddColumn<int>(
                name: "ContractTypeId",
                table: "ContractTemplates",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "ContractTypeId",
                table: "Contracts",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "ContractTypes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Code = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ContractTypes", x => x.Id);
                });

            migrationBuilder.InsertData(
                table: "ContractTypes",
                columns: new[] { "Id", "Code", "CreatedAt", "Description", "Name", "UpdatedAt" },
                values: new object[] { 1, "operation", new DateTime(2025, 10, 23, 6, 53, 29, 876, DateTimeKind.Utc).AddTicks(3055), "Оплата за каждую выполненную операцию", "За операцию", new DateTime(2025, 10, 23, 6, 53, 29, 876, DateTimeKind.Utc).AddTicks(3171) });

            migrationBuilder.InsertData(
                table: "ContractTypes",
                columns: new[] { "Id", "Code", "CreatedAt", "Description", "Name", "UpdatedAt" },
                values: new object[] { 2, "norm-hour", new DateTime(2025, 10, 23, 6, 53, 29, 876, DateTimeKind.Utc).AddTicks(3265), "Оплата по нормо-часам работы", "Нормо-часа", new DateTime(2025, 10, 23, 6, 53, 29, 876, DateTimeKind.Utc).AddTicks(3266) });

            migrationBuilder.InsertData(
                table: "ContractTypes",
                columns: new[] { "Id", "Code", "CreatedAt", "Description", "Name", "UpdatedAt" },
                values: new object[] { 3, "cost", new DateTime(2025, 10, 23, 6, 53, 29, 876, DateTimeKind.Utc).AddTicks(3269), "Фиксированная стоимость работ/услуг", "Стоимость", new DateTime(2025, 10, 23, 6, 53, 29, 876, DateTimeKind.Utc).AddTicks(3270) });

            migrationBuilder.CreateIndex(
                name: "IX_ContractTemplates_ContractTypeId",
                table: "ContractTemplates",
                column: "ContractTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_ContractTemplates_Name_ContractTypeId",
                table: "ContractTemplates",
                columns: new[] { "Name", "ContractTypeId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Contracts_ContractTypeId",
                table: "Contracts",
                column: "ContractTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_ContractTypes_Code",
                table: "ContractTypes",
                column: "Code",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Contracts_ContractTypes_ContractTypeId",
                table: "Contracts",
                column: "ContractTypeId",
                principalTable: "ContractTypes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ContractTemplates_ContractTypes_ContractTypeId",
                table: "ContractTemplates",
                column: "ContractTypeId",
                principalTable: "ContractTypes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Contracts_ContractTypes_ContractTypeId",
                table: "Contracts");

            migrationBuilder.DropForeignKey(
                name: "FK_ContractTemplates_ContractTypes_ContractTypeId",
                table: "ContractTemplates");

            migrationBuilder.DropTable(
                name: "ContractTypes");

            migrationBuilder.DropIndex(
                name: "IX_ContractTemplates_ContractTypeId",
                table: "ContractTemplates");

            migrationBuilder.DropIndex(
                name: "IX_ContractTemplates_Name_ContractTypeId",
                table: "ContractTemplates");

            migrationBuilder.DropIndex(
                name: "IX_Contracts_ContractTypeId",
                table: "Contracts");

            migrationBuilder.DropColumn(
                name: "ContractTypeId",
                table: "ContractTemplates");

            migrationBuilder.DropColumn(
                name: "ContractTypeId",
                table: "Contracts");

            migrationBuilder.RenameColumn(
                name: "ContractTypeCode",
                table: "Contracts",
                newName: "ContractType");

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "SigningEmployees",
                type: "datetime2",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "datetime2",
                oldDefaultValueSql: "GETUTCDATE()");

            migrationBuilder.CreateIndex(
                name: "IX_ContractTemplates_Name_Type",
                table: "ContractTemplates",
                columns: new[] { "Name", "Type" },
                unique: true);
        }
    }
}
