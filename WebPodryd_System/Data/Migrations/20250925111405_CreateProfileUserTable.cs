using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace WebPodryd_System.Data.Migrations
{
    public partial class CreateProfileUserTable : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Создаем только таблицу ProfileUsers, без изменения существующих таблиц
            migrationBuilder.CreateTable(
                name: "ProfileUsers",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    LastName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    FirstName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    MiddleName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Position = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    Email = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProfileUsers", x => x.Id);
                });

            // Внешний ключ добавляем только если таблица UserDepartments существует и имеет правильную структуру
            // Если возникают ошибки - закомментируйте этот блок
            migrationBuilder.AddForeignKey(
                name: "FK_UserDepartments_ProfileUsers_UserId",
                table: "UserDepartments",
                column: "UserId",
                principalTable: "ProfileUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Удаляем внешний ключ сначала
            migrationBuilder.DropForeignKey(
                name: "FK_UserDepartments_ProfileUsers_UserId",
                table: "UserDepartments");

            // Затем удаляем таблицу
            migrationBuilder.DropTable(
                name: "ProfileUsers");
        }
    }
}