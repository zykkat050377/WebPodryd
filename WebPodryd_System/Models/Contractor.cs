// WebPodryd_System/Models/Contractor.cs

using System;
using System.ComponentModel.DataAnnotations;

namespace WebPodryd_System.Models
{
    public class Contractor
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string LastName { get; set; }

        [Required]
        [MaxLength(100)]
        public string FirstName { get; set; }

        [MaxLength(100)]
        public string MiddleName { get; set; }

        [Required]
        [MaxLength(50)]
        public string DocumentType { get; set; }

        [MaxLength(20)]
        public string DocumentSeries { get; set; }

        [Required]
        [MaxLength(50)]
        public string DocumentNumber { get; set; }

        [MaxLength(100)]
        public string Citizenship { get; set; }

        public DateTime? IssueDate { get; set; }

        [MaxLength(500)]
        public string IssuedBy { get; set; }

        [MaxLength(50)]
        public string IdentificationNumber { get; set; }

        [MaxLength(20)]
        public string MobilePhone { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public virtual BankDetail BankDetail { get; set; }
        public virtual Address Address { get; set; }
    }
}