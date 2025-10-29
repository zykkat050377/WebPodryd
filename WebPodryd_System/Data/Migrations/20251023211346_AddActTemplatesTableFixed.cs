using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace WebPodryd_System.Data.Migrations
{
    public partial class AddActTemplatesTableFixed : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // УБРАНО: Удаление индекса (может не существовать)
            // migrationBuilder.DropIndex(
            //     name: "IX_ContractTemplates_Name_ContractTypeId",
            //     table: "ContractTemplates");

            // УБРАНО: Удаление столбцов (могут не существовать)
            // migrationBuilder.DropColumn(
            //     name: "OperationsPer8Hours",
            //     table: "ContractTemplates");
            // migrationBuilder.DropColumn(
            //     name: "Type",
            //     table: "ContractTemplates");

            // Добавляем только нужные колонки
            migrationBuilder.AddColumn<decimal>(
                name: "Cost",
                table: "ContractTemplates",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<string>(
                name: "CreatedBy",
                table: "ContractTemplates",
                type: "nvarchar(max)",
                nullable: true);

            // ИСПРАВЛЕНО: defaultValue изменен на 1 (существующий DepartmentId)
            migrationBuilder.AddColumn<int>(
                name: "DepartmentId",
                table: "ContractTemplates",
                type: "int",
                nullable: false,
                defaultValue: 1);

            migrationBuilder.AddColumn<string>(
                name: "UpdatedBy",
                table: "ContractTemplates",
                type: "nvarchar(max)",
                nullable: true);

            // Создаем таблицу ActTemplates
            migrationBuilder.CreateTable(
                name: "ActTemplates",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    ContractTypeId = table.Column<int>(type: "int", nullable: false),
                    WorkServicesJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DepartmentId = table.Column<int>(type: "int", nullable: false),
                    TotalCost = table.Column<decimal>(type: "decimal(18,2)", nullable: false, defaultValue: 0m),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ActTemplates", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ActTemplates_ContractTypes_ContractTypeId",
                        column: x => x.ContractTypeId,
                        principalTable: "ContractTypes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ActTemplates_Departments_DepartmentId",
                        column: x => x.DepartmentId,
                        principalTable: "Departments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            // Обновляем данные ContractTypes
            migrationBuilder.UpdateData(
                table: "ContractTypes",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 10, 23, 21, 13, 46, 652, DateTimeKind.Utc).AddTicks(4575), new DateTime(2025, 10, 23, 21, 13, 46, 652, DateTimeKind.Utc).AddTicks(4690) });

            migrationBuilder.UpdateData(
                table: "ContractTypes",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 10, 23, 21, 13, 46, 652, DateTimeKind.Utc).AddTicks(4780), new DateTime(2025, 10, 23, 21, 13, 46, 652, DateTimeKind.Utc).AddTicks(4780) });

            migrationBuilder.UpdateData(
                table: "ContractTypes",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 10, 23, 21, 13, 46, 652, DateTimeKind.Utc).AddTicks(4783), new DateTime(2025, 10, 23, 21, 13, 46, 652, DateTimeKind.Utc).AddTicks(4784) });

            // Создаем индексы
            migrationBuilder.CreateIndex(
                name: "IX_ContractTemplates_DepartmentId",
                table: "ContractTemplates",
                column: "DepartmentId");

            // Обычный не-уникальный индекс для поиска по имени
            migrationBuilder.CreateIndex(
                name: "IX_ContractTemplates_Name",
                table: "ContractTemplates",
                column: "Name");

            // Индексы для ActTemplates
            migrationBuilder.CreateIndex(
                name: "IX_ActTemplates_ContractTypeId",
                table: "ActTemplates",
                column: "ContractTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_ActTemplates_DepartmentId",
                table: "ActTemplates",
                column: "DepartmentId");

            migrationBuilder.CreateIndex(
                name: "IX_ActTemplates_Name",
                table: "ActTemplates",
                column: "Name");

            // Добавляем внешний ключ
            migrationBuilder.AddForeignKey(
                name: "FK_ContractTemplates_Departments_DepartmentId",
                table: "ContractTemplates",
                column: "DepartmentId",
                principalTable: "Departments",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ContractTemplates_Departments_DepartmentId",
                table: "ContractTemplates");

            migrationBuilder.DropTable(
                name: "ActTemplates");

            migrationBuilder.DropIndex(
                name: "IX_ContractTemplates_DepartmentId",
                table: "ContractTemplates");

            migrationBuilder.DropIndex(
                name: "IX_ContractTemplates_Name",
                table: "ContractTemplates");

            migrationBuilder.DropColumn(
                name: "Cost",
                table: "ContractTemplates");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "ContractTemplates");

            migrationBuilder.DropColumn(
                name: "DepartmentId",
                table: "ContractTemplates");

            migrationBuilder.DropColumn(
                name: "UpdatedBy",
                table: "ContractTemplates");

            // УБРАНО: Восстановление удаленных столбцов (их не было)
            // migrationBuilder.AddColumn<int>(
            //     name: "OperationsPer8Hours",
            //     table: "ContractTemplates",
            //     type: "int",
            //     nullable: true);
            // migrationBuilder.AddColumn<string>(
            //     name: "Type",
            //     table: "ContractTemplates",
            //     type: "nvarchar(20)",
            //     maxLength: 20,
            //     nullable: false,
            //     defaultValue: "");

            // Обновляем данные ContractTypes обратно
            migrationBuilder.UpdateData(
                table: "ContractTypes",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 10, 23, 6, 53, 29, 876, DateTimeKind.Utc).AddTicks(3055), new DateTime(2025, 10, 23, 6, 53, 29, 876, DateTimeKind.Utc).AddTicks(3171) });

            migrationBuilder.UpdateData(
                table: "ContractTypes",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 10, 23, 6, 53, 29, 876, DateTimeKind.Utc).AddTicks(3265), new DateTime(2025, 10, 23, 6, 53, 29, 876, DateTimeKind.Utc).AddTicks(3266) });

            migrationBuilder.UpdateData(
                table: "ContractTypes",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 10, 23, 6, 53, 29, 876, DateTimeKind.Utc).AddTicks(3269), new DateTime(2025, 10, 23, 6, 53, 29, 876, DateTimeKind.Utc).AddTicks(3270) });

            // УБРАНО: Восстановление уникального индекса (не нужен)
            // migrationBuilder.CreateIndex(
            //     name: "IX_ContractTemplates_Name_ContractTypeId",
            //     table: "ContractTemplates",
            //     columns: new[] { "Name", "ContractTypeId" },
            //     unique: true);
        }
    }
}