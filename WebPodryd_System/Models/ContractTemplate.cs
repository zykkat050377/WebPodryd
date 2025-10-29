// Models/ContractTemplate.cs
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WebPodryd_System.Models
{
    public class ContractTemplate
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(200)]
        public string Name { get; set; }

        [Required]
        [StringLength(20)]
        public string Type { get; set; } // "operation", "norm-hour", "cost"

        // Связь с типом договора
        public int ContractTypeId { get; set; }
        public ContractType ContractType { get; set; }

        // JSON с работами/услугами (без стоимости)
        [Required]
        public string WorkServicesJson { get; set; }

        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public string CreatedBy { get; set; }
        public string UpdatedBy { get; set; }

        // Навигационное свойство для ActTemplates
        public virtual ICollection<ActTemplate> ActTemplates { get; set; } = new HashSet<ActTemplate>();
    }
}