using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using WebPodryd_System.Data;
using WebPodryd_System.Models;

namespace WebPodryd_System.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ContractTypeController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ContractTypeController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/ContractType
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ContractType>>> GetContractTypes()
        {
            try
            {
                var contractTypes = await _context.ContractTypes
                    .OrderBy(ct => ct.Id)
                    .ToListAsync();

                return Ok(contractTypes);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // GET: api/ContractType/5
        [HttpGet("{id}")]
        public async Task<ActionResult<ContractType>> GetContractType(int id)
        {
            try
            {
                var contractType = await _context.ContractTypes.FindAsync(id);

                if (contractType == null)
                {
                    return NotFound($"Contract type with ID {id} not found");
                }

                return Ok(contractType);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // POST: api/ContractType
        [HttpPost]
        public async Task<ActionResult<ContractType>> PostContractType(ContractType contractType)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                contractType.CreatedAt = DateTime.UtcNow;
                contractType.UpdatedAt = DateTime.UtcNow;

                _context.ContractTypes.Add(contractType);
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetContractType), new { id = contractType.Id }, contractType);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // PUT: api/ContractType/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutContractType(int id, ContractType contractType)
        {
            try
            {
                if (id != contractType.Id)
                {
                    return BadRequest("ID mismatch");
                }

                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var existingContractType = await _context.ContractTypes.FindAsync(id);
                if (existingContractType == null)
                {
                    return NotFound($"Contract type with ID {id} not found");
                }

                existingContractType.Name = contractType.Name;
                existingContractType.Code = contractType.Code;
                existingContractType.Description = contractType.Description;
                existingContractType.UpdatedAt = DateTime.UtcNow;

                _context.Entry(existingContractType).State = EntityState.Modified;

                try
                {
                    await _context.SaveChangesAsync();
                }
                catch (DbUpdateConcurrencyException)
                {
                    if (!ContractTypeExists(id))
                    {
                        return NotFound();
                    }
                    else
                    {
                        throw;
                    }
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // DELETE: api/ContractType/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteContractType(int id)
        {
            try
            {
                var contractType = await _context.ContractTypes.FindAsync(id);
                if (contractType == null)
                {
                    return NotFound($"Contract type with ID {id} not found");
                }

                _context.ContractTypes.Remove(contractType);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        private bool ContractTypeExists(int id)
        {
            return _context.ContractTypes.Any(e => e.Id == id);
        }
    }
}
