// WebPodryd_System/Models/ContractTemplate.cs
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using WebPodryd_System.DTO;

namespace WebPodryd_System.Models
{
    [Table("ContractTemplates")]
    public class ContractTemplate
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        [StringLength(200)]
        public string Name { get; set; }

        [Required]
        [StringLength(50)]
        public string Type { get; set; } // operation, norm-hour, cost

        [Required]
        public int ContractTypeId { get; set; }

        [ForeignKey("ContractTypeId")]
        public ContractType ContractType { get; set; }

        [Required]
        [Column(TypeName = "nvarchar(max)")]
        public string WorkServicesJson { get; set; }

        [Required]
        public DateTime CreatedAt { get; set; }

        [Required]
        public DateTime UpdatedAt { get; set; }
    }

    public class CreateContractTemplateDto
    {
        [Required]
        [StringLength(200)]
        public string Name { get; set; }

        [Required]
        [StringLength(50)]
        public string Type { get; set; }

        [Required]
        public int ContractTypeId { get; set; }

        [Required]
        public List<string> WorkServices { get; set; } = new List<string>();
    }

    public class UpdateContractTemplateDto
    {
        [StringLength(200)]
        public string Name { get; set; }

        [StringLength(50)]
        public string Type { get; set; }

        public int? ContractTypeId { get; set; }

        public List<string> WorkServices { get; set; }
    }

    public class ContractTemplateDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Type { get; set; }
        public int ContractTypeId { get; set; }
        public ContractTypeDto ContractType { get; set; }
        public List<string> WorkServices { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}