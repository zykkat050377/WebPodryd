// WebPodryd_System/Models/Department.cs
using System;
using System.ComponentModel.DataAnnotations;

namespace WebPodryd_System.Models
{
    public class Department
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string Name { get; set; }

        [MaxLength(50)]
        public string Code { get; set; } // Убедитесь, что это свойство есть только один раз

        //public DateTime? CreatedAt { get; set; }
    }
}