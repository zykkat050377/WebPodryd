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

        [Required]
        public string Type { get; set; } // operation, norm-hour, cost

        [Required]
        public int ContractTypeId { get; set; }
        public ContractTypeDto ContractType { get; set; }

        [Required]
        public List<string> WorkServices { get; set; }

        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class CreateContractTemplateDto
    {
        [Required]
        [MaxLength(200)]
        public string Name { get; set; }

        [Required]
        public int ContractTypeId { get; set; }

        public int? DepartmentId { get; set; } // Теперь необязательный

        public decimal? Cost { get; set; } // Теперь необязательный

        [Required]
        [MinLength(1, ErrorMessage = "Должна быть указана хотя бы одна работа/услуга")]
        public List<string> WorkServices { get; set; }

        public string CreatedBy { get; set; }
        public string UpdatedBy { get; set; }
    }

    public class UpdateContractTemplateDto
    {
        [MaxLength(200)]
        public string Name { get; set; }

        public int? ContractTypeId { get; set; }

        public int? DepartmentId { get; set; }

        public decimal? Cost { get; set; }

        [MinLength(1, ErrorMessage = "Должна быть указана хотя бы одна работа/услуга")]
        public List<string> WorkServices { get; set; }

        public string UpdatedBy { get; set; }
    }
}