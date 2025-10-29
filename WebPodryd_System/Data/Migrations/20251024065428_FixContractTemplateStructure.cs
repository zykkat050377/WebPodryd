// Data/Migrations/xxxxxx_FixContractTemplateStructure.cs
using Microsoft.EntityFrameworkCore.Migrations;
using System;

namespace WebPodryd_System.Data.Migrations
{
    public partial class FixContractTemplateStructure : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Удаляем DepartmentId и Cost из ContractTemplates
            migrationBuilder.DropForeignKey(
                name: "FK_ContractTemplates_Departments_DepartmentId",
                table: "ContractTemplates");

            migrationBuilder.DropIndex(
                name: "IX_ContractTemplates_DepartmentId",
                table: "ContractTemplates");

            migrationBuilder.DropColumn(
                name: "Cost",
                table: "ContractTemplates");

            migrationBuilder.DropColumn(
                name: "DepartmentId",
                table: "ContractTemplates");

            // Добавляем ContractTemplateId в ActTemplates
            migrationBuilder.AddColumn<int>(
                name: "ContractTemplateId",
                table: "ActTemplates",
                type: "int",
                nullable: false,
                defaultValue: 0);

            // Создаем индекс и внешний ключ для связи ActTemplates -> ContractTemplates
            migrationBuilder.CreateIndex(
                name: "IX_ActTemplates_ContractTemplateId",
                table: "ActTemplates",
                column: "ContractTemplateId");

            migrationBuilder.AddForeignKey(
                name: "FK_ActTemplates_ContractTemplates_ContractTemplateId",
                table: "ActTemplates",
                column: "ContractTemplateId",
                principalTable: "ContractTemplates",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ActTemplates_ContractTemplates_ContractTemplateId",
                table: "ActTemplates");

            migrationBuilder.DropIndex(
                name: "IX_ActTemplates_ContractTemplateId",
                table: "ActTemplates");

            migrationBuilder.DropColumn(
                name: "ContractTemplateId",
                table: "ActTemplates");

            // Восстанавливаем DepartmentId и Cost в ContractTemplates
            migrationBuilder.AddColumn<decimal>(
                name: "Cost",
                table: "ContractTemplates",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<int>(
                name: "DepartmentId",
                table: "ContractTemplates",
                type: "int",
                nullable: false,
                defaultValue: 1);

            migrationBuilder.CreateIndex(
                name: "IX_ContractTemplates_DepartmentId",
                table: "ContractTemplates",
                column: "DepartmentId");

            migrationBuilder.AddForeignKey(
                name: "FK_ContractTemplates_Departments_DepartmentId",
                table: "ContractTemplates",
                column: "DepartmentId",
                principalTable: "Departments",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}