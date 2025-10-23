// WebPodryd_System/Controllers/BankDetailsController.cs

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
    public class BankDetailsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public BankDetailsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("contractor/{contractorId}")]
        public async Task<ActionResult<BankDetailsDto>> GetByContractorId(Guid contractorId)
        {
            var bankDetails = await _context.BankDetails
                .Where(bd => bd.ContractorId == contractorId)
                .Select(bd => new BankDetailsDto
                {
                    Id = bd.Id,
                    ContractorId = bd.ContractorId,
                    IBAN = bd.IBAN,
                    BankName = bd.BankName,
                    BIC = bd.BIC,
                    CreatedAt = bd.CreatedAt,
                    UpdatedAt = bd.UpdatedAt
                })
                .FirstOrDefaultAsync();

            if (bankDetails == null)
            {
                return NotFound();
            }

            return Ok(bankDetails);
        }

        [HttpPost]
        public async Task<ActionResult<BankDetailsDto>> CreateBankDetails(CreateBankDetailsDto createDto)
        {
            var bankDetails = new BankDetail
            {
                Id = Guid.NewGuid(),
                ContractorId = Guid.NewGuid(), // В реальном сценарии это будет передаваться из DTO
                IBAN = createDto.IBAN,
                BankName = createDto.BankName,
                BIC = createDto.BIC,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.BankDetails.Add(bankDetails);
            await _context.SaveChangesAsync();

            var result = new BankDetailsDto
            {
                Id = bankDetails.Id,
                ContractorId = bankDetails.ContractorId,
                IBAN = bankDetails.IBAN,
                BankName = bankDetails.BankName,
                BIC = bankDetails.BIC,
                CreatedAt = bankDetails.CreatedAt,
                UpdatedAt = bankDetails.UpdatedAt
            };

            return CreatedAtAction(nameof(GetByContractorId), new { contractorId = bankDetails.ContractorId }, result);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateBankDetails(Guid id, CreateBankDetailsDto updateDto)
        {
            var bankDetails = await _context.BankDetails.FindAsync(id);

            if (bankDetails == null)
            {
                return NotFound();
            }

            bankDetails.IBAN = updateDto.IBAN;
            bankDetails.BankName = updateDto.BankName;
            bankDetails.BIC = updateDto.BIC;
            bankDetails.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteBankDetails(Guid id)
        {
            var bankDetails = await _context.BankDetails.FindAsync(id);

            if (bankDetails == null)
            {
                return NotFound();
            }

            _context.BankDetails.Remove(bankDetails);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
