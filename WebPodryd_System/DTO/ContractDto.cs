// WebPodryd_System/DTO/ContractDto.cs
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace WebPodryd_System.DTO
{
    public class ContractDto
    {
        public Guid Id { get; set; }

        [Required]
        public string ContractNumber { get; set; }

        [Required]
        public DateTime ContractDate { get; set; }

        [Required]
        public DateTime StartDate { get; set; }

        [Required]
        public DateTime EndDate { get; set; }

        [Required]
        public Guid ContractorId { get; set; }
        public ContractorDto Contractor { get; set; }

        [Required]
        public int DepartmentId { get; set; }
        public DepartmentDto Department { get; set; }

        // ИСПРАВЛЕНО: int? вместо Guid?
        public int? SigningEmployeeId { get; set; }
        public SigningEmployeeDto SigningEmployee { get; set; }

        // НОВОЕ: ID типа договора
        [Required]
        public int ContractTypeId { get; set; }
        public ContractTypeDto ContractType { get; set; }

        // Для обратной совместимости оставляем ContractType (string)
        [Required]
        public string ContractTypeCode { get; set; }

        [Required]
        public string ContractTemplateName { get; set; }

        [Required]
        public Guid ExecutorUserId { get; set; }
        public UserDto ExecutorUser { get; set; }

        public bool Processed { get; set; }
        public DateTime? TransferDate { get; set; }
        public DateTime? GalaxyEntryDate { get; set; }
        public string OKEmployee { get; set; }

        public List<ContractWorkServiceDto> WorkServices { get; set; }

        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class ContractWorkServiceDto
    {
        public Guid Id { get; set; }

        [Required]
        [MaxLength(500)]
        public string WorkServiceName { get; set; }

        [Required]
        public decimal Cost { get; set; }

        public int? OperationCount { get; set; }
        public decimal? HoursCount { get; set; }
        public decimal? FixedCost { get; set; }

        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class CreateContractDto
    {
        [Required]
        public DateTime ContractDate { get; set; }

        [Required]
        public DateTime StartDate { get; set; }

        [Required]
        public DateTime EndDate { get; set; }

        [Required]
        public Guid ContractorId { get; set; }

        [Required]
        public int DepartmentId { get; set; }

        // ИСПРАВЛЕНО: int? вместо Guid?
        public int? SigningEmployeeId { get; set; }

        // НОВОЕ: ID типа договора
        [Required]
        public int ContractTypeId { get; set; }

        [Required]
        public string ContractTemplateName { get; set; }

        [Required]
        [MinLength(1, ErrorMessage = "Должна быть указана хотя бы одна работа/услуга")]
        public List<CreateContractWorkServiceDto> WorkServices { get; set; }
    }

    public class CreateContractWorkServiceDto
    {
        [Required]
        [MaxLength(500)]
        public string WorkServiceName { get; set; }

        [Required]
        [Range(0.01, double.MaxValue, ErrorMessage = "Стоимость должна быть больше 0")]
        public decimal Cost { get; set; }

        [Range(1, int.MaxValue, ErrorMessage = "Количество операций должно быть больше 0")]
        public int? OperationCount { get; set; }

        [Range(0.01, double.MaxValue, ErrorMessage = "Количество часов должно быть больше 0")]
        public decimal? HoursCount { get; set; }

        [Range(0.01, double.MaxValue, ErrorMessage = "Фиксированная стоимость должна быть больше 0")]
        public decimal? FixedCost { get; set; }
    }

    public class UpdateContractDto
    {
        public DateTime? ContractDate { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public Guid? ContractorId { get; set; }
        public int? DepartmentId { get; set; }

        // ИСПРАВЛЕНО: int? вместо Guid?
        public int? SigningEmployeeId { get; set; }

        // НОВОЕ: ID типа договора
        public int? ContractTypeId { get; set; }

        [MaxLength(200)]
        public string ContractTemplateName { get; set; }
        public bool? Processed { get; set; }
        public DateTime? TransferDate { get; set; }
        public DateTime? GalaxyEntryDate { get; set; }

        [MaxLength(100)]
        public string OKEmployee { get; set; }

        [MinLength(1, ErrorMessage = "Должна быть указана хотя бы одна работа/услуга")]
        public List<CreateContractWorkServiceDto> WorkServices { get; set; }
    }
}