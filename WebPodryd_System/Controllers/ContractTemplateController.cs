// WebPodryd_System/Controllers/ContractTemplateController.cs
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
using ContractTemplateDto = WebPodryd_System.DTO.ContractTemplateDto;
using UpdateContractTemplateDto = WebPodryd_System.DTO.UpdateContractTemplateDto;
using CreateContractTemplateDto = WebPodryd_System.DTO.CreateContractTemplateDto;

namespace WebPodryd_System.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ContractTemplateController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly JsonSerializerOptions _jsonOptions;

        public ContractTemplateController(AppDbContext context)
        {
            _context = context;
            _jsonOptions = new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                WriteIndented = false
            };
        }

        // GET: api/contracttemplate
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ContractTemplateDto>>> GetContractTemplates(
            [FromQuery] string type = null,
            [FromQuery] int? contractTypeId = null,
            [FromQuery] string search = null)
        {
            try
            {
                Console.WriteLine($"Getting contract templates. Type: {type}, ContractTypeId: {contractTypeId}, Search: {search}");

                var query = _context.ContractTemplates
                    .Include(t => t.ContractType)
                    .AsQueryable();

                if (!string.IsNullOrEmpty(type) && type != "all")
                {
                    query = query.Where(t => t.ContractType.Code == type);
                }

                if (contractTypeId.HasValue && contractTypeId > 0)
                {
                    query = query.Where(t => t.ContractTypeId == contractTypeId.Value);
                }

                if (!string.IsNullOrEmpty(search))
                {
                    query = query.Where(t => t.Name.Contains(search) ||
                                           t.WorkServicesJson.Contains(search));
                }

                var templates = await query
                    .OrderBy(t => t.Name)
                    .ToListAsync();

                Console.WriteLine($"Found {templates.Count} templates");

                var result = new List<ContractTemplateDto>();
                foreach (var template in templates)
                {
                    List<string> workServices;
                    try
                    {
                        workServices = JsonSerializer.Deserialize<List<string>>(template.WorkServicesJson, _jsonOptions) ?? new List<string>();
                    }
                    catch (Exception jsonEx)
                    {
                        Console.WriteLine($"JSON deserialization error for template {template.Id}: {jsonEx.Message}");
                        workServices = new List<string>();
                    }

                    result.Add(new ContractTemplateDto
                    {
                        Id = template.Id,
                        Name = template.Name,
                        Type = template.Type,
                        ContractTypeId = template.ContractTypeId,
                        ContractType = new ContractTypeDto
                        {
                            Id = template.ContractType.Id,
                            Name = template.ContractType.Name,
                            Code = template.ContractType.Code,
                            Description = template.ContractType.Description
                        },
                        WorkServices = workServices,
                        CreatedAt = template.CreatedAt,
                        UpdatedAt = template.UpdatedAt
                    });
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting contract templates: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // GET: api/contracttemplate/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<ContractTemplateDto>> GetContractTemplate(int id)
        {
            try
            {
                Console.WriteLine($"Getting contract template with ID: {id}");

                var template = await _context.ContractTemplates
                    .Include(t => t.ContractType)
                    .FirstOrDefaultAsync(t => t.Id == id);

                if (template == null)
                {
                    Console.WriteLine($"Contract template with ID {id} not found");
                    return NotFound("Шаблон договора не найден");
                }

                List<string> workServices;
                try
                {
                    workServices = JsonSerializer.Deserialize<List<string>>(template.WorkServicesJson, _jsonOptions) ?? new List<string>();
                }
                catch (Exception jsonEx)
                {
                    Console.WriteLine($"JSON deserialization error for template {template.Id}: {jsonEx.Message}");
                    workServices = new List<string>();
                }

                var result = new ContractTemplateDto
                {
                    Id = template.Id,
                    Name = template.Name,
                    Type = template.Type,
                    ContractTypeId = template.ContractTypeId,
                    ContractType = new ContractTypeDto
                    {
                        Id = template.ContractType.Id,
                        Name = template.ContractType.Name,
                        Code = template.ContractType.Code,
                        Description = template.ContractType.Description
                    },
                    WorkServices = workServices,
                    CreatedAt = template.CreatedAt,
                    UpdatedAt = template.UpdatedAt
                };

                Console.WriteLine($"Successfully retrieved template {id}");
                return Ok(result);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting contract template {id}: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // POST: api/contracttemplate
        [HttpPost]
        public async Task<ActionResult<ContractTemplateDto>> CreateContractTemplate(CreateContractTemplateDto createDto)
        {
            try
            {
                Console.WriteLine($"Received create request: Name={createDto.Name}, ContractTypeId={createDto.ContractTypeId}, WorkServicesCount={createDto.WorkServices?.Count}");

                if (!ModelState.IsValid)
                {
                    var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage);
                    Console.WriteLine($"Model validation failed: {string.Join(", ", errors)}");
                    return BadRequest(new
                    {
                        Message = "Validation failed",
                        Errors = errors
                    });
                }

                // Проверяем существование типа договора
                var contractType = await _context.ContractTypes.FindAsync(createDto.ContractTypeId);
                if (contractType == null)
                {
                    Console.WriteLine($"Contract type with ID {createDto.ContractTypeId} not found");
                    return BadRequest("Указанный тип договора не найден");
                }

                // Сериализуем работы/услуги в JSON
                var workServicesJson = "[]";
                if (createDto.WorkServices != null && createDto.WorkServices.Any())
                {
                    try
                    {
                        workServicesJson = JsonSerializer.Serialize(createDto.WorkServices, _jsonOptions);
                        Console.WriteLine($"Serialized work services: {workServicesJson}");
                    }
                    catch (Exception jsonEx)
                    {
                        Console.WriteLine($"JSON serialization error: {jsonEx.Message}");
                        return BadRequest($"Ошибка сериализации работ/услуг: {jsonEx.Message}");
                    }
                }
                else
                {
                    Console.WriteLine("No work services provided, using empty array");
                }

                // ИСПРАВЛЕНИЕ: DepartmentId не обязателен для ContractTemplate
                var template = new ContractTemplate
                {
                    Name = createDto.Name.Trim(),
                    Type = contractType.Code,
                    ContractTypeId = createDto.ContractTypeId,
                    WorkServicesJson = workServicesJson,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                    CreatedBy = createDto.CreatedBy,
                    UpdatedBy = createDto.UpdatedBy
                    // DepartmentId и Cost убраны
                };

                Console.WriteLine($"Creating template: Name={template.Name}, Type={template.Type}, ContractTypeId={template.ContractTypeId}");

                _context.ContractTemplates.Add(template);

                try
                {
                    await _context.SaveChangesAsync();
                    Console.WriteLine($"Template created successfully with ID: {template.Id}");
                }
                catch (DbUpdateException dbEx)
                {
                    Console.WriteLine($"Database error: {dbEx.Message}");
                    Console.WriteLine($"Inner exception: {dbEx.InnerException?.Message}");
                    Console.WriteLine($"Stack trace: {dbEx.StackTrace}");
                    return StatusCode(500, $"Ошибка базы данных: {dbEx.InnerException?.Message ?? dbEx.Message}");
                }

                // Загружаем связанные данные
                await _context.Entry(template)
                    .Reference(t => t.ContractType)
                    .LoadAsync();

                // Десериализуем работы/услуги для ответа
                List<string> workServices;
                try
                {
                    workServices = JsonSerializer.Deserialize<List<string>>(template.WorkServicesJson, _jsonOptions) ?? new List<string>();
                }
                catch (Exception jsonEx)
                {
                    Console.WriteLine($"JSON deserialization error: {jsonEx.Message}");
                    workServices = new List<string>();
                }

                var result = new ContractTemplateDto
                {
                    Id = template.Id,
                    Name = template.Name,
                    Type = template.Type,
                    ContractTypeId = template.ContractTypeId,
                    ContractType = new ContractTypeDto
                    {
                        Id = template.ContractType.Id,
                        Name = template.ContractType.Name,
                        Code = template.ContractType.Code,
                        Description = template.ContractType.Description
                    },
                    WorkServices = workServices,
                    CreatedAt = template.CreatedAt,
                    UpdatedAt = template.UpdatedAt
                };

                Console.WriteLine($"Returning created template with ID: {result.Id}");
                return CreatedAtAction(nameof(GetContractTemplate), new { id = template.Id }, result);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Unhandled exception in CreateContractTemplate: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                if (ex.InnerException != null)
                {
                    Console.WriteLine($"Inner exception: {ex.InnerException.Message}");
                }
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // PUT: api/contracttemplate/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateContractTemplate(int id, UpdateContractTemplateDto updateDto)
        {
            try
            {
                Console.WriteLine($"Received update request for ID {id}");

                var template = await _context.ContractTemplates
                    .Include(t => t.ContractType)
                    .FirstOrDefaultAsync(t => t.Id == id);

                if (template == null)
                {
                    Console.WriteLine($"Contract template with ID {id} not found");
                    return NotFound("Шаблон договора не найден");
                }

                Console.WriteLine($"Found template: {template.Name}, Current ContractTypeId: {template.ContractTypeId}");

                // Обновляем только переданные поля
                if (!string.IsNullOrEmpty(updateDto.Name))
                {
                    template.Name = updateDto.Name.Trim();
                    Console.WriteLine($"Updating name to: {template.Name}");
                }

                // Если передан ContractTypeId, обновляем его и Type
                if (updateDto.ContractTypeId.HasValue)
                {
                    var contractType = await _context.ContractTypes.FindAsync(updateDto.ContractTypeId.Value);
                    if (contractType == null)
                    {
                        Console.WriteLine($"Contract type with ID {updateDto.ContractTypeId.Value} not found");
                        return BadRequest("Указанный тип договора не найден");
                    }
                    template.ContractTypeId = updateDto.ContractTypeId.Value;
                    template.Type = contractType.Code; // Обновляем Type
                    Console.WriteLine($"Updated ContractTypeId to: {template.ContractTypeId}, Type to: {template.Type}");
                }

                // Обновляем работы/услуги если переданы
                if (updateDto.WorkServices != null)
                {
                    try
                    {
                        template.WorkServicesJson = JsonSerializer.Serialize(updateDto.WorkServices, _jsonOptions);
                        Console.WriteLine($"Updated work services, count: {updateDto.WorkServices.Count}");
                    }
                    catch (Exception jsonEx)
                    {
                        Console.WriteLine($"JSON serialization error: {jsonEx.Message}");
                        return BadRequest($"Ошибка сериализации работ/услуг: {jsonEx.Message}");
                    }
                }

                template.UpdatedAt = DateTime.UtcNow;
                template.UpdatedBy = updateDto.UpdatedBy;
                Console.WriteLine($"Updated timestamp to: {template.UpdatedAt}");

                try
                {
                    await _context.SaveChangesAsync();
                    Console.WriteLine($"Template {id} updated successfully");
                }
                catch (DbUpdateException dbEx)
                {
                    Console.WriteLine($"Database update error: {dbEx.Message}");
                    Console.WriteLine($"Inner exception: {dbEx.InnerException?.Message}");
                    Console.WriteLine($"Stack trace: {dbEx.StackTrace}");
                    return StatusCode(500, $"Ошибка базы данных: {dbEx.InnerException?.Message ?? dbEx.Message}");
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Unhandled exception in UpdateContractTemplate: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                if (ex.InnerException != null)
                {
                    Console.WriteLine($"Inner exception: {ex.InnerException.Message}");
                }
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // DELETE: api/contracttemplate/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteContractTemplate(int id)
        {
            try
            {
                Console.WriteLine($"Deleting contract template with ID: {id}");

                var template = await _context.ContractTemplates
                    .Include(t => t.ActTemplates)
                    .FirstOrDefaultAsync(t => t.Id == id);

                if (template == null)
                {
                    Console.WriteLine($"Contract template with ID {id} not found");
                    return NotFound(new { message = "Шаблон договора не найден" });
                }

                // Проверяем, есть ли зависимые ActTemplate
                if (template.ActTemplates != null && template.ActTemplates.Any())
                {
                    var dependentCount = template.ActTemplates.Count;
                    Console.WriteLine($"Cannot delete template {id} - it has {dependentCount} dependent act templates");

                    return BadRequest(new
                    {
                        message = "Невозможно удалить шаблон договора",
                        details = $"Существуют {dependentCount} зависимых шаблонов актов. Сначала удалите их.",
                        dependentActTemplatesCount = dependentCount
                    });
                }

                _context.ContractTemplates.Remove(template);
                await _context.SaveChangesAsync();

                Console.WriteLine($"Contract template {id} deleted successfully");
                return NoContent();
            }
            catch (DbUpdateException dbEx)
            {
                Console.WriteLine($"Database error during delete: {dbEx.Message}");
                Console.WriteLine($"Inner exception: {dbEx.InnerException?.Message}");

                return StatusCode(500, new
                {
                    message = "Ошибка базы данных",
                    details = dbEx.InnerException?.Message ?? dbEx.Message
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error deleting contract template {id}: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                return StatusCode(500, new
                {
                    message = "Внутренняя ошибка сервера",
                    details = ex.Message
                });
            }
        }

        // DELETE: api/contracttemplate/{id}/with-dependencies
        [HttpDelete("{id}/with-dependencies")]
        public async Task<IActionResult> DeleteContractTemplateWithDependencies(int id)
        {
            try
            {
                var template = await _context.ContractTemplates
                    .Include(t => t.ActTemplates)
                    .FirstOrDefaultAsync(t => t.Id == id);

                if (template == null)
                {
                    return NotFound(new { message = "Шаблон договора не найден" });
                }

                // Удаляем зависимые ActTemplate
                if (template.ActTemplates != null && template.ActTemplates.Any())
                {
                    _context.ActTemplates.RemoveRange(template.ActTemplates);
                }

                // Удаляем основной template
                _context.ContractTemplates.Remove(template);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error deleting template with dependencies: {ex.Message}");
                return StatusCode(500, new
                {
                    message = "Ошибка при удалении шаблона с зависимостями",
                    details = ex.Message
                });
            }
        }


        // GET: api/contracttemplate/types
        [HttpGet("types")]
        public async Task<ActionResult<IEnumerable<object>>> GetContractTemplateTypes()
        {
            try
            {
                Console.WriteLine("Getting contract template types");

                var types = await _context.ContractTypes
                    .Select(ct => new
                    {
                        value = ct.Code,
                        label = ct.Name,
                        id = ct.Id
                    })
                    .ToListAsync();

                Console.WriteLine($"Found {types.Count} contract types");
                return Ok(types);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting contract template types: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // GET: api/contracttemplate/{type}/services
        [HttpGet("{type}/services")]
        public async Task<ActionResult<IEnumerable<string>>> GetWorkServicesByType(string type)
        {
            try
            {
                Console.WriteLine($"Getting work services for type: {type}");

                var templates = await _context.ContractTemplates
                    .Include(t => t.ContractType)
                    .Where(t => t.ContractType.Code == type)
                    .ToListAsync();

                var services = new List<string>();
                foreach (var template in templates)
                {
                    try
                    {
                        var templateServices = JsonSerializer.Deserialize<List<string>>(template.WorkServicesJson, _jsonOptions) ?? new List<string>();
                        services.AddRange(templateServices);
                    }
                    catch (Exception jsonEx)
                    {
                        Console.WriteLine($"JSON deserialization error for template {template.Id}: {jsonEx.Message}");
                        // Игнорируем ошибки десериализации
                    }
                }

                var distinctServices = services.Distinct().OrderBy(s => s).ToList();
                Console.WriteLine($"Found {distinctServices.Count} distinct services for type {type}");
                return Ok(distinctServices);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting work services for type {type}: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // GET: api/contracttemplate/by-contract-type/{contractTypeId}
        [HttpGet("by-contract-type/{contractTypeId}")]
        public async Task<ActionResult<IEnumerable<ContractTemplateDto>>> GetTemplatesByContractType(int contractTypeId)
        {
            try
            {
                Console.WriteLine($"Getting templates for contract type ID: {contractTypeId}");

                var templates = await _context.ContractTemplates
                    .Include(t => t.ContractType)
                    .Where(t => t.ContractTypeId == contractTypeId)
                    .OrderBy(t => t.Name)
                    .ToListAsync();

                Console.WriteLine($"Found {templates.Count} templates for contract type {contractTypeId}");

                var result = new List<ContractTemplateDto>();
                foreach (var template in templates)
                {
                    List<string> workServices;
                    try
                    {
                        workServices = JsonSerializer.Deserialize<List<string>>(template.WorkServicesJson, _jsonOptions) ?? new List<string>();
                    }
                    catch (Exception jsonEx)
                    {
                        Console.WriteLine($"JSON deserialization error for template {template.Id}: {jsonEx.Message}");
                        workServices = new List<string>();
                    }

                    result.Add(new ContractTemplateDto
                    {
                        Id = template.Id,
                        Name = template.Name,
                        Type = template.Type,
                        ContractTypeId = template.ContractTypeId,
                        ContractType = new ContractTypeDto
                        {
                            Id = template.ContractType.Id,
                            Name = template.ContractType.Name,
                            Code = template.ContractType.Code,
                            Description = template.ContractType.Description
                        },
                        WorkServices = workServices,
                        CreatedAt = template.CreatedAt,
                        UpdatedAt = template.UpdatedAt
                    });
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}