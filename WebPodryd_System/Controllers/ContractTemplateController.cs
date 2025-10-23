// WebPodryd_System/Controllers/ContractTemplateController.cs
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using WebPodryd_System.Data;
using WebPodryd_System.Models;
using WebPodryd_System.DTO;
using System.Text.Json;
using Microsoft.AspNetCore.Cors;

namespace WebPodryd_System.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [EnableCors("AllowFrontend")]
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
                var query = _context.ContractTemplates
                    .Include(t => t.ContractType) // НОВОЕ: включаем ContractType
                    .AsQueryable();

                // Фильтр по типу (для обратной совместимости)
                if (!string.IsNullOrEmpty(type) && type != "all")
                {
                    query = query.Where(t => t.Type == type);
                }

                // НОВОЕ: фильтр по ID типа договора
                if (contractTypeId.HasValue && contractTypeId > 0)
                {
                    query = query.Where(t => t.ContractTypeId == contractTypeId.Value);
                }

                // Поиск по названию или работам/услугам
                if (!string.IsNullOrEmpty(search))
                {
                    query = query.Where(t =>
                        t.Name.Contains(search) ||
                        t.WorkServicesJson.Contains(search) ||
                        t.ContractType.Name.Contains(search)); // НОВОЕ: поиск по названию типа договора
                }

                var templates = await query
                    .OrderBy(t => t.Name)
                    .ToListAsync();

                var result = templates.Select(t => new ContractTemplateDto
                {
                    Id = t.Id,
                    Name = t.Name,
                    Type = t.Type,
                    // НОВОЕ: добавляем ContractTypeId и ContractType
                    ContractTypeId = t.ContractTypeId,
                    ContractType = new ContractTypeDto
                    {
                        Id = t.ContractType.Id,
                        Name = t.ContractType.Name,
                        Code = t.ContractType.Code,
                        Description = t.ContractType.Description,
                        CreatedAt = t.ContractType.CreatedAt,
                        UpdatedAt = t.ContractType.UpdatedAt
                    },
                    WorkServices = JsonSerializer.Deserialize<List<string>>(t.WorkServicesJson, _jsonOptions) ?? new List<string>(),
                    OperationsPer8Hours = t.OperationsPer8Hours,
                    CreatedAt = t.CreatedAt,
                    UpdatedAt = t.UpdatedAt
                }).ToList();

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // GET: api/contracttemplate/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<ContractTemplateDto>> GetContractTemplate(int id)
        {
            try
            {
                var template = await _context.ContractTemplates
                    .Include(t => t.ContractType) // НОВОЕ: включаем ContractType
                    .FirstOrDefaultAsync(t => t.Id == id);

                if (template == null)
                {
                    return NotFound("Шаблон договора не найден");
                }

                var result = new ContractTemplateDto
                {
                    Id = template.Id,
                    Name = template.Name,
                    Type = template.Type,
                    // НОВОЕ: добавляем ContractTypeId и ContractType
                    ContractTypeId = template.ContractTypeId,
                    ContractType = new ContractTypeDto
                    {
                        Id = template.ContractType.Id,
                        Name = template.ContractType.Name,
                        Code = template.ContractType.Code,
                        Description = template.ContractType.Description,
                        CreatedAt = template.ContractType.CreatedAt,
                        UpdatedAt = template.ContractType.UpdatedAt
                    },
                    WorkServices = JsonSerializer.Deserialize<List<string>>(template.WorkServicesJson, _jsonOptions) ?? new List<string>(),
                    OperationsPer8Hours = template.OperationsPer8Hours,
                    CreatedAt = template.CreatedAt,
                    UpdatedAt = template.UpdatedAt
                };

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // POST: api/contracttemplate
        [HttpPost]
        public async Task<ActionResult<ContractTemplateDto>> CreateContractTemplate(CreateContractTemplateDto createDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                // НОВОЕ: проверяем существование типа договора
                var contractType = await _context.ContractTypes.FindAsync(createDto.ContractTypeId);
                if (contractType == null)
                {
                    return BadRequest("Указанный тип договора не найден");
                }

                // Проверяем уникальность названия (обновлено для работы с ContractTypeId)
                var existingTemplate = await _context.ContractTemplates
                    .FirstOrDefaultAsync(t => t.Name == createDto.Name && t.ContractTypeId == createDto.ContractTypeId);

                if (existingTemplate != null)
                {
                    return BadRequest("Шаблон с таким названием и типом уже существует");
                }

                var template = new ContractTemplate
                {
                    Name = createDto.Name,
                    ContractTypeId = createDto.ContractTypeId, // НОВОЕ
                    Type = contractType.Code, // НОВОЕ: используем код из ContractType
                    WorkServicesJson = JsonSerializer.Serialize(createDto.WorkServices, _jsonOptions),
                    OperationsPer8Hours = createDto.OperationsPer8Hours,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _context.ContractTemplates.Add(template);
                await _context.SaveChangesAsync();

                // Получаем созданный шаблон с включенным ContractType
                var createdTemplate = await _context.ContractTemplates
                    .Include(t => t.ContractType)
                    .FirstOrDefaultAsync(t => t.Id == template.Id);

                var result = new ContractTemplateDto
                {
                    Id = createdTemplate.Id,
                    Name = createdTemplate.Name,
                    Type = createdTemplate.Type,
                    ContractTypeId = createdTemplate.ContractTypeId,
                    ContractType = new ContractTypeDto
                    {
                        Id = createdTemplate.ContractType.Id,
                        Name = createdTemplate.ContractType.Name,
                        Code = createdTemplate.ContractType.Code,
                        Description = createdTemplate.ContractType.Description,
                        CreatedAt = createdTemplate.ContractType.CreatedAt,
                        UpdatedAt = createdTemplate.ContractType.UpdatedAt
                    },
                    WorkServices = createDto.WorkServices,
                    OperationsPer8Hours = createdTemplate.OperationsPer8Hours,
                    CreatedAt = createdTemplate.CreatedAt,
                    UpdatedAt = createdTemplate.UpdatedAt
                };

                return CreatedAtAction(nameof(GetContractTemplate), new { id = template.Id }, result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // PUT: api/contracttemplate/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateContractTemplate(int id, UpdateContractTemplateDto updateDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var template = await _context.ContractTemplates.FindAsync(id);

                if (template == null)
                {
                    return NotFound("Шаблон договора не найден");
                }

                // НОВОЕ: если меняется ContractTypeId, проверяем существование нового типа
                ContractType newContractType = null;
                if (updateDto.ContractTypeId.HasValue && updateDto.ContractTypeId.Value != template.ContractTypeId)
                {
                    newContractType = await _context.ContractTypes.FindAsync(updateDto.ContractTypeId.Value);
                    if (newContractType == null)
                    {
                        return BadRequest("Указанный тип договора не найден");
                    }
                }

                // Проверяем уникальность названия (обновлено для работы с ContractTypeId)
                if (!string.IsNullOrEmpty(updateDto.Name) && updateDto.Name != template.Name)
                {
                    var targetContractTypeId = updateDto.ContractTypeId ?? template.ContractTypeId;
                    var existingTemplate = await _context.ContractTemplates
                        .FirstOrDefaultAsync(t => t.Name == updateDto.Name &&
                                               t.ContractTypeId == targetContractTypeId &&
                                               t.Id != id);

                    if (existingTemplate != null)
                    {
                        return BadRequest("Шаблон с таким названием и типом уже существует");
                    }
                }

                // Обновляем поля
                if (!string.IsNullOrEmpty(updateDto.Name))
                    template.Name = updateDto.Name;

                // НОВОЕ: обновляем ContractTypeId и Type
                if (updateDto.ContractTypeId.HasValue)
                {
                    template.ContractTypeId = updateDto.ContractTypeId.Value;
                    template.Type = newContractType?.Code ?? template.Type;
                }

                // Для обратной совместимости оставляем обновление Type
                if (!string.IsNullOrEmpty(updateDto.Type))
                {
                    // Если указан Type, находим соответствующий ContractType
                    var contractTypeByCode = await _context.ContractTypes
                        .FirstOrDefaultAsync(ct => ct.Code == updateDto.Type);
                    if (contractTypeByCode != null)
                    {
                        template.ContractTypeId = contractTypeByCode.Id;
                        template.Type = updateDto.Type;
                    }
                }

                if (updateDto.WorkServices != null)
                    template.WorkServicesJson = JsonSerializer.Serialize(updateDto.WorkServices, _jsonOptions);

                if (updateDto.OperationsPer8Hours.HasValue)
                    template.OperationsPer8Hours = updateDto.OperationsPer8Hours.Value;

                template.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // DELETE: api/contracttemplate/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteContractTemplate(int id)
        {
            try
            {
                var template = await _context.ContractTemplates.FindAsync(id);

                if (template == null)
                {
                    return NotFound("Шаблон договора не найден");
                }

                // НОВОЕ: проверяем, нет ли связанных договоров
                var hasContracts = await _context.Contracts
                    .AnyAsync(c => c.ContractTemplateName == template.Name);

                if (hasContracts)
                {
                    return BadRequest("Нельзя удалить шаблон договора, так как с ним связаны договоры");
                }

                _context.ContractTemplates.Remove(template);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // GET: api/contracttemplate/types
        [HttpGet("types")]
        public async Task<ActionResult<IEnumerable<object>>> GetContractTemplateTypes()
        {
            try
            {
                // НОВОЕ: получаем типы из базы данных вместо хардкода
                var contractTypes = await _context.ContractTypes
                    .OrderBy(ct => ct.Name)
                    .Select(ct => new
                    {
                        value = ct.Code,
                        label = ct.Name,
                        id = ct.Id,
                        description = ct.Description
                    })
                    .ToListAsync();

                return Ok(contractTypes);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // GET: api/contracttemplate/{type}/services
        [HttpGet("{type}/services")]
        public async Task<ActionResult<IEnumerable<string>>> GetWorkServicesByType(string type)
        {
            try
            {
                var templates = await _context.ContractTemplates
                    .Where(t => t.Type == type)
                    .ToListAsync();

                var services = templates
                    .SelectMany(t => JsonSerializer.Deserialize<List<string>>(t.WorkServicesJson, _jsonOptions) ?? new List<string>())
                    .Distinct()
                    .OrderBy(s => s)
                    .ToList();

                return Ok(services);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // НОВЫЙ МЕТОД: получение шаблонов по ID типа договора
        [HttpGet("by-contract-type/{contractTypeId}")]
        public async Task<ActionResult<IEnumerable<ContractTemplateDto>>> GetTemplatesByContractType(int contractTypeId)
        {
            try
            {
                var templates = await _context.ContractTemplates
                    .Include(t => t.ContractType)
                    .Where(t => t.ContractTypeId == contractTypeId)
                    .OrderBy(t => t.Name)
                    .Select(t => new ContractTemplateDto
                    {
                        Id = t.Id,
                        Name = t.Name,
                        Type = t.Type,
                        ContractTypeId = t.ContractTypeId,
                        ContractType = new ContractTypeDto
                        {
                            Id = t.ContractType.Id,
                            Name = t.ContractType.Name,
                            Code = t.ContractType.Code,
                            Description = t.ContractType.Description,
                            CreatedAt = t.ContractType.CreatedAt,
                            UpdatedAt = t.ContractType.UpdatedAt
                        },
                        WorkServices = JsonSerializer.Deserialize<List<string>>(t.WorkServicesJson, _jsonOptions) ?? new List<string>(),
                        OperationsPer8Hours = t.OperationsPer8Hours,
                        CreatedAt = t.CreatedAt,
                        UpdatedAt = t.UpdatedAt
                    })
                    .ToListAsync();

                return Ok(templates);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // НОВЫЙ МЕТОД: получение доступных работ/услуг по ID типа договора
        [HttpGet("contract-type/{contractTypeId}/services")]
        public async Task<ActionResult<IEnumerable<string>>> GetWorkServicesByContractType(int contractTypeId)
        {
            try
            {
                var templates = await _context.ContractTemplates
                    .Where(t => t.ContractTypeId == contractTypeId)
                    .ToListAsync();

                var services = templates
                    .SelectMany(t => JsonSerializer.Deserialize<List<string>>(t.WorkServicesJson, _jsonOptions) ?? new List<string>())
                    .Distinct()
                    .OrderBy(s => s)
                    .ToList();

                return Ok(services);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}