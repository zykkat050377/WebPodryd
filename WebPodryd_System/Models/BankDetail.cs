// WebPodryd_System/Models/BankDetail.cs

using System;
using System.ComponentModel.DataAnnotations;

namespace WebPodryd_System.Models
{
    public class BankDetail
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        public Guid ContractorId { get; set; }

        [Required]
        [MaxLength(34)]
        public string IBAN { get; set; }

        [Required]
        [MaxLength(255)]
        public string BankName { get; set; }

        [Required]
        [MaxLength(20)]
        public string BIC { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public virtual Contractor Contractor { get; set; }
    }
}