//WebPodryd_Identity/Controllers/UserController.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using WebPodryd_Identity.Models;

namespace WebPodryd_Identity.Controllers
{
    [ApiController]
    [Route("[controller]")]
    [Authorize]
    public class UserController : ControllerBase
    {
        private readonly UserManager<IdentityUser> _userManager;

        public UserController(UserManager<IdentityUser> userManager)
        {
            _userManager = userManager;
        }

        [HttpGet("user/{id}")]
        public async Task<IActionResult> GetUserById(string id)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null)
            {
                return NotFound();
            }

            var roles = await _userManager.GetRolesAsync(user);

            return Ok(new
            {
                user.Id,
                user.UserName,
                user.Email,
                Role = roles.FirstOrDefault() ?? "user"
            });
        }


        //[HttpPost("change-password")]
        //[Authorize]
        //public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordModel model)
        //{
        //    try
        //    {
        //        var user = await _userManager.GetUserAsync(User);
        //        if (user == null)
        //        {
        //            return NotFound(new { Message = "Пользователь не найден" });
        //        }

        //        // Проверяем старый пароль
        //        var result = await _userManager.CheckPasswordAsync(user, model.OldPassword);
        //        if (!result)
        //        {
        //            return BadRequest(new { Message = "Текущий пароль неверен" });
        //        }

        //        // Меняем пароль
        //        var changeResult = await _userManager.ChangePasswordAsync(
        //            user,
        //            model.OldPassword,
        //            model.NewPassword
        //        );

        //        if (!changeResult.Succeeded)
        //        {
        //            var errors = string.Join(", ", changeResult.Errors.Select(e => e.Description));
        //            return BadRequest(new { Message = $"Ошибка при смене пароля: {errors}" });
        //        }

        //        // Сбрасываем флаг обязательной смены пароля
        //        user.MustChangePassword = false;
        //        user.LastPasswordChange = DateTime.UtcNow;
        //        await _userManager.UpdateAsync(user);

        //        // Генерируем новый токен
        //        var token = await _userManager.GenerateUserTokenAsync(user, "Default", "AuthToken");

        //        return Ok(new
        //        {
        //            Message = "Пароль успешно изменен",
        //            Token = token
        //        });
        //    }
        //    catch (Exception ex)
        //    {
        //        return StatusCode(500, new { Message = $"Внутренняя ошибка сервера: {ex.Message}" });
        //    }
        //}

        //public class ChangePasswordModel
        //{
        //    public string OldPassword { get; set; } = string.Empty;
        //    public string NewPassword { get; set; } = string.Empty;
        //    public string ConfirmPassword { get; set; } = string.Empty;
        //}


        [HttpGet("all")]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = _userManager.Users.ToList();
            var userDtos = new List<object>();

            foreach (var user in users)
            {
                var roles = await _userManager.GetRolesAsync(user);
                userDtos.Add(new
                {
                    user.Id,
                    user.UserName,
                    user.Email,
                    Role = roles.FirstOrDefault() ?? "user"
                });
            }

            return Ok(userDtos);
        }
    }
}
