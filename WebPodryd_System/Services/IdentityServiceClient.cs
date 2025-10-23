// WebPodryd_System/Services/IdentityServiceClient.cs
using System.Collections.Generic;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;
using WebPodryd_System.Models;

namespace WebPodryd_System.Services
{
    public class IdentityServiceClient : IIdentityServiceClient
    {
        private readonly HttpClient _httpClient;

        public IdentityServiceClient(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        public Task<bool> CheckUserExistsAsync(string userId)
        {
            throw new System.NotImplementedException();
        }

        public async Task<List<IdentityUserDto>> GetAllUsersWithRolesAsync()
        {
            var response = await _httpClient.GetAsync("api/User/all-with-roles");
            response.EnsureSuccessStatusCode();
            return await response.Content.ReadFromJsonAsync<List<IdentityUserDto>>();
        }

        public async Task<IdentityUserDto> GetUserByIdAsync(string userId)
        {
            var response = await _httpClient.GetAsync($"api/User/{userId}");
            response.EnsureSuccessStatusCode();
            return await response.Content.ReadFromJsonAsync<IdentityUserDto>();
        }
    }
}