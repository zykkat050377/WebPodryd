// WebPodryd_System/Controllers/AddressController.cs

using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading.Tasks;
using WebPodryd_System.Data;
using WebPodryd_System.Models;
using WebPodryd_System.DTO;
using Microsoft.AspNetCore.Cors;
using System.Linq;

namespace WebPodryd_System.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [EnableCors("AllowFrontend")]
    public class AddressController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AddressController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("contractor/{contractorId}")]
        public async Task<ActionResult<AddressDto>> GetByContractorId(Guid contractorId)
        {
            var address = await _context.Addresses
                .Where(a => a.ContractorId == contractorId)
                .Select(a => new AddressDto
                {
                    Id = a.Id,
                    ContractorId = a.ContractorId,
                    Country = a.Country,
                    Region = a.Region,
                    City = a.City,
                    District = a.District,
                    Settlement = a.Settlement,
                    StreetType = a.StreetType,
                    StreetName = a.StreetName,
                    House = a.House,
                    Building = a.Building,
                    Apartment = a.Apartment,
                    CreatedAt = a.CreatedAt,
                    UpdatedAt = a.UpdatedAt
                })
                .FirstOrDefaultAsync();

            if (address == null)
            {
                return NotFound();
            }

            return Ok(address);
        }

        [HttpPost]
        public async Task<ActionResult<AddressDto>> CreateAddress(CreateAddressDto createDto)
        {
            var address = new Address
            {
                Id = Guid.NewGuid(),
                ContractorId = Guid.NewGuid(), // В реальном сценарии это будет передаваться из DTO
                Country = createDto.Country,
                Region = createDto.Region,
                City = createDto.City,
                District = createDto.District,
                Settlement = createDto.Settlement,
                StreetType = createDto.StreetType,
                StreetName = createDto.StreetName,
                House = createDto.House,
                Building = createDto.Building,
                Apartment = createDto.Apartment,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Addresses.Add(address);
            await _context.SaveChangesAsync();

            var result = new AddressDto
            {
                Id = address.Id,
                ContractorId = address.ContractorId,
                Country = address.Country,
                Region = address.Region,
                City = address.City,
                District = address.District,
                Settlement = address.Settlement,
                StreetType = address.StreetType,
                StreetName = address.StreetName,
                House = address.House,
                Building = address.Building,
                Apartment = address.Apartment,
                CreatedAt = address.CreatedAt,
                UpdatedAt = address.UpdatedAt
            };

            return CreatedAtAction(nameof(GetByContractorId), new { contractorId = address.ContractorId }, result);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateAddress(Guid id, CreateAddressDto updateDto)
        {
            var address = await _context.Addresses.FindAsync(id);

            if (address == null)
            {
                return NotFound();
            }

            address.Country = updateDto.Country;
            address.Region = updateDto.Region;
            address.City = updateDto.City;
            address.District = updateDto.District;
            address.Settlement = updateDto.Settlement;
            address.StreetType = updateDto.StreetType;
            address.StreetName = updateDto.StreetName;
            address.House = updateDto.House;
            address.Building = updateDto.Building;
            address.Apartment = updateDto.Apartment;
            address.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAddress(Guid id)
        {
            var address = await _context.Addresses.FindAsync(id);

            if (address == null)
            {
                return NotFound();
            }

            _context.Addresses.Remove(address);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}