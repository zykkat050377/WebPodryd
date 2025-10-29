// Models/ActTemplate.cs
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WebPodryd_System.Models
{
    public class ActTemplate
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(200)]
        public string Name { get; set; }

        // Связь с типом договора
        [Required]
        public int ContractTypeId { get; set; }
        [ForeignKey("ContractTypeId")]
        public ContractType ContractType { get; set; }

        // Связь с ContractTemplate
        [Required]
        public int ContractTemplateId { get; set; }
        [ForeignKey("ContractTemplateId")]
        public ContractTemplate ContractTemplate { get; set; }

        // JSON с работами/услугами и их стоимостями
        [Required]
        public string WorkServicesJson { get; set; }

        // Связь с департаментом
        [Required]
        public int DepartmentId { get; set; }
        [ForeignKey("DepartmentId")]
        public Department Department { get; set; }

        // Общая стоимость
        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalCost { get; set; }

        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class WorkService
    {
        public string Name { get; set; }
        public decimal Cost { get; set; }
    }
}