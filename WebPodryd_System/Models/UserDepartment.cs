// WebPodryd_System/Models/UserDepartment.cs
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WebPodryd_System.Models
{
    public class UserDepartment
    {
        [Key]
        [Column(Order = 1)]
        public string UserId { get; set; }

        [Key]
        [Column(Order = 2)]
        public int DepartmentId { get; set; }

        [ForeignKey("UserId")]
        public virtual ProfileUser User { get; set; }

        [ForeignKey("DepartmentId")]
        public virtual Department Department { get; set; }

        [MaxLength(256)]
        public string AssignedBy { get; set; }

        public DateTime AssignedDate { get; set; }
    }
}