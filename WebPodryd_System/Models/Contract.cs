//WebPodryd_System/Models/Contract.cs
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WebPodryd_System.Models
{
    public class Contract
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        [MaxLength(50)]
        public string ContractNumber { get; set; }

        [Required]
        public DateTime ContractDate { get; set; }

        [Required]
        public DateTime StartDate { get; set; }

        [Required]
        public DateTime EndDate { get; set; }

        // Связь с подрядчиком (Guid)
        [Required]
        public Guid ContractorId { get; set; }
        public Contractor Contractor { get; set; }

        // Связь со структурной единицей (int)
        [Required]
        public int DepartmentId { get; set; }
        public Department Department { get; set; }

        // Связь с сотрудником (int) - ИСПРАВЛЕНО!
        public int? SigningEmployeeId { get; set; }
        public SigningEmployee SigningEmployee { get; set; }

        // НОВОЕ: Связь с типом договора
        [Required]
        public int ContractTypeId { get; set; }
        public ContractType ContractType { get; set; }

        // Тип договора: operation, norm-hour, cost (оставляем для обратной совместимости)
        [Required]
        [MaxLength(20)]
        public string ContractTypeCode { get; set; }

        // Название шаблона договора
        [Required]
        [MaxLength(200)]
        public string ContractTemplateName { get; set; }

        // Исполнитель (пользователь, создавший договор)
        [Required]
        public Guid ExecutorUserId { get; set; }

        // Статус обработки
        public bool Processed { get; set; } = false;
        public DateTime? TransferDate { get; set; }
        public DateTime? GalaxyEntryDate { get; set; }
        public string OKEmployee { get; set; }

        // Работы/услуги по договору
        public ICollection<ContractWorkService> WorkServices { get; set; }

        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        public Contract()
        {
            WorkServices = new HashSet<ContractWorkService>();
        }
    }
}