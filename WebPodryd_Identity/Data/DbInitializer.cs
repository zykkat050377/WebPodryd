//WebPodryd_Identity/Data/DbInitializer.cs
using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using WebPodryd_Identity.Models;

namespace WebPodryd_Identity.Data
{
    public static class DbInitializer
    {
        public static async Task InitializeAsync(
    AppDbContext context,
    UserManager<IdentityUser> userManager,
    RoleManager<IdentityRole> roleManager)
        {
            // Проверяем существование ролей
            string[] roleNames = { "admin", "manager", "user" };

            foreach (var roleName in roleNames)
            {
                if (!await roleManager.RoleExistsAsync(roleName))
                {
                    await roleManager.CreateAsync(new IdentityRole(roleName));
                }
            }

            // Создаем администратора
            var adminEmail = "admin@example.com";
            var adminPassword = "Admin123456!";

            if (await userManager.FindByEmailAsync(adminEmail) == null)
            {
                var admin = new IdentityUser
                {
                    UserName = adminEmail,
                    Email = adminEmail,
                    EmailConfirmed = true
                };

                var result = await userManager.CreateAsync(admin, adminPassword);
                if (result.Succeeded)
                {
                    await userManager.AddToRoleAsync(admin, "admin");
                }
            }
        }

        internal static Task InitializeAsync(AppDbContext context, UserManager<User> userManager, RoleManager<IdentityRole> roleManager)
        {
            throw new NotImplementedException();
        }
    }
}