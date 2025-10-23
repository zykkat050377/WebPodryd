// WebPodryd_System/Models/ContractWorkService.cs
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WebPodryd_System.Models
{
    public class ContractWorkService
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        public Guid ContractId { get; set; }

        [ForeignKey("ContractId")]
        public Contract Contract { get; set; }

        [Required]
        [MaxLength(500)]
        public string WorkServiceName { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal Cost { get; set; }

        // Для типа "operation" - количество операций
        public int? OperationCount { get; set; }

        // Для типа "norm-hour" - количество часов
        [Column(TypeName = "decimal(10,2)")]
        public decimal? HoursCount { get; set; }

        // Для типа "cost" - фиксированная стоимость
        [Column(TypeName = "decimal(18,2)")]
        public decimal? FixedCost { get; set; }

        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
