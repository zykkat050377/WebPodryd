// WebPodryd_System/Services/UserSyncService.cs
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using WebPodryd_System.Data;
using Microsoft.Extensions.Logging;
using WebPodryd_System.Models;

namespace WebPodryd_System.Services
{
    public class UserSyncService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<UserSyncService> _logger;

        public UserSyncService(IServiceProvider serviceProvider, ILogger<UserSyncService> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                await SyncUsersAsync();
                await Task.Delay(TimeSpan.FromMinutes(5), stoppingToken);
            }
        }

        private async Task SyncUsersAsync()
        {
            using var scope = _serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var identityService = scope.ServiceProvider.GetRequiredService<IIdentityServiceClient>();

            try
            {
                var identityUsers = await identityService.GetAllUsersWithRolesAsync();

                if (identityUsers != null)
                {
                    foreach (var identityUser in identityUsers)
                    {
                        var existingUser = await context.ProfileUsers
                            .FirstOrDefaultAsync(u => u.Id == identityUser.Id);

                        if (existingUser == null)
                        {
                            var newUser = new ProfileUser
                            {
                                Id = identityUser.Id,
                                Email = identityUser.Email,
                                FirstName = "",
                                LastName = identityUser.UserName,
                                Position = ""
                            };
                            context.ProfileUsers.Add(newUser);
                        }
                        else
                        {
                            existingUser.Email = identityUser.Email;
                        }
                    }

                    await context.SaveChangesAsync();
                    _logger.LogInformation("Синхронизация пользователей завершена успешно");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка синхронизации пользователей");
            }
        }
    }
}