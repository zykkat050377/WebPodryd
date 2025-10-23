//WebPodryd_System/Models/ContractType.cs
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace WebPodryd_System.Models
{
    public class ContractType
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(50)]
        public string Name { get; set; }

        [Required]
        [MaxLength(20)]
        public string Code { get; set; }

        [MaxLength(200)]
        public string Description { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Навигационные свойства
        public virtual ICollection<ContractTemplate> ContractTemplates { get; set; }
        public virtual ICollection<Contract> Contracts { get; set; }

        public ContractType()
        {
            ContractTemplates = new HashSet<ContractTemplate>();
            Contracts = new HashSet<Contract>();
        }
    }
}