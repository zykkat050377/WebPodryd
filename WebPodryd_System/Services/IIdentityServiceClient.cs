// WebPodryd_System/Services/IIdentityServiceClient.cs
using System.Collections.Generic;
using System.Threading.Tasks;

namespace WebPodryd_System.Services
{
    public interface IIdentityServiceClient
    {
        Task<IdentityUserDto> GetUserByIdAsync(string userId);
        Task<bool> CheckUserExistsAsync(string userId);
        Task<List<IdentityUserDto>> GetAllUsersWithRolesAsync();

    }

    public class IdentityUserDto
    {
        public string Id { get; set; }
        public string UserName { get; set; }
        public string Email { get; set; }
        public string Role { get; set; }
    }
}
