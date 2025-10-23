//WebPodryd_Identity/Program.cs
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using System;
using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.AspNetCore.Identity;
using WebPodryd_Identity.Data;
using WebPodryd_Identity.Models;
using Microsoft.EntityFrameworkCore;

namespace WebPodryd_Identity
{
    public class Program
    {
        public static async Task Main(string[] args)
        {
            var host = CreateHostBuilder(args).Build();

            using (var scope = host.Services.CreateScope())
            {
                var services = scope.ServiceProvider;
                try
                {
                    var dbContext = services.GetRequiredService<AppDbContext>();
                    // Применяем все pending миграции
                    await dbContext.Database.MigrateAsync();

                    // Инициализация ролей и пользователей
                    await DbInitializer.InitializeAsync(
                        dbContext,
                        services.GetRequiredService<UserManager<IdentityUser>>(),
                        services.GetRequiredService<RoleManager<IdentityRole>>());
                }
                catch (Exception ex)
                {
                    var logger = services.GetRequiredService<ILogger<Program>>();
                    logger.LogError(ex, "An error occurred while migrating or initializing the database.");
                }
            }

            await host.RunAsync();
        }

        private static async Task InitializeDatabaseAsync(IHost host)
        {
            using var scope = host.Services.CreateScope();
            var services = scope.ServiceProvider;
            var logger = services.GetRequiredService<ILogger<Program>>();

            try
            {
                logger.LogInformation("Starting database migration...");

                var context = services.GetRequiredService<AppDbContext>();
                await context.Database.MigrateAsync();

                logger.LogInformation("Database migration completed successfully");

                logger.LogInformation("Starting database initialization...");

                var userManager = services.GetRequiredService<UserManager<IdentityUser>>();
                var roleManager = services.GetRequiredService<RoleManager<IdentityRole>>();
                await DbInitializer.InitializeAsync(context, userManager, roleManager);

                logger.LogInformation("Database initialization completed successfully");
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "An error occurred while initializing the database");
                throw; // Перебрасываем исключение, чтобы остановить приложение
            }
        }

        public static IHostBuilder CreateHostBuilder(string[] args) =>
            Host.CreateDefaultBuilder(args)
                .ConfigureWebHostDefaults(webBuilder =>
                {
                    webBuilder.UseStartup<Startup>();
                });
    }
}