// WebPodryd_System/DTO/ContractTemplateDto.cs
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace WebPodryd_System.DTO
{
    public class ContractTemplateDto
    {
        public int Id { get; set; }

        [Required]
        public string Name { get; set; }

        // НОВОЕ: ID типа договора
        [Required]
        public int ContractTypeId { get; set; }
        public ContractTypeDto ContractType { get; set; }

        [Required]
        public string Type { get; set; } // operation, norm-hour, cost

        [Required]
        public List<string> WorkServices { get; set; }

        public int? OperationsPer8Hours { get; set; }

        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class CreateContractTemplateDto
    {
        [Required]
        [MaxLength(200)]
        public string Name { get; set; }

        // НОВОЕ: ID типа договора
        [Required]
        public int ContractTypeId { get; set; }

        [Required]
        [MaxLength(20)]
        public string Type { get; set; }

        [Required]
        [MinLength(1, ErrorMessage = "Должна быть указана хотя бы одна работа/услуга")]
        public List<string> WorkServices { get; set; }

        [Range(1, 1000)]
        public int? OperationsPer8Hours { get; set; }
    }

    public class UpdateContractTemplateDto
    {
        [MaxLength(200)]
        public string Name { get; set; }

        // НОВОЕ: ID типа договора
        public int? ContractTypeId { get; set; }

        [MaxLength(20)]
        public string Type { get; set; }

        [MinLength(1, ErrorMessage = "Должна быть указана хотя бы одна работа/услуга")]
        public List<string> WorkServices { get; set; }

        [Range(1, 1000)]
        public int? OperationsPer8Hours { get; set; }
    }
}