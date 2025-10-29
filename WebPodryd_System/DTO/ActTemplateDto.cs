using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace WebPodryd_System.DTO
{
    public class ActTemplateDto
    {
        public int Id { get; set; }

        [Required]
        public string Name { get; set; }

        public int? ContractTypeId { get; set; } // УБРАТЬ [Required]
        public ContractTypeDto ContractType { get; set; }

        public int? ContractTemplateId { get; set; } // УБРАТЬ [Required]
        public ContractTemplateDto ContractTemplate { get; set; }

        public List<WorkServiceDto> WorkServices { get; set; } // УБРАТЬ [Required]

        public int? DepartmentId { get; set; } // УБРАТЬ [Required]
        public DepartmentDto Department { get; set; }

        public decimal? TotalCost { get; set; } // УБРАТЬ [Required]

        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class WorkServiceDto
    {
        public int Id { get; set; }

        [Required]
        public string Name { get; set; }

        [Required]
        [Range(0, double.MaxValue, ErrorMessage = "Стоимость должна быть неотрицательной")]
        public decimal Cost { get; set; }

        public int ActTemplateId { get; set; }
    }

    public class CreateActTemplateDto
    {
        [Required]
        [StringLength(200)]
        public string Name { get; set; }

        [Required]
        public int ContractTypeId { get; set; }

        [Required]
        public int ContractTemplateId { get; set; }

        [Required]
        [MinLength(1, ErrorMessage = "Должна быть указана хотя бы одна работа/услуга")]
        public List<WorkServiceDto> WorkServices { get; set; }

        [Required]
        public int DepartmentId { get; set; }

        [Required]
        [Range(0, double.MaxValue, ErrorMessage = "Общая стоимость должна быть неотрицательной")]
        public decimal TotalCost { get; set; }
    }

    public class UpdateActTemplateDto
    {
        [StringLength(200)]
        public string Name { get; set; }

        public int? ContractTypeId { get; set; }

        public int? ContractTemplateId { get; set; }

        [MinLength(1, ErrorMessage = "Должна быть указана хотя бы одна работа/услуга")]
        public List<WorkServiceDto> WorkServices { get; set; }

        public int? DepartmentId { get; set; }

        [Range(0, double.MaxValue, ErrorMessage = "Общая стоимость должна быть неотрицательной")]
        public decimal? TotalCost { get; set; }
    }
}