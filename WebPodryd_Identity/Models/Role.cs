//WebPodryd_Identity/Models/Role.cs
using System.Collections.Generic;
using Microsoft.AspNetCore.Identity;

namespace WebPodryd_Identity.Models
{
    public class Role : IdentityRole<string>
    {
        public string Description { get; set; }
        public bool IsSystemRole { get; set; } = true;
        public ICollection<UserRole> UserRoles { get; set; }
    }
}