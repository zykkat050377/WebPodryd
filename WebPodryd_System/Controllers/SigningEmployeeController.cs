//WebPodryd_System / Controllers / SigningEmployeeController.cs

using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using WebPodryd_System.Data;
using WebPodryd_System.Models;
using WebPodryd_System.DTO;

namespace WebPodryd_System.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [EnableCors("AllowFrontend")]
    public class SigningEmployeeController : ControllerBase
    {
        private readonly AppDbContext _context;

        public SigningEmployeeController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/SigningEmployee
        [HttpGet]
        public async Task<ActionResult<IEnumerable<SigningEmployeeDto>>> GetSigningEmployees()
        {
            try
            {
                var employees = await _context.SigningEmployees
                    .OrderBy(e => e.LastName)
                    .ThenBy(e => e.FirstName)
                    .Select(e => new SigningEmployeeDto
                    {
                        Id = e.Id,
                        LastName = e.LastName,
                        FirstName = e.FirstName,
                        MiddleName = e.MiddleName,
                        Position = e.Position,
                        WarrantNumber = e.WarrantNumber,
                        StartDate = e.StartDate,
                        EndDate = e.EndDate
                    })
                    .ToListAsync();

                return Ok(employees);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Ошибка при получении списка сотрудников: {ex.Message}");
            }
        }

        // GET: api/SigningEmployee/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<SigningEmployeeDto>> GetSigningEmployee(int id)
        {
            try
            {
                var employee = await _context.SigningEmployees
                    .Where(e => e.Id == id)
                    .Select(e => new SigningEmployeeDto
                    {
                        Id = e.Id,
                        LastName = e.LastName,
                        FirstName = e.FirstName,
                        MiddleName = e.MiddleName,
                        Position = e.Position,
                        WarrantNumber = e.WarrantNumber,
                        StartDate = e.StartDate,
                        EndDate = e.EndDate
                    })
                    .FirstOrDefaultAsync();

                if (employee == null)
                {
                    return NotFound("Сотрудник не найден");
                }

                return Ok(employee);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Ошибка при получении данных сотрудника: {ex.Message}");
            }
        }

        // POST: api/SigningEmployee
        [HttpPost]
        public async Task<ActionResult<SigningEmployeeDto>> CreateSigningEmployee([FromBody] CreateSigningEmployeeDto createDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var employee = new SigningEmployee
                {
                    LastName = createDto.LastName,
                    FirstName = createDto.FirstName,
                    MiddleName = createDto.MiddleName,
                    Position = createDto.Position,
                    WarrantNumber = createDto.WarrantNumber,
                    StartDate = createDto.StartDate,
                    EndDate = createDto.EndDate,
                    CreatedAt = DateTime.UtcNow,
                    CreatedBy = User.Identity?.Name ?? "system"
                };

                _context.SigningEmployees.Add(employee);
                await _context.SaveChangesAsync();

                var result = new SigningEmployeeDto
                {
                    Id = employee.Id,
                    LastName = employee.LastName,
                    FirstName = employee.FirstName,
                    MiddleName = employee.MiddleName,
                    Position = employee.Position,
                    WarrantNumber = employee.WarrantNumber,
                    StartDate = employee.StartDate,
                    EndDate = employee.EndDate
                };

                return CreatedAtAction(nameof(GetSigningEmployee), new { id = employee.Id }, result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Ошибка при создании сотрудника: {ex.Message}");
            }
        }

        // PUT: api/SigningEmployee/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateSigningEmployee(int id, [FromBody] UpdateSigningEmployeeDto updateDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var employee = await _context.SigningEmployees.FindAsync(id);
                if (employee == null)
                {
                    return NotFound("Сотрудник не найден");
                }

                employee.LastName = updateDto.LastName;
                employee.FirstName = updateDto.FirstName;
                employee.MiddleName = updateDto.MiddleName;
                employee.Position = updateDto.Position;
                employee.WarrantNumber = updateDto.WarrantNumber;
                employee.StartDate = updateDto.StartDate;
                employee.EndDate = updateDto.EndDate;
                employee.UpdatedAt = DateTime.UtcNow;
                employee.UpdatedBy = User.Identity?.Name ?? "system";

                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Ошибка при обновлении сотрудника: {ex.Message}");
            }
        }

        // DELETE: api/SigningEmployee/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSigningEmployee(int id)
        {
            try
            {
                var employee = await _context.SigningEmployees.FindAsync(id);
                if (employee == null)
                {
                    return NotFound("Сотрудник не найден");
                }

                _context.SigningEmployees.Remove(employee);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Ошибка при удалении сотрудника: {ex.Message}");
            }
        }
    }
}