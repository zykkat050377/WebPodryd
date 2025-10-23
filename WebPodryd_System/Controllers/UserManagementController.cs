// WebPodryd_System/Controllers/UserManagementController.cs
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using WebPodryd_System.Data;
using WebPodryd_System.Models;
using WebPodryd_System.DTO;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using System;
using System.Data.SqlClient;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using System.Security.Claims;

namespace WebPodryd_System.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [EnableCors("AllowFrontend")]
    public class UserManagementController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly string _identityConnectionString;

        public UserManagementController(AppDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
            _identityConnectionString = configuration.GetConnectionString("IdentityDbConnection");
        }

        // GET: api/UserManagement
        [HttpGet]
        public async Task<ActionResult<IEnumerable<UserDto>>> GetUsers()
        {
            try
            {
                Console.WriteLine("=== НАЧАЛО GetUsers ===");

                // 1. Получаем профили из System базы
                var systemProfiles = await _context.ProfileUsers
                    .Include(u => u.UserDepartments)
                    .ThenInclude(ud => ud.Department)
                    .ToListAsync();
                Console.WriteLine($"Получено профилей из System: {systemProfiles.Count}");

                // 2. Получаем роли из Identity базы
                var userRoles = await GetUserRolesFromIdentity();
                Console.WriteLine($"Получено записей о ролях из Identity: {userRoles.Count}");

                // 3. Получаем информацию о ролях
                var roles = await GetRolesFromIdentity();
                Console.WriteLine($"Получено ролей из Identity: {roles.Count}");

                // 4. Создаем DTO с объединенными данными
                var result = systemProfiles.Select(profile =>
                {
                    // Находим роль пользователя
                    var userRole = userRoles.FirstOrDefault(ur => ur.UserId == profile.Id);
                    var roleName = "user"; // По умолчанию

                    if (userRole != null)
                    {
                        var role = roles.FirstOrDefault(r => r.Id == userRole.RoleId);
                        roleName = role?.Name ?? "user";
                    }

                    return new UserDto
                    {
                        Id = profile.Id,
                        LastName = profile.LastName,
                        FirstName = profile.FirstName,
                        MiddleName = profile.MiddleName,
                        Position = profile.Position,
                        Email = profile.Email,
                        Role = roleName,
                        Departments = profile.UserDepartments?.Select(ud => new DepartmentDto
                        {
                            Id = ud.Department.Id,
                            Name = ud.Department.Name,
                            Code = ud.Department.Code
                        }).ToList() ?? new List<DepartmentDto>()
                    };
                }).ToList();

                Console.WriteLine($"=== КОНЕЦ GetUsers. Возвращаем {result.Count} пользователей ===");
                return Ok(result);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"=== КРИТИЧЕСКАЯ ОШИБКА в GetUsers ===");
                Console.WriteLine($"Сообщение: {ex.Message}");
                Console.WriteLine($"StackTrace: {ex.StackTrace}");
                if (ex.InnerException != null)
                {
                    Console.WriteLine($"Inner Exception: {ex.InnerException.Message}");
                }
                Console.WriteLine($"=== КОНЕЦ ОШИБКИ ===");

                return StatusCode(500, $"Критическая ошибка сервера: {ex.Message}");
            }
        }

        // Вспомогательные методы для получения данных из Identity базы
        private async Task<List<UserRoleInfo>> GetUserRolesFromIdentity()
        {
            var userRoles = new List<UserRoleInfo>();

            using (var connection = new SqlConnection(_identityConnectionString))
            {
                await connection.OpenAsync();
                var command = new SqlCommand(
                    "SELECT UserId, RoleId FROM [WebPodryd_Identity].[dbo].[UserRoles]",
                    connection);

                using var reader = await command.ExecuteReaderAsync();
                while (await reader.ReadAsync())
                {
                    userRoles.Add(new UserRoleInfo
                    {
                        UserId = reader["UserId"].ToString(),
                        RoleId = reader["RoleId"].ToString()
                    });
                }
            }

            return userRoles;
        }

        private async Task<List<RoleInfo>> GetRolesFromIdentity()
        {
            var roles = new List<RoleInfo>();

            using (var connection = new SqlConnection(_identityConnectionString))
            {
                await connection.OpenAsync();
                var command = new SqlCommand(
                    "SELECT Id, Name FROM [WebPodryd_Identity].[dbo].[Roles]",
                    connection);

                using var reader = await command.ExecuteReaderAsync();
                while (await reader.ReadAsync())
                {
                    roles.Add(new RoleInfo
                    {
                        Id = reader["Id"].ToString(),
                        Name = reader["Name"].ToString()
                    });
                }
            }

            return roles;
        }

        // Вспомогательные классы
        public class UserRoleInfo
        {
            public string UserId { get; set; }
            public string RoleId { get; set; }
        }

        public class RoleInfo
        {
            public string Id { get; set; }
            public string Name { get; set; }
        }

        [HttpGet("debug")]
        public async Task<ActionResult> DebugInfo()
        {
            try
            {
                var info = new
                {
                    SystemDatabase = _context.Database.GetDbConnection().Database,
                    CanConnect = await _context.Database.CanConnectAsync(),
                    ProfileUsersTableExists = await _context.ProfileUsers.AnyAsync(),
                    ProfileUsersCount = await _context.ProfileUsers.CountAsync(),
                    DepartmentsCount = await _context.Departments.CountAsync(),
                    UserDepartmentsCount = await _context.UserDepartments.CountAsync()
                };

                return Ok(info);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message, details = ex.StackTrace });
            }
        }

        // GET: api/UserManagement/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<UserDto>> GetUser(string id)
        {
            try
            {
                var profile = await _context.ProfileUsers
                    .Include(u => u.UserDepartments)
                    .ThenInclude(ud => ud.Department)
                    .FirstOrDefaultAsync(u => u.Id == id);

                if (profile == null)
                {
                    return NotFound("Профиль пользователя не найден");
                }

                // Получаем роль пользователя из Identity базы
                var userRoles = await GetUserRolesFromIdentity();
                var roles = await GetRolesFromIdentity();

                var userRole = userRoles.FirstOrDefault(ur => ur.UserId == profile.Id);
                var roleName = "user";

                if (userRole != null)
                {
                    var role = roles.FirstOrDefault(r => r.Id == userRole.RoleId);
                    roleName = role?.Name ?? "user";
                }

                var result = new UserDto
                {
                    Id = profile.Id,
                    LastName = profile.LastName,
                    FirstName = profile.FirstName,
                    MiddleName = profile.MiddleName,
                    Position = profile.Position,
                    Email = profile.Email,
                    Role = roleName,
                    Departments = profile.UserDepartments?.Select(ud => new DepartmentDto
                    {
                        Id = ud.Department.Id,
                        Name = ud.Department.Name,
                        Code = ud.Department.Code
                    }).ToList() ?? new List<DepartmentDto>()
                };

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Ошибка сервера: {ex.Message}");
            }
        }

        // POST: api/UserManagement
        [HttpPost]
        public async Task<ActionResult<UserDto>> CreateUser([FromBody] CreateUserDto createUserDto)
        {
            try
            {
                // Проверяем, существует ли профиль в System базе
                var existingProfile = await _context.ProfileUsers
                    .FirstOrDefaultAsync(u => u.Id == createUserDto.IdentityUserId);

                if (existingProfile != null)
                {
                    return BadRequest("Профиль пользователя уже существует");
                }

                // Создаем профиль в System базе
                var profileUser = new ProfileUser
                {
                    Id = createUserDto.IdentityUserId,
                    LastName = createUserDto.LastName,
                    FirstName = createUserDto.FirstName,
                    MiddleName = createUserDto.MiddleName,
                    Position = createUserDto.Position,
                    Email = createUserDto.Email
                };

                _context.ProfileUsers.Add(profileUser);

                // Добавляем департаменты
                foreach (var deptId in createUserDto.DepartmentIds)
                {
                    var departmentExists = await _context.Departments.AnyAsync(d => d.Id == deptId);
                    if (!departmentExists)
                    {
                        return BadRequest($"Департамент с ID {deptId} не найден");
                    }

                    _context.UserDepartments.Add(new UserDepartment
                    {
                        UserId = profileUser.Id,
                        DepartmentId = deptId,
                        AssignedBy = User.Identity?.Name ?? "system",
                        AssignedDate = DateTime.UtcNow
                    });
                }

                await _context.SaveChangesAsync();

                // Возвращаем созданного пользователя
                var createdUser = await _context.ProfileUsers
                    .Include(u => u.UserDepartments)
                    .ThenInclude(ud => ud.Department)
                    .Where(u => u.Id == profileUser.Id)
                    .Select(u => new UserDto
                    {
                        Id = u.Id,
                        LastName = u.LastName,
                        FirstName = u.FirstName,
                        MiddleName = u.MiddleName,
                        Position = u.Position,
                        Email = u.Email,
                        Role = "user",
                        Departments = u.UserDepartments.Select(ud => new DepartmentDto
                        {
                            Id = ud.Department.Id,
                            Name = ud.Department.Name,
                            Code = ud.Department.Code
                        }).ToList()
                    })
                    .FirstOrDefaultAsync();

                return CreatedAtAction(nameof(GetUser), new { id = createdUser.Id }, createdUser);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Ошибка при создании пользователя: {ex.Message}");
            }
        }

        //[HttpGet("test")]
        //public async Task<ActionResult> Test()
        //{
        //    try
        //    {
        //        Console.WriteLine("=== ТЕСТОВЫЙ МЕТОД ===");

        //        // Простая проверка - возвращаем тестовые данные
        //        var testUsers = new List<UserDto>
        //        {
        //            new UserDto
        //            {
        //                Id = "test-1",
        //                LastName = "Тестов",
        //                FirstName = "Пользователь",
        //                MiddleName = "",
        //                Position = "Тестер",
        //                Email = "test@example.com",
        //                Role = "user",
        //                Departments = new List<DepartmentDto>()
        //            }
        //        };

        //        return Ok(testUsers);
        //    }
        //    catch (Exception ex)
        //    {
        //        Console.WriteLine($"Ошибка в тестовом методе: {ex}");
        //        return StatusCode(500, $"Тестовая ошибка: {ex.Message}");
        //    }
        //}

        // PUT: api/UserManagement/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(string id, [FromBody] UpdateUserDto updateUserDto)
        {
            try
            {
                var profileUser = await _context.ProfileUsers.FindAsync(id);
                if (profileUser == null)
                {
                    return NotFound("Профиль пользователя не найден");
                }

                // Обновляем данные профиля
                profileUser.LastName = updateUserDto.LastName;
                profileUser.FirstName = updateUserDto.FirstName;
                profileUser.MiddleName = updateUserDto.MiddleName;
                profileUser.Position = updateUserDto.Position;

                // Обновляем департаменты
                var currentDepartments = await _context.UserDepartments
                    .Where(ud => ud.UserId == id)
                    .ToListAsync();

                _context.UserDepartments.RemoveRange(currentDepartments);

                foreach (var deptId in updateUserDto.DepartmentIds)
                {
                    var departmentExists = await _context.Departments.AnyAsync(d => d.Id == deptId);
                    if (!departmentExists)
                    {
                        return BadRequest($"Департамент с ID {deptId} не найден");
                    }

                    _context.UserDepartments.Add(new UserDepartment
                    {
                        UserId = id,
                        DepartmentId = deptId,
                        AssignedBy = User.Identity?.Name ?? "system",
                        AssignedDate = DateTime.UtcNow
                    });
                }

                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Ошибка при обновлении пользователя: {ex.Message}");
            }
        }

        // DELETE: api/UserManagement/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(string id)
        {
            try
            {
                var profileUser = await _context.ProfileUsers.FindAsync(id);
                if (profileUser == null)
                {
                    return NotFound("Профиль пользователя не найден");
                }

                // Удаляем связанные департаменты
                var userDepartments = await _context.UserDepartments
                    .Where(ud => ud.UserId == id)
                    .ToListAsync();
                _context.UserDepartments.RemoveRange(userDepartments);

                _context.ProfileUsers.Remove(profileUser);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Ошибка при удалении пользователя: {ex.Message}");
            }
        }

        // Вспомогательный класс для данных из Identity базы
        public class IdentityUserInfo
        {
            public string Id { get; set; }
            public string UserName { get; set; }
            public string Email { get; set; }
            public string FirstName { get; set; }
            public string LastName { get; set; }
            public string MiddleName { get; set; }
            public string Position { get; set; }
        }
    }
}