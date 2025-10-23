// WebPodryd_System/Models/ContractTemplate.cs
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
        [MaxLength(200)]
        public string Name { get; set; }

        // НОВОЕ: Связь с типом договора
        [Required]
        public int ContractTypeId { get; set; }
        public ContractType ContractType { get; set; }

        // Тип договора: operation, norm-hour, cost (оставляем для обратной совместимости)
        [Required]
        [MaxLength(20)]
        public string Type { get; set; }

        // JSON-строка для хранения массива работ/услуг
        [Required]
        public string WorkServicesJson { get; set; }

        // Для типа "operation" - количество операций за 8 часов
        public int? OperationsPer8Hours { get; set; }

        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        // Вспомогательное свойство для работы с JSON
        [NotMapped]
        public List<string> WorkServices
        {
            get => System.Text.Json.JsonSerializer.Deserialize<List<string>>(WorkServicesJson ?? "[]") ?? new List<string>();
            set => WorkServicesJson = System.Text.Json.JsonSerializer.Serialize(value ?? new List<string>());
        }
    }
}