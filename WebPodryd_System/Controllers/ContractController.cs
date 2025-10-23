// WebPodryd_System/Controllers/ContractController.cs
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
    public class ContractController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ContractController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/contract
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ContractDto>>> GetContracts(
            [FromQuery] string department = null,
            [FromQuery] string contractType = null,
            [FromQuery] string search = null,
            [FromQuery] bool? unprocessedOnly = false,
            [FromQuery] DateTime? startDateFrom = null,
            [FromQuery] DateTime? startDateTo = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            try
            {
                var query = _context.Contracts
                    .Include(c => c.Contractor)
                    .Include(c => c.Department)
                    .Include(c => c.SigningEmployee)
                    .Include(c => c.ContractType) // НОВОЕ: включаем ContractType
                    .Include(c => c.WorkServices)
                    .AsQueryable();

                // Фильтр по структурной единице
                if (!string.IsNullOrEmpty(department) && department != "Все СЕ")
                {
                    query = query.Where(c => c.Department.Name == department);
                }

                // Фильтр по типу договора (обновлено для работы с кодом типа)
                if (!string.IsNullOrEmpty(contractType) && contractType != "Все")
                {
                    query = query.Where(c => c.ContractType.Code == contractType || c.ContractTypeCode == contractType);
                }

                // Фильтр по поисковому запросу
                if (!string.IsNullOrEmpty(search))
                {
                    query = query.Where(c =>
                        c.ContractNumber.Contains(search) ||
                        c.Contractor.LastName.Contains(search) ||
                        c.Contractor.FirstName.Contains(search) ||
                        c.WorkServices.Any(ws => ws.WorkServiceName.Contains(search)));
                }

                // Фильтр по необработанным договорам
                if (unprocessedOnly == true)
                {
                    query = query.Where(c => !c.Processed);
                }

                // Фильтр по дате начала
                if (startDateFrom.HasValue)
                {
                    query = query.Where(c => c.StartDate >= startDateFrom.Value);
                }

                if (startDateTo.HasValue)
                {
                    query = query.Where(c => c.StartDate <= startDateTo.Value);
                }

                // Пагинация
                var totalCount = await query.CountAsync();
                var contracts = await query
                    .OrderByDescending(c => c.CreatedAt)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .Select(c => new ContractDto
                    {
                        Id = c.Id,
                        ContractNumber = c.ContractNumber,
                        ContractDate = c.ContractDate,
                        StartDate = c.StartDate,
                        EndDate = c.EndDate,
                        ContractorId = c.ContractorId,
                        Contractor = new ContractorDto
                        {
                            Id = c.Contractor.Id,
                            LastName = c.Contractor.LastName,
                            FirstName = c.Contractor.FirstName,
                            MiddleName = c.Contractor.MiddleName,
                            DocumentType = c.Contractor.DocumentType,
                            DocumentSeries = c.Contractor.DocumentSeries,
                            DocumentNumber = c.Contractor.DocumentNumber
                        },
                        DepartmentId = c.DepartmentId,
                        Department = new DepartmentDto
                        {
                            Id = c.Department.Id,
                            Name = c.Department.Name,
                            Code = c.Department.Code
                        },
                        // НОВОЕ: добавляем ContractTypeId и ContractType
                        ContractTypeId = c.ContractTypeId,
                        ContractType = new ContractTypeDto
                        {
                            Id = c.ContractType.Id,
                            Name = c.ContractType.Name,
                            Code = c.ContractType.Code,
                            Description = c.ContractType.Description,
                            CreatedAt = c.ContractType.CreatedAt,
                            UpdatedAt = c.ContractType.UpdatedAt
                        },
                        ContractTypeCode = c.ContractTypeCode, // Для обратной совместимости
                        ContractTemplateName = c.ContractTemplateName,
                        SigningEmployeeId = c.SigningEmployeeId,
                        SigningEmployee = c.SigningEmployee != null ? new SigningEmployeeDto
                        {
                            Id = c.SigningEmployee.Id,
                            LastName = c.SigningEmployee.LastName,
                            FirstName = c.SigningEmployee.FirstName,
                            MiddleName = c.SigningEmployee.MiddleName,
                            Position = c.SigningEmployee.Position
                        } : null,
                        ExecutorUserId = c.ExecutorUserId,
                        Processed = c.Processed,
                        TransferDate = c.TransferDate,
                        GalaxyEntryDate = c.GalaxyEntryDate,
                        OKEmployee = c.OKEmployee,
                        WorkServices = c.WorkServices.Select(ws => new ContractWorkServiceDto
                        {
                            Id = ws.Id,
                            WorkServiceName = ws.WorkServiceName,
                            Cost = ws.Cost,
                            OperationCount = ws.OperationCount,
                            HoursCount = ws.HoursCount,
                            FixedCost = ws.FixedCost
                        }).ToList(),
                        CreatedAt = c.CreatedAt,
                        UpdatedAt = c.UpdatedAt
                    })
                    .ToListAsync();

                // Добавляем информацию о пагинации в заголовки
                Response.Headers.Add("X-Total-Count", totalCount.ToString());
                Response.Headers.Add("X-Page", page.ToString());
                Response.Headers.Add("X-Page-Size", pageSize.ToString());
                Response.Headers.Add("X-Total-Pages", Math.Ceiling(totalCount / (double)pageSize).ToString());

                return Ok(contracts);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // GET: api/contract/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<ContractDto>> GetContract(Guid id)
        {
            try
            {
                var contract = await _context.Contracts
                    .Include(c => c.Contractor)
                    .ThenInclude(c => c.BankDetail)
                    .Include(c => c.Contractor)
                    .ThenInclude(c => c.Address)
                    .Include(c => c.Department)
                    .Include(c => c.SigningEmployee)
                    .Include(c => c.ContractType) // НОВОЕ: включаем ContractType
                    .Include(c => c.WorkServices)
                    .Where(c => c.Id == id)
                    .Select(c => new ContractDto
                    {
                        Id = c.Id,
                        ContractNumber = c.ContractNumber,
                        ContractDate = c.ContractDate,
                        StartDate = c.StartDate,
                        EndDate = c.EndDate,
                        ContractorId = c.ContractorId,
                        Contractor = new ContractorDto
                        {
                            Id = c.Contractor.Id,
                            LastName = c.Contractor.LastName,
                            FirstName = c.Contractor.FirstName,
                            MiddleName = c.Contractor.MiddleName,
                            DocumentType = c.Contractor.DocumentType,
                            DocumentSeries = c.Contractor.DocumentSeries,
                            DocumentNumber = c.Contractor.DocumentNumber,
                            Citizenship = c.Contractor.Citizenship,
                            IssueDate = c.Contractor.IssueDate,
                            IssuedBy = c.Contractor.IssuedBy,
                            IdentificationNumber = c.Contractor.IdentificationNumber,
                            MobilePhone = c.Contractor.MobilePhone,
                            BankDetails = c.Contractor.BankDetail != null ? new BankDetailsDto
                            {
                                IBAN = c.Contractor.BankDetail.IBAN,
                                BankName = c.Contractor.BankDetail.BankName,
                                BIC = c.Contractor.BankDetail.BIC
                            } : null,
                            Address = c.Contractor.Address != null ? new AddressDto
                            {
                                Country = c.Contractor.Address.Country,
                                Region = c.Contractor.Address.Region,
                                City = c.Contractor.Address.City,
                                District = c.Contractor.Address.District,
                                Settlement = c.Contractor.Address.Settlement,
                                StreetType = c.Contractor.Address.StreetType,
                                StreetName = c.Contractor.Address.StreetName,
                                House = c.Contractor.Address.House,
                                Building = c.Contractor.Address.Building,
                                Apartment = c.Contractor.Address.Apartment
                            } : null
                        },
                        DepartmentId = c.DepartmentId,
                        Department = new DepartmentDto
                        {
                            Id = c.Department.Id,
                            Name = c.Department.Name,
                            Code = c.Department.Code
                        },
                        // НОВОЕ: добавляем ContractTypeId и ContractType
                        ContractTypeId = c.ContractTypeId,
                        ContractType = new ContractTypeDto
                        {
                            Id = c.ContractType.Id,
                            Name = c.ContractType.Name,
                            Code = c.ContractType.Code,
                            Description = c.ContractType.Description,
                            CreatedAt = c.ContractType.CreatedAt,
                            UpdatedAt = c.ContractType.UpdatedAt
                        },
                        ContractTypeCode = c.ContractTypeCode, // Для обратной совместимости
                        ContractTemplateName = c.ContractTemplateName,
                        SigningEmployeeId = c.SigningEmployeeId,
                        SigningEmployee = c.SigningEmployee != null ? new SigningEmployeeDto
                        {
                            Id = c.SigningEmployee.Id,
                            LastName = c.SigningEmployee.LastName,
                            FirstName = c.SigningEmployee.FirstName,
                            MiddleName = c.SigningEmployee.MiddleName,
                            Position = c.SigningEmployee.Position,
                            WarrantNumber = c.SigningEmployee.WarrantNumber,
                            StartDate = c.SigningEmployee.StartDate,
                            EndDate = c.SigningEmployee.EndDate
                        } : null,
                        ExecutorUserId = c.ExecutorUserId,
                        Processed = c.Processed,
                        TransferDate = c.TransferDate,
                        GalaxyEntryDate = c.GalaxyEntryDate,
                        OKEmployee = c.OKEmployee,
                        WorkServices = c.WorkServices.Select(ws => new ContractWorkServiceDto
                        {
                            Id = ws.Id,
                            WorkServiceName = ws.WorkServiceName,
                            Cost = ws.Cost,
                            OperationCount = ws.OperationCount,
                            HoursCount = ws.HoursCount,
                            FixedCost = ws.FixedCost
                        }).ToList(),
                        CreatedAt = c.CreatedAt,
                        UpdatedAt = c.UpdatedAt
                    })
                    .FirstOrDefaultAsync();

                if (contract == null)
                {
                    return NotFound();
                }

                return Ok(contract);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // POST: api/contract
        [HttpPost]
        public async Task<ActionResult<ContractDto>> CreateContract(CreateContractDto createDto)
        {
            try
            {
                // Проверяем существование типа договора
                var contractType = await _context.ContractTypes.FindAsync(createDto.ContractTypeId);
                if (contractType == null)
                {
                    return BadRequest("Указанный тип договора не найден");
                }

                // Проверяем существование департамента
                var department = await _context.Departments.FindAsync(createDto.DepartmentId);
                if (department == null)
                {
                    return BadRequest("Department not found");
                }

                // Проверяем существование подрядчика
                var contractor = await _context.Contractors.FindAsync(createDto.ContractorId);
                if (contractor == null)
                {
                    return BadRequest("Contractor not found");
                }

                // Проверяем существование сотрудника для подписания (если указан)
                if (createDto.SigningEmployeeId.HasValue)
                {
                    var signingEmployee = await _context.SigningEmployees.FindAsync(createDto.SigningEmployeeId.Value);
                    if (signingEmployee == null)
                    {
                        return BadRequest("Signing employee not found");
                    }
                }

                var contractNumber = await GenerateContractNumber(createDto.DepartmentId);

                var contract = new Contract
                {
                    Id = Guid.NewGuid(),
                    ContractNumber = contractNumber,
                    ContractDate = createDto.ContractDate,
                    StartDate = createDto.StartDate,
                    EndDate = createDto.EndDate,
                    ContractorId = createDto.ContractorId,
                    DepartmentId = createDto.DepartmentId,
                    ContractTypeId = createDto.ContractTypeId, // НОВОЕ
                    ContractTypeCode = contractType.Code, // НОВОЕ
                    SigningEmployeeId = createDto.SigningEmployeeId,
                    ContractTemplateName = createDto.ContractTemplateName,
                    ExecutorUserId = Guid.NewGuid(), // TODO: Получить из контекста пользователя
                    Processed = false,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                // Добавляем работы/услуги
                foreach (var workServiceDto in createDto.WorkServices)
                {
                    var workService = new ContractWorkService
                    {
                        Id = Guid.NewGuid(),
                        ContractId = contract.Id,
                        WorkServiceName = workServiceDto.WorkServiceName,
                        Cost = workServiceDto.Cost,
                        OperationCount = workServiceDto.OperationCount,
                        HoursCount = workServiceDto.HoursCount,
                        FixedCost = workServiceDto.FixedCost,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };
                    contract.WorkServices.Add(workService);
                }

                _context.Contracts.Add(contract);
                await _context.SaveChangesAsync();

                // Возвращаем созданный договор
                var result = await GetContract(contract.Id);
                return CreatedAtAction(nameof(GetContract), new { id = contract.Id }, result.Value);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // PUT: api/contract/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateContract(Guid id, UpdateContractDto updateDto)
        {
            try
            {
                var contract = await _context.Contracts
                    .Include(c => c.WorkServices)
                    .FirstOrDefaultAsync(c => c.Id == id);

                if (contract == null)
                {
                    return NotFound();
                }

                // Обновляем основные поля
                if (updateDto.ContractDate.HasValue)
                    contract.ContractDate = updateDto.ContractDate.Value;

                if (updateDto.StartDate.HasValue)
                    contract.StartDate = updateDto.StartDate.Value;

                if (updateDto.EndDate.HasValue)
                    contract.EndDate = updateDto.EndDate.Value;

                if (updateDto.ContractorId.HasValue)
                    contract.ContractorId = updateDto.ContractorId.Value;

                if (updateDto.DepartmentId.HasValue)
                    contract.DepartmentId = updateDto.DepartmentId.Value;

                // НОВОЕ: обновляем ContractTypeId если указан
                if (updateDto.ContractTypeId.HasValue)
                {
                    var contractType = await _context.ContractTypes.FindAsync(updateDto.ContractTypeId.Value);
                    if (contractType != null)
                    {
                        contract.ContractTypeId = updateDto.ContractTypeId.Value;
                        contract.ContractTypeCode = contractType.Code;
                    }
                }

                if (!string.IsNullOrEmpty(updateDto.ContractTemplateName))
                    contract.ContractTemplateName = updateDto.ContractTemplateName;

                if (updateDto.SigningEmployeeId.HasValue)
                    contract.SigningEmployeeId = updateDto.SigningEmployeeId;

                if (updateDto.Processed.HasValue)
                    contract.Processed = updateDto.Processed.Value;

                if (updateDto.TransferDate.HasValue)
                    contract.TransferDate = updateDto.TransferDate.Value;

                if (updateDto.GalaxyEntryDate.HasValue)
                    contract.GalaxyEntryDate = updateDto.GalaxyEntryDate.Value;

                if (!string.IsNullOrEmpty(updateDto.OKEmployee))
                    contract.OKEmployee = updateDto.OKEmployee;

                // Обновляем работы/услуги если они предоставлены
                if (updateDto.WorkServices != null)
                {
                    // Удаляем старые работы/услуги
                    _context.ContractWorkServices.RemoveRange(contract.WorkServices);

                    // Добавляем новые
                    foreach (var workServiceDto in updateDto.WorkServices)
                    {
                        var workService = new ContractWorkService
                        {
                            Id = Guid.NewGuid(),
                            ContractId = contract.Id,
                            WorkServiceName = workServiceDto.WorkServiceName,
                            Cost = workServiceDto.Cost,
                            OperationCount = workServiceDto.OperationCount,
                            HoursCount = workServiceDto.HoursCount,
                            FixedCost = workServiceDto.FixedCost,
                            CreatedAt = DateTime.UtcNow,
                            UpdatedAt = DateTime.UtcNow
                        };
                        contract.WorkServices.Add(workService);
                    }
                }

                contract.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // DELETE: api/contract/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteContract(Guid id)
        {
            try
            {
                var contract = await _context.Contracts
                    .Include(c => c.WorkServices)
                    .FirstOrDefaultAsync(c => c.Id == id);

                if (contract == null)
                {
                    return NotFound();
                }

                _context.Contracts.Remove(contract);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // GET: api/contract/stats
        [HttpGet("stats")]
        public async Task<ActionResult<object>> GetContractStats()
        {
            try
            {
                var totalContracts = await _context.Contracts.CountAsync();
                var processedContracts = await _context.Contracts.CountAsync(c => c.Processed);
                var unprocessedContracts = totalContracts - processedContracts;

                // ОБНОВЛЕНО: группируем по ContractType вместо ContractType
                var contractsByType = await _context.Contracts
                    .Include(c => c.ContractType)
                    .GroupBy(c => new { c.ContractType.Id, c.ContractType.Name, c.ContractType.Code })
                    .Select(g => new
                    {
                        TypeId = g.Key.Id,
                        TypeName = g.Key.Name,
                        TypeCode = g.Key.Code,
                        Count = g.Count()
                    })
                    .ToListAsync();

                var contractsByDepartment = await _context.Contracts
                    .Include(c => c.Department)
                    .GroupBy(c => new { c.DepartmentId, c.Department.Name })
                    .Select(g => new
                    {
                        g.Key.DepartmentId,
                        DepartmentName = g.Key.Name,
                        Count = g.Count()
                    })
                    .ToListAsync();

                return Ok(new
                {
                    TotalContracts = totalContracts,
                    ProcessedContracts = processedContracts,
                    UnprocessedContracts = unprocessedContracts,
                    ByType = contractsByType,
                    ByDepartment = contractsByDepartment
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        private async Task<string> GenerateContractNumber(int departmentId)
        {
            var department = await _context.Departments.FindAsync(departmentId);
            if (department == null)
            {
                throw new ArgumentException("Department not found");
            }

            var currentYear = DateTime.Now.Year % 100; // Последние две цифры года

            // Получаем количество договоров для этого департамента в текущем году
            var contractCount = await _context.Contracts
                .Where(c => c.DepartmentId == departmentId &&
                           c.CreatedAt.Year == DateTime.Now.Year)
                .CountAsync();

            var sequenceNumber = (contractCount + 1).ToString("D2"); // Двузначный номер с ведущими нулями
            var departmentCode = department.Code ?? departmentId.ToString();

            return $"{sequenceNumber}/{currentYear}/{departmentCode}";
        }
    }
}