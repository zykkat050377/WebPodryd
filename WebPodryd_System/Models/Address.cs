// WebPodryd_System/Models/Address.cs

using System;
using System.ComponentModel.DataAnnotations;

namespace WebPodryd_System.Models
{
    public class Address
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        public Guid ContractorId { get; set; }

        [Required]
        [MaxLength(100)]
        public string Country { get; set; }

        [MaxLength(100)]
        public string Region { get; set; }

        [MaxLength(100)]
        public string City { get; set; }

        [MaxLength(100)]
        public string District { get; set; }

        [MaxLength(100)]
        public string Settlement { get; set; }

        [MaxLength(50)]
        public string StreetType { get; set; }

        [MaxLength(200)]
        public string StreetName { get; set; }

        [MaxLength(20)]
        public string House { get; set; }

        [MaxLength(20)]
        public string Building { get; set; }

        [MaxLength(20)]
        public string Apartment { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public virtual Contractor Contractor { get; set; }
    }
}