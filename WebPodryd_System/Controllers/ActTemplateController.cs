// WebPodryd_System/Controllers/ActTemplateController.cs
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Text.Json;
using WebPodryd_System.Data;
using WebPodryd_System.Models;
using WebPodryd_System.DTO;

namespace WebPodryd_System.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ActTemplateController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ActTemplateController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/ActTemplate
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ActTemplateDto>>> GetActTemplates(
            [FromQuery] int? contractTypeId = null,
            [FromQuery] string search = null,
            [FromQuery] int? departmentId = null)
        {
            try
            {
                var query = _context.ActTemplates
                    .Include(at => at.ContractType)
                    .Include(at => at.ContractTemplate)
                    .Include(at => at.Department)
                    .AsQueryable();

                if (contractTypeId.HasValue)
                {
                    query = query.Where(at => at.ContractTypeId == contractTypeId.Value);
                }

                if (departmentId.HasValue)
                {
                    query = query.Where(at => at.DepartmentId == departmentId.Value);
                }

                if (!string.IsNullOrEmpty(search))
                {
                    query = query.Where(at => at.Name.Contains(search) ||
                                             at.WorkServicesJson.Contains(search));
                }

                var actTemplates = await query.ToListAsync();
                var result = actTemplates.Select(at => MapToDto(at)).ToList();

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Ошибка при получении шаблонов актов: {ex.Message}" });
            }
        }

        // GET: api/ActTemplate/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<ActTemplateDto>> GetActTemplate(int id)
        {
            try
            {
                var actTemplate = await _context.ActTemplates
                    .Include(at => at.ContractType)
                    .Include(at => at.ContractTemplate)
                    .Include(at => at.Department)
                    .FirstOrDefaultAsync(at => at.Id == id);

                if (actTemplate == null)
                {
                    return NotFound(new { message = "Шаблон акта не найден" });
                }

                return Ok(MapToDto(actTemplate));
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Ошибка при получении шаблона акта: {ex.Message}" });
            }
        }

        // POST: api/ActTemplate
        [HttpPost]
        public async Task<ActionResult<ActTemplateDto>> CreateActTemplate([FromBody] CreateActTemplateDto createDto)
        {
            try
            {
                if (createDto.WorkServices == null || !createDto.WorkServices.Any())
                {
                    return BadRequest(new { message = "Должна быть указана хотя бы одна работа/услуга" });
                }

                // Проверка существования связанных сущностей
                var contractType = await _context.ContractTypes.FindAsync(createDto.ContractTypeId);
                var contractTemplate = await _context.ContractTemplates.FindAsync(createDto.ContractTemplateId);
                var department = await _context.Departments.FindAsync(createDto.DepartmentId);

                if (contractType == null)
                    return BadRequest(new { message = "Тип договора не существует" });
                if (contractTemplate == null)
                    return BadRequest(new { message = "Шаблон договора не существует" });
                if (department == null)
                    return BadRequest(new { message = "Департамент не существует" });

                var actTemplate = new ActTemplate
                {
                    Name = createDto.Name,
                    ContractTypeId = createDto.ContractTypeId,
                    ContractTemplateId = createDto.ContractTemplateId,
                    WorkServicesJson = JsonSerializer.Serialize(createDto.WorkServices),
                    DepartmentId = createDto.DepartmentId,
                    TotalCost = createDto.TotalCost,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _context.ActTemplates.Add(actTemplate);
                await _context.SaveChangesAsync();

                // Загружаем связанные данные для ответа
                await _context.Entry(actTemplate).Reference(at => at.ContractType).LoadAsync();
                await _context.Entry(actTemplate).Reference(at => at.ContractTemplate).LoadAsync();
                await _context.Entry(actTemplate).Reference(at => at.Department).LoadAsync();

                var result = MapToDto(actTemplate);
                return CreatedAtAction(nameof(GetActTemplate), new { id = actTemplate.Id }, result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Ошибка при создании шаблона акта: {ex.Message}" });
            }
        }

        // PUT: api/ActTemplate/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateActTemplate(int id, [FromBody] UpdateActTemplateDto updateDto)
        {
            try
            {
                var actTemplate = await _context.ActTemplates.FindAsync(id);
                if (actTemplate == null)
                {
                    return NotFound(new { message = "Шаблон акта не найден" });
                }

                // Обновляем только переданные поля
                if (!string.IsNullOrEmpty(updateDto.Name))
                {
                    actTemplate.Name = updateDto.Name;
                }

                if (updateDto.ContractTypeId.HasValue)
                {
                    actTemplate.ContractTypeId = updateDto.ContractTypeId.Value;
                }

                if (updateDto.ContractTemplateId.HasValue)
                {
                    actTemplate.ContractTemplateId = updateDto.ContractTemplateId.Value;
                }

                if (updateDto.WorkServices != null)
                {
                    actTemplate.WorkServicesJson = JsonSerializer.Serialize(updateDto.WorkServices);
                }

                if (updateDto.DepartmentId.HasValue)
                {
                    actTemplate.DepartmentId = updateDto.DepartmentId.Value;
                }

                if (updateDto.TotalCost.HasValue)
                {
                    actTemplate.TotalCost = updateDto.TotalCost.Value;
                }

                actTemplate.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Ошибка при обновлении шаблона акта: {ex.Message}" });
            }
        }

        // DELETE: api/ActTemplate/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteActTemplate(int id)
        {
            try
            {
                var actTemplate = await _context.ActTemplates.FindAsync(id);
                if (actTemplate == null)
                {
                    return NotFound(new { message = "Шаблон акта не найден" });
                }

                _context.ActTemplates.Remove(actTemplate);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (DbUpdateException dbEx)
            {
                Console.WriteLine($"Database error during act template deletion: {dbEx.Message}");
                Console.WriteLine($"Inner exception: {dbEx.InnerException?.Message}");

                // Более детальная обработка ошибок базы данных
                if (dbEx.InnerException?.Message.Contains("FOREIGN KEY constraint") == true)
                {
                    return BadRequest(new
                    {
                        message = "Невозможно удалить шаблон акта",
                        details = "Существуют зависимые записи в системе"
                    });
                }

                return StatusCode(500, new
                {
                    message = "Ошибка базы данных при удалении шаблона акта",
                    details = dbEx.InnerException?.Message ?? dbEx.Message
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error deleting act template: {ex.Message}");
                return StatusCode(500, new
                {
                    message = "Ошибка при удалении шаблона акта",
                    details = ex.Message
                });
            }
        }

        // GET: api/ActTemplate/by-contract-type/{contractTypeId}
        [HttpGet("by-contract-type/{contractTypeId}")]
        public async Task<ActionResult<IEnumerable<ActTemplateDto>>> GetActTemplatesByContractType(int contractTypeId)
        {
            try
            {
                var actTemplates = await _context.ActTemplates
                    .Include(at => at.ContractType)
                    .Include(at => at.ContractTemplate)
                    .Include(at => at.Department)
                    .Where(at => at.ContractTypeId == contractTypeId)
                    .ToListAsync();

                var result = actTemplates.Select(at => MapToDto(at)).ToList();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Ошибка при получении шаблонов актов по типу: {ex.Message}" });
            }
        }

        // Вспомогательный метод для маппинга Entity -> DTO
        private static ActTemplateDto MapToDto(ActTemplate actTemplate)
        {
            return new ActTemplateDto
            {
                Id = actTemplate.Id,
                Name = actTemplate.Name,
                ContractTypeId = actTemplate.ContractTypeId,
                ContractType = actTemplate.ContractType != null ? new ContractTypeDto
                {
                    Id = actTemplate.ContractType.Id,
                    Name = actTemplate.ContractType.Name,
                    Code = actTemplate.ContractType.Code,
                    Description = actTemplate.ContractType.Description,
                    CreatedAt = actTemplate.ContractType.CreatedAt,
                    UpdatedAt = actTemplate.ContractType.UpdatedAt
                } : null,
                ContractTemplateId = actTemplate.ContractTemplateId,
                ContractTemplate = actTemplate.ContractTemplate != null ? new ContractTemplateDto
                {
                    Id = actTemplate.ContractTemplate.Id,
                    Name = actTemplate.ContractTemplate.Name,
                    Type = actTemplate.ContractTemplate.Type,
                    ContractTypeId = actTemplate.ContractTemplate.ContractTypeId,
                    WorkServices = ParseWorkServices(actTemplate.ContractTemplate.WorkServicesJson),
                    CreatedAt = actTemplate.ContractTemplate.CreatedAt,
                    UpdatedAt = actTemplate.ContractTemplate.UpdatedAt
                } : null,
                WorkServices = ParseWorkServicesWithCost(actTemplate.WorkServicesJson),
                DepartmentId = actTemplate.DepartmentId,
                Department = actTemplate.Department != null ? new DepartmentDto
                {
                    Id = actTemplate.Department.Id,
                    Name = actTemplate.Department.Name,
                    Code = actTemplate.Department.Code
                } : null,
                TotalCost = actTemplate.TotalCost,
                CreatedAt = actTemplate.CreatedAt,
                UpdatedAt = actTemplate.UpdatedAt
            };
        }

        // Вспомогательные методы для парсинга JSON
        private static List<string> ParseWorkServices(string workServicesJson)
        {
            try
            {
                return string.IsNullOrEmpty(workServicesJson)
                    ? new List<string>()
                    : JsonSerializer.Deserialize<List<string>>(workServicesJson) ?? new List<string>();
            }
            catch
            {
                return new List<string>();
            }
        }

        private static List<WorkServiceDto> ParseWorkServicesWithCost(string workServicesJson)
        {
            try
            {
                return string.IsNullOrEmpty(workServicesJson)
                    ? new List<WorkServiceDto>()
                    : JsonSerializer.Deserialize<List<WorkServiceDto>>(workServicesJson) ?? new List<WorkServiceDto>();
            }
            catch
            {
                return new List<WorkServiceDto>();
            }
        }
    }
}