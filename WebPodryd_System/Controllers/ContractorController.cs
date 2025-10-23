// WebPodryd_System/Controllers/ContractorController.cs

using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using WebPodryd_System.Data;
using WebPodryd_System.Models;
using WebPodryd_System.DTO;
using Microsoft.AspNetCore.Cors;

namespace WebPodryd_System.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [EnableCors("AllowFrontend")]
    public class ContractorController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ContractorController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ContractorDto>>> GetContractors()
        {
            var contractors = await _context.Contractors
                .Include(c => c.BankDetail)
                .Include(c => c.Address)
                .Select(c => new ContractorDto
                {
                    Id = c.Id,
                    LastName = c.LastName,
                    FirstName = c.FirstName,
                    MiddleName = c.MiddleName,
                    DocumentType = c.DocumentType,
                    DocumentSeries = c.DocumentSeries,
                    DocumentNumber = c.DocumentNumber,
                    Citizenship = c.Citizenship,
                    IssueDate = c.IssueDate,
                    IssuedBy = c.IssuedBy,
                    IdentificationNumber = c.IdentificationNumber,
                    MobilePhone = c.MobilePhone,
                    BankDetails = c.BankDetail != null ? new BankDetailsDto
                    {
                        Id = c.BankDetail.Id,
                        ContractorId = c.BankDetail.ContractorId,
                        IBAN = c.BankDetail.IBAN,
                        BankName = c.BankDetail.BankName,
                        BIC = c.BankDetail.BIC,
                        CreatedAt = c.BankDetail.CreatedAt,
                        UpdatedAt = c.BankDetail.UpdatedAt
                    } : null,
                    Address = c.Address != null ? new AddressDto
                    {
                        Id = c.Address.Id,
                        ContractorId = c.Address.ContractorId,
                        Country = c.Address.Country,
                        Region = c.Address.Region,
                        City = c.Address.City,
                        District = c.Address.District,
                        Settlement = c.Address.Settlement,
                        StreetType = c.Address.StreetType,
                        StreetName = c.Address.StreetName,
                        House = c.Address.House,
                        Building = c.Address.Building,
                        Apartment = c.Address.Apartment,
                        CreatedAt = c.Address.CreatedAt,
                        UpdatedAt = c.Address.UpdatedAt
                    } : null,
                    CreatedAt = c.CreatedAt,
                    UpdatedAt = c.UpdatedAt
                })
                .ToListAsync();

            return Ok(contractors);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ContractorDto>> GetContractor(Guid id)
        {
            var contractor = await _context.Contractors
                .Include(c => c.BankDetail)
                .Include(c => c.Address)
                .Where(c => c.Id == id)
                .Select(c => new ContractorDto
                {
                    Id = c.Id,
                    LastName = c.LastName,
                    FirstName = c.FirstName,
                    MiddleName = c.MiddleName,
                    DocumentType = c.DocumentType,
                    DocumentSeries = c.DocumentSeries,
                    DocumentNumber = c.DocumentNumber,
                    Citizenship = c.Citizenship,
                    IssueDate = c.IssueDate,
                    IssuedBy = c.IssuedBy,
                    IdentificationNumber = c.IdentificationNumber,
                    MobilePhone = c.MobilePhone,
                    BankDetails = c.BankDetail != null ? new BankDetailsDto
                    {
                        Id = c.BankDetail.Id,
                        ContractorId = c.BankDetail.ContractorId,
                        IBAN = c.BankDetail.IBAN,
                        BankName = c.BankDetail.BankName,
                        BIC = c.BankDetail.BIC,
                        CreatedAt = c.BankDetail.CreatedAt,
                        UpdatedAt = c.BankDetail.UpdatedAt
                    } : null,
                    Address = c.Address != null ? new AddressDto
                    {
                        Id = c.Address.Id,
                        ContractorId = c.Address.ContractorId,
                        Country = c.Address.Country,
                        Region = c.Address.Region,
                        City = c.Address.City,
                        District = c.Address.District,
                        Settlement = c.Address.Settlement,
                        StreetType = c.Address.StreetType,
                        StreetName = c.Address.StreetName,
                        House = c.Address.House,
                        Building = c.Address.Building,
                        Apartment = c.Address.Apartment,
                        CreatedAt = c.Address.CreatedAt,
                        UpdatedAt = c.Address.UpdatedAt
                    } : null,
                    CreatedAt = c.CreatedAt,
                    UpdatedAt = c.UpdatedAt
                })
                .FirstOrDefaultAsync();

            if (contractor == null)
            {
                return NotFound();
            }

            return Ok(contractor);
        }

        [HttpPost]
        public async Task<ActionResult<ContractorDto>> CreateContractor(CreateContractorDto createDto)
        {
            var contractor = new Contractor
            {
                Id = Guid.NewGuid(),
                LastName = createDto.LastName,
                FirstName = createDto.FirstName,
                MiddleName = createDto.MiddleName,
                DocumentType = createDto.DocumentType,
                DocumentSeries = createDto.DocumentSeries,
                DocumentNumber = createDto.DocumentNumber,
                Citizenship = createDto.Citizenship,
                IssueDate = createDto.IssueDate,
                IssuedBy = createDto.IssuedBy,
                IdentificationNumber = createDto.IdentificationNumber,
                MobilePhone = createDto.MobilePhone,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Contractors.Add(contractor);

            // Создаем банковские реквизиты если они есть
            if (createDto.BankDetails != null)
            {
                var bankDetails = new BankDetail
                {
                    Id = Guid.NewGuid(),
                    ContractorId = contractor.Id,
                    IBAN = createDto.BankDetails.IBAN,
                    BankName = createDto.BankDetails.BankName,
                    BIC = createDto.BankDetails.BIC,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                _context.BankDetails.Add(bankDetails);
            }

            // Создаем адрес если он есть
            if (createDto.Address != null)
            {
                var address = new Address
                {
                    Id = Guid.NewGuid(),
                    ContractorId = contractor.Id,
                    Country = createDto.Address.Country,
                    Region = createDto.Address.Region,
                    City = createDto.Address.City,
                    District = createDto.Address.District,
                    Settlement = createDto.Address.Settlement,
                    StreetType = createDto.Address.StreetType,
                    StreetName = createDto.Address.StreetName,
                    House = createDto.Address.House,
                    Building = createDto.Address.Building,
                    Apartment = createDto.Address.Apartment,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                _context.Addresses.Add(address);
            }

            await _context.SaveChangesAsync();

            var result = await GetContractorDto(contractor.Id);
            return CreatedAtAction(nameof(GetContractor), new { id = contractor.Id }, result);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateContractor(Guid id, CreateContractorDto updateDto)
        {
            var contractor = await _context.Contractors
                .Include(c => c.BankDetail)
                .Include(c => c.Address)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (contractor == null)
            {
                return NotFound();
            }

            // Обновляем основные данные подрядчика
            contractor.LastName = updateDto.LastName;
            contractor.FirstName = updateDto.FirstName;
            contractor.MiddleName = updateDto.MiddleName;
            contractor.DocumentType = updateDto.DocumentType;
            contractor.DocumentSeries = updateDto.DocumentSeries;
            contractor.DocumentNumber = updateDto.DocumentNumber;
            contractor.Citizenship = updateDto.Citizenship;
            contractor.IssueDate = updateDto.IssueDate;
            contractor.IssuedBy = updateDto.IssuedBy;
            contractor.IdentificationNumber = updateDto.IdentificationNumber;
            contractor.MobilePhone = updateDto.MobilePhone;
            contractor.UpdatedAt = DateTime.UtcNow;

            // Обновляем банковские реквизиты
            if (updateDto.BankDetails != null)
            {
                if (contractor.BankDetail == null)
                {
                    contractor.BankDetail = new BankDetail
                    {
                        Id = Guid.NewGuid(),
                        ContractorId = contractor.Id,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };
                    _context.BankDetails.Add(contractor.BankDetail);
                }

                contractor.BankDetail.IBAN = updateDto.BankDetails.IBAN;
                contractor.BankDetail.BankName = updateDto.BankDetails.BankName;
                contractor.BankDetail.BIC = updateDto.BankDetails.BIC;
                contractor.BankDetail.UpdatedAt = DateTime.UtcNow;
            }

            // Обновляем адрес
            if (updateDto.Address != null)
            {
                if (contractor.Address == null)
                {
                    contractor.Address = new Address
                    {
                        Id = Guid.NewGuid(),
                        ContractorId = contractor.Id,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };
                    _context.Addresses.Add(contractor.Address);
                }

                contractor.Address.Country = updateDto.Address.Country;
                contractor.Address.Region = updateDto.Address.Region;
                contractor.Address.City = updateDto.Address.City;
                contractor.Address.District = updateDto.Address.District;
                contractor.Address.Settlement = updateDto.Address.Settlement;
                contractor.Address.StreetType = updateDto.Address.StreetType;
                contractor.Address.StreetName = updateDto.Address.StreetName;
                contractor.Address.House = updateDto.Address.House;
                contractor.Address.Building = updateDto.Address.Building;
                contractor.Address.Apartment = updateDto.Address.Apartment;
                contractor.Address.UpdatedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteContractor(Guid id)
        {
            var contractor = await _context.Contractors
                .Include(c => c.BankDetail)
                .Include(c => c.Address)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (contractor == null)
            {
                return NotFound();
            }

            _context.Contractors.Remove(contractor);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private async Task<ContractorDto> GetContractorDto(Guid id)
        {
            return await _context.Contractors
                .Include(c => c.BankDetail)
                .Include(c => c.Address)
                .Where(c => c.Id == id)
                .Select(c => new ContractorDto
                {
                    Id = c.Id,
                    LastName = c.LastName,
                    FirstName = c.FirstName,
                    MiddleName = c.MiddleName,
                    DocumentType = c.DocumentType,
                    DocumentSeries = c.DocumentSeries,
                    DocumentNumber = c.DocumentNumber,
                    Citizenship = c.Citizenship,
                    IssueDate = c.IssueDate,
                    IssuedBy = c.IssuedBy,
                    IdentificationNumber = c.IdentificationNumber,
                    MobilePhone = c.MobilePhone,
                    BankDetails = c.BankDetail != null ? new BankDetailsDto
                    {
                        Id = c.BankDetail.Id,
                        ContractorId = c.BankDetail.ContractorId,
                        IBAN = c.BankDetail.IBAN,
                        BankName = c.BankDetail.BankName,
                        BIC = c.BankDetail.BIC,
                        CreatedAt = c.BankDetail.CreatedAt,
                        UpdatedAt = c.BankDetail.UpdatedAt
                    } : null,
                    Address = c.Address != null ? new AddressDto
                    {
                        Id = c.Address.Id,
                        ContractorId = c.Address.ContractorId,
                        Country = c.Address.Country,
                        Region = c.Address.Region,
                        City = c.Address.City,
                        District = c.Address.District,
                        Settlement = c.Address.Settlement,
                        StreetType = c.Address.StreetType,
                        StreetName = c.Address.StreetName,
                        House = c.Address.House,
                        Building = c.Address.Building,
                        Apartment = c.Address.Apartment,
                        CreatedAt = c.Address.CreatedAt,
                        UpdatedAt = c.Address.UpdatedAt
                    } : null,
                    CreatedAt = c.CreatedAt,
                    UpdatedAt = c.UpdatedAt
                })
                .FirstOrDefaultAsync();
        }
    }
}