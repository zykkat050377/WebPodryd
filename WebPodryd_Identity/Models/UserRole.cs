//WebPodryd_Identity/Models/UserRole.cs
using System;
using Microsoft.AspNetCore.Identity;

namespace WebPodryd_Identity.Models
{
    public class UserRole : IdentityUserRole<string>
    {
        public DateTime AssignedDate { get; set; } = DateTime.UtcNow;
        public string AssignedBy { get; set; }

        // Навигационные свойства
        public virtual User User { get; set; }
        public virtual Role Role { get; set; }
    }
}
