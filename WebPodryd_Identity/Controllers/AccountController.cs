//// WebPodryd_Identity/Controllers/AccountController.cs
//using Microsoft.AspNetCore.Authorization;
//using Microsoft.AspNetCore.Identity;
//using Microsoft.AspNetCore.Mvc;
//using Microsoft.Extensions.Configuration;
//using Microsoft.IdentityModel.Tokens;
//using System;
//using System.Collections.Generic;
//using System.IdentityModel.Tokens.Jwt;
//using System.Linq;
//using System.Security.Claims;
//using System.Text;
//using System.Threading.Tasks;

//namespace WebPodryd_Identity.Controllers
//{
//    [Route("[controller]")]
//    [ApiController]
//    public class AccountController : ControllerBase
//    {
//        private readonly UserManager<IdentityUser> _userManager;
//        private readonly SignInManager<IdentityUser> _signInManager;
//        private readonly IConfiguration _configuration;

//        public AccountController(
//            UserManager<IdentityUser> userManager,
//            SignInManager<IdentityUser> signInManager,
//            IConfiguration configuration)
//        {
//            _userManager = userManager;
//            _signInManager = signInManager;
//            _configuration = configuration;
//        }

//        [HttpPost("register")]
//        [AllowAnonymous]
//        public async Task<IActionResult> Register([FromBody] RegisterModel model)
//        {
//            try
//            {
//                // Проверяем, существует ли пользователь с таким email
//                var existingUserByEmail = await _userManager.FindByEmailAsync(model.Email);
//                if (existingUserByEmail != null)
//                {
//                    return BadRequest(new { Message = "Пользователь с таким email уже существует" });
//                }

//                // Проверяем, существует ли пользователь с таким username
//                var existingUserByUsername = await _userManager.FindByNameAsync(model.Username);
//                if (existingUserByUsername != null)
//                {
//                    return BadRequest(new { Message = "Пользователь с таким username уже существует" });
//                }

//                // Создаем нового пользователя
//                var user = new IdentityUser
//                {
//                    UserName = model.Username,
//                    Email = model.Email
//                };

//                var result = await _userManager.CreateAsync(user, model.Password);

//                if (!result.Succeeded)
//                {
//                    var errors = string.Join(", ", result.Errors.Select(e => e.Description));
//                    return BadRequest(new { Message = $"Ошибка при создании пользователя: {errors}" });
//                }

//                // ДОБАВИТЬ: Устанавливаем claim о необходимости смены пароля
//                await _userManager.AddClaimAsync(user, new Claim("MustChangePassword", "true"));


//                // Добавляем роль пользователю
//                if (!string.IsNullOrEmpty(model.Role))
//                {
//                    var roleResult = await _userManager.AddToRoleAsync(user, model.Role);
//                    if (!roleResult.Succeeded)
//                    {
//                        // Логируем ошибку, но не удаляем пользователя
//                        Console.WriteLine($"Ошибка при назначении роли: {string.Join(", ", roleResult.Errors.Select(e => e.Description))}");
//                        // Можно решить: продолжить без роли или вернуть предупреждение
//                    }
//                }

//                return Ok(new
//                {
//                    Message = "Пользователь успешно создан",
//                    UserId = user.Id,
//                    Username = user.UserName,
//                    user.Email,
//                    MustChangePassword = true // ← Явно указываем фронтенду
//                });
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, new { Message = $"Внутренняя ошибка сервера: {ex.Message}" });
//            }
//        }

//        [HttpGet("external-login-callback")]
//        public async Task<IActionResult> LoginCallback([FromQuery] string returnUrl)
//        {
//            var user = await _userManager.GetUserAsync(User);
//            if (user == null)
//            {
//                return RedirectToAction("Login", "Account");
//            }

//            var token = await _userManager.GenerateUserTokenAsync(
//                user,
//                "Default",
//                "RefreshToken");

//            return !string.IsNullOrEmpty(returnUrl)
//                ? Redirect($"{returnUrl}?token={token}")
//                : RedirectToAction("Index", "Home");
//        }

//        [HttpPost("login")]
//        [AllowAnonymous]
//        public async Task<IActionResult> Login([FromBody] LoginModel model)
//        {
//            var user = await _userManager.FindByNameAsync(model.Username);
//            if (user == null)
//            {
//                return Unauthorized(new { Message = "Неверные учетные данные" });
//            }

//            var result = await _signInManager.CheckPasswordSignInAsync(user, model.Password, false);
//            if (!result.Succeeded)
//            {
//                return Unauthorized(new { Message = "Неверные учетные данные" });
//            }

//            var roles = await _userManager.GetRolesAsync(user);

//            // ПОЛУЧАЕМ: Claim о необходимости смены пароля
//            var claims = await _userManager.GetClaimsAsync(user);
//            var mustChangePasswordClaim = claims.FirstOrDefault(c => c.Type == "MustChangePassword");
//            var mustChangePassword = mustChangePasswordClaim != null && mustChangePasswordClaim.Value == "true";

//            // Генерация токена
//            var token = await GenerateJwtToken(user);

//            return Ok(new
//            {
//                Token = token,
//                User = new
//                {
//                    user.Id,
//                    user.UserName,
//                    user.Email,
//                    Role = roles.FirstOrDefault(),
//                    MustChangePassword = mustChangePassword // ← Передаем фронтенду
//                }
//            });
//        }

//        private async Task<string> GenerateJwtToken(IdentityUser user)
//        {
//            var tokenHandler = new JwtSecurityTokenHandler();
//            var key = Encoding.ASCII.GetBytes(_configuration["JwtSettings:Secret"]);

//            // Получаем claims пользователя
//            var claims = new List<Claim>
//    {
//        new Claim(ClaimTypes.Name, user.UserName),
//        new Claim(ClaimTypes.Email, user.Email),
//        new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
//    };

//            // ДОБАВЛЯЕМ: Кастомные claims
//            var userClaims = await _userManager.GetClaimsAsync(user);
//            claims.AddRange(userClaims);

//            var tokenDescriptor = new SecurityTokenDescriptor
//            {
//                Subject = new ClaimsIdentity(claims),
//                Expires = DateTime.UtcNow.AddMinutes(
//                    int.Parse(_configuration["JwtSettings:ExpiryMinutes"])),
//                SigningCredentials = new SigningCredentials(
//                    new SymmetricSecurityKey(key),
//                    SecurityAlgorithms.HmacSha256Signature)
//            };

//            var token = tokenHandler.CreateToken(tokenDescriptor);
//            return tokenHandler.WriteToken(token);
//        }

//        [HttpGet("current-user")]
//        [Authorize]
//        public async Task<IActionResult> GetCurrentUser()
//        {
//            var user = await _userManager.GetUserAsync(User);
//            if (user == null)
//            {
//                return NotFound(new { Message = "Пользователь не найден" });
//            }

//            var roles = await _userManager.GetRolesAsync(user);

//            return Ok(new
//            {
//                user.Id,
//                user.UserName,
//                user.Email,
//                Role = roles.FirstOrDefault(),
//                MustChangePassword = false
//            });
//        }

//        [HttpPost("logout")]
//        [Authorize]
//        public async Task<IActionResult> Logout()
//        {
//            await _signInManager.SignOutAsync();
//            return Ok(new { Message = "Logged out successfully" });
//        }

//        [HttpDelete("user/{userId}")]
//        [Authorize(Roles = "admin")]
//        public async Task<IActionResult> DeleteUser(string userId)
//        {
//            try
//            {
//                var user = await _userManager.FindByIdAsync(userId);
//                if (user == null)
//                {
//                    return NotFound(new { Message = "Пользователь не найден" });
//                }

//                // Проверяем, не пытается ли пользователь удалить самого себя
//                var currentUser = await _userManager.GetUserAsync(User);
//                if (currentUser != null && currentUser.Id == userId)
//                {
//                    return BadRequest(new { Message = "Нельзя удалить собственный аккаунт" });
//                }

//                var result = await _userManager.DeleteAsync(user);
//                if (!result.Succeeded)
//                {
//                    var errors = string.Join(", ", result.Errors.Select(e => e.Description));
//                    return BadRequest(new { Message = $"Ошибка при удалении пользователя: {errors}" });
//                }

//                return Ok(new { Message = "Пользователь успешно удален" });
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, new { Message = $"Внутренняя ошибка сервера: {ex.Message}" });
//            }
//        }

//        [HttpPost("refresh-token")]
//        public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenModel model)
//        {
//            var principal = GetPrincipalFromExpiredToken(model.Token);
//            if (principal == null)
//            {
//                return BadRequest("Invalid token");
//            }

//            var user = await _userManager.FindByNameAsync(principal.Identity.Name);
//            if (user == null)
//            {
//                return BadRequest("Invalid token");
//            }

//            var newToken = GenerateJwtToken(user);
//            var newRefreshToken = await _userManager.GenerateUserTokenAsync(
//                user,
//                "Default",
//                "RefreshToken");

//            return Ok(new
//            {
//                Token = newToken,
//                RefreshToken = newRefreshToken,
//                ExpiresIn = DateTime.UtcNow.AddMinutes(
//                    int.Parse(_configuration["JwtSettings:ExpiryMinutes"]))
//            });
//        }

//        private string GenerateJwtToken(IdentityUser user)
//        {
//            var tokenHandler = new JwtSecurityTokenHandler();
//            var key = Encoding.ASCII.GetBytes(_configuration["JwtSettings:Secret"]);

//            var tokenDescriptor = new SecurityTokenDescriptor
//            {
//                Subject = new ClaimsIdentity(new[]
//                {
//            new Claim(ClaimTypes.Name, user.UserName),
//            new Claim(ClaimTypes.Email, user.Email),
//            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
//        }),
//                Expires = DateTime.UtcNow.AddMinutes(
//                    int.Parse(_configuration["JwtSettings:ExpiryMinutes"])),
//                SigningCredentials = new SigningCredentials(
//                    new SymmetricSecurityKey(key),
//                    SecurityAlgorithms.HmacSha256Signature)
//            };

//            var token = tokenHandler.CreateToken(tokenDescriptor);
//            return tokenHandler.WriteToken(token);
//        }

//        private ClaimsPrincipal GetPrincipalFromExpiredToken(string token)
//        {
//            var tokenValidationParameters = new TokenValidationParameters
//            {
//                ValidateAudience = false,
//                ValidateIssuer = false,
//                ValidateIssuerSigningKey = true,
//                IssuerSigningKey = new SymmetricSecurityKey(
//                    Encoding.UTF8.GetBytes(_configuration["JwtSettings:Secret"])),
//                ValidateLifetime = false // Мы проверяем просроченный токен
//            };

//            var tokenHandler = new JwtSecurityTokenHandler();
//            var principal = tokenHandler.ValidateToken(
//                token,
//                tokenValidationParameters,
//                out var securityToken);

//            if (securityToken is not JwtSecurityToken jwtSecurityToken ||
//                !jwtSecurityToken.Header.Alg.Equals(
//                    SecurityAlgorithms.HmacSha256,
//                    StringComparison.InvariantCultureIgnoreCase))
//            {
//                throw new SecurityTokenException("Invalid token");
//            }

//            return principal;
//        }

//        [HttpPost("change-password")]
//        [Authorize]
//        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordModel model)
//        {
//            try
//            {
//                var user = await _userManager.GetUserAsync(User);
//                if (user == null)
//                {
//                    return NotFound(new { Message = "Пользователь не найден" });
//                }

//                // Проверяем старый пароль
//                var result = await _userManager.CheckPasswordAsync(user, model.OldPassword);
//                if (!result)
//                {
//                    return BadRequest(new { Message = "Текущий пароль неверен" });
//                }

//                // Меняем пароль
//                var changeResult = await _userManager.ChangePasswordAsync(
//                    user,
//                    model.OldPassword,
//                    model.NewPassword
//                );

//                if (!changeResult.Succeeded)
//                {
//                    var errors = string.Join(", ", changeResult.Errors.Select(e => e.Description));
//                    return BadRequest(new { Message = $"Ошибка при смене пароля: {errors}" });
//                }

//                // УДАЛЯЕМ: Claim о необходимости смены пароля
//                var mustChangePasswordClaim = (await _userManager.GetClaimsAsync(user))
//                    .FirstOrDefault(c => c.Type == "MustChangePassword");

//                if (mustChangePasswordClaim != null)
//                {
//                    await _userManager.RemoveClaimAsync(user, mustChangePasswordClaim);
//                }

//                // Генерируем новый токен без claim о смене пароля
//                var newToken = await GenerateJwtToken(user);

//                return Ok(new
//                {
//                    Message = "Пароль успешно изменен",
//                    Token = newToken,
//                    MustChangePassword = false
//                });
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, new { Message = $"Внутренняя ошибка сервера: {ex.Message}" });
//            }
//        }

//        public class ChangePasswordModel
//        {
//            public string OldPassword { get; set; } = string.Empty;
//            public string NewPassword { get; set; } = string.Empty;
//            public string ConfirmPassword { get; set; } = string.Empty;
//        }

//        // Модели данных
//        public class LoginModel
//        {
//            public string Username { get; set; } = string.Empty;
//            public string Password { get; set; } = string.Empty;
//        }

//        public class RegisterModel
//        {
//            public string Username { get; set; } = string.Empty;
//            public string Email { get; set; } = string.Empty;
//            public string Password { get; set; } = string.Empty;
//            public string FirstName { get; set; } = string.Empty;
//            public string LastName { get; set; } = string.Empty;
//            public string? MiddleName { get; set; }
//            public string? Position { get; set; }
//            public string Role { get; set; } = "user";
//        }

//        public class RefreshTokenModel
//        {
//            public string Token { get; set; } = string.Empty;
//        }
//    }
//}

// WebPodryd_Identity/Controllers/AccountController.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace WebPodryd_Identity.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class AccountController : ControllerBase
    {
        private readonly UserManager<IdentityUser> _userManager;
        private readonly SignInManager<IdentityUser> _signInManager;
        private readonly IConfiguration _configuration;

        public AccountController(
            UserManager<IdentityUser> userManager,
            SignInManager<IdentityUser> signInManager,
            IConfiguration configuration)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _configuration = configuration;
        }

        // ЕДИНСТВЕННЫЙ метод GenerateJwtToken
        private async Task<string> GenerateJwtToken(IdentityUser user)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_configuration["JwtSettings:Secret"]);

            // Получаем claims пользователя
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.Name, user.UserName),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            // Добавляем кастомные claims
            var userClaims = await _userManager.GetClaimsAsync(user);
            claims.AddRange(userClaims);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddMinutes(
                    int.Parse(_configuration["JwtSettings:ExpiryMinutes"])),
                SigningCredentials = new SigningCredentials(
                    new SymmetricSecurityKey(key),
                    SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

        [HttpPost("register")]
        [AllowAnonymous]
        public async Task<IActionResult> Register([FromBody] RegisterModel model)
        {
            try
            {
                // Проверяем, существует ли пользователь с таким email
                var existingUserByEmail = await _userManager.FindByEmailAsync(model.Email);
                if (existingUserByEmail != null)
                {
                    return BadRequest(new { Message = "Пользователь с таким email уже существует" });
                }

                // Проверяем, существует ли пользователь с таким username
                var existingUserByUsername = await _userManager.FindByNameAsync(model.Username);
                if (existingUserByUsername != null)
                {
                    return BadRequest(new { Message = "Пользователь с таким username уже существует" });
                }

                // Создаем нового пользователя
                var user = new IdentityUser
                {
                    UserName = model.Username,
                    Email = model.Email
                };

                var result = await _userManager.CreateAsync(user, model.Password);

                if (!result.Succeeded)
                {
                    var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                    return BadRequest(new { Message = $"Ошибка при создании пользователя: {errors}" });
                }

                // Устанавливаем claim о необходимости смены пароля
                await _userManager.AddClaimAsync(user, new Claim("MustChangePassword", "true"));

                // Добавляем роль пользователю
                if (!string.IsNullOrEmpty(model.Role))
                {
                    var roleResult = await _userManager.AddToRoleAsync(user, model.Role);
                    if (!roleResult.Succeeded)
                    {
                        Console.WriteLine($"Ошибка при назначении роли: {string.Join(", ", roleResult.Errors.Select(e => e.Description))}");
                    }
                }

                return Ok(new
                {
                    Message = "Пользователь успешно создан",
                    UserId = user.Id,
                    Username = user.UserName,
                    user.Email,
                    MustChangePassword = true
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = $"Внутренняя ошибка сервера: {ex.Message}" });
            }
        }

        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<IActionResult> Login([FromBody] LoginModel model)
        {
            var user = await _userManager.FindByNameAsync(model.Username);
            if (user == null)
            {
                return Unauthorized(new { Message = "Неверные учетные данные" });
            }

            var result = await _signInManager.CheckPasswordSignInAsync(user, model.Password, false);
            if (!result.Succeeded)
            {
                return Unauthorized(new { Message = "Неверные учетные данные" });
            }

            var roles = await _userManager.GetRolesAsync(user);

            // Получаем Claim о необходимости смены пароля
            var claims = await _userManager.GetClaimsAsync(user);
            var mustChangePasswordClaim = claims.FirstOrDefault(c => c.Type == "MustChangePassword");
            var mustChangePassword = mustChangePasswordClaim != null && mustChangePasswordClaim.Value == "true";

            // Генерация токена
            var token = await GenerateJwtToken(user);

            return Ok(new
            {
                Token = token,
                User = new
                {
                    user.Id,
                    user.UserName,
                    user.Email,
                    Role = roles.FirstOrDefault(),
                    MustChangePassword = mustChangePassword
                }
            });
        }

        [HttpPost("change-password")]
        [Authorize]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordModel model)
        {
            try
            {
                var user = await _userManager.GetUserAsync(User);
                if (user == null)
                {
                    return NotFound(new { Message = "Пользователь не найден" });
                }

                // Проверяем старый пароль
                var result = await _userManager.CheckPasswordAsync(user, model.OldPassword);
                if (!result)
                {
                    return BadRequest(new { Message = "Текущий пароль неверен" });
                }

                // Меняем пароль
                var changeResult = await _userManager.ChangePasswordAsync(
                    user,
                    model.OldPassword,
                    model.NewPassword
                );

                if (!changeResult.Succeeded)
                {
                    var errors = string.Join(", ", changeResult.Errors.Select(e => e.Description));
                    return BadRequest(new { Message = $"Ошибка при смене пароля: {errors}" });
                }

                // Удаляем claim о необходимости смены пароля
                var mustChangePasswordClaim = (await _userManager.GetClaimsAsync(user))
                    .FirstOrDefault(c => c.Type == "MustChangePassword");

                if (mustChangePasswordClaim != null)
                {
                    await _userManager.RemoveClaimAsync(user, mustChangePasswordClaim);
                }

                // Генерируем новый токен без claim о смене пароля
                var newToken = await GenerateJwtToken(user);

                return Ok(new
                {
                    Message = "Пароль успешно изменен",
                    Token = newToken,
                    MustChangePassword = false
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = $"Внутренняя ошибка сервера: {ex.Message}" });
            }
        }

        [HttpGet("current-user")]
        [Authorize]
        public async Task<IActionResult> GetCurrentUser()
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null)
            {
                return NotFound(new { Message = "Пользователь не найден" });
            }

            var roles = await _userManager.GetRolesAsync(user);

            // Получаем Claim о необходимости смены пароля
            var claims = await _userManager.GetClaimsAsync(user);
            var mustChangePasswordClaim = claims.FirstOrDefault(c => c.Type == "MustChangePassword");
            var mustChangePassword = mustChangePasswordClaim != null && mustChangePasswordClaim.Value == "true";

            return Ok(new
            {
                user.Id,
                user.UserName,
                user.Email,
                Role = roles.FirstOrDefault(),
                MustChangePassword = mustChangePassword
            });
        }

        // УДАЛИТЕ все остальные методы GenerateJwtToken и RefreshToken если они есть ниже

        // Модели данных
        public class LoginModel
        {
            public string Username { get; set; } = string.Empty;
            public string Password { get; set; } = string.Empty;
        }

        public class RegisterModel
        {
            public string Username { get; set; } = string.Empty;
            public string Email { get; set; } = string.Empty;
            public string Password { get; set; } = string.Empty;
            public string FirstName { get; set; } = string.Empty;
            public string LastName { get; set; } = string.Empty;
            public string MiddleName { get; set; } = string.Empty;
            public string Position { get; set; } = string.Empty;
            public string Role { get; set; } = "user";
        }

        public class ChangePasswordModel
        {
            public string OldPassword { get; set; } = string.Empty;
            public string NewPassword { get; set; } = string.Empty;
            public string ConfirmPassword { get; set; } = string.Empty;
        }
    }
}
