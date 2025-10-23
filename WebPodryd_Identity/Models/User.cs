// WebPodryd_Identity/Models/User.cs
using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Identity;

namespace WebPodryd_Identity.Models
{
    public class User : IdentityUser
    {
        public string LastName { get; set; }
        public string FirstName { get; set; }
        public string MiddleName { get; set; }
        public string Position { get; set; }
        public bool MustChangePassword { get; set; } = true;
        public DateTime? LastPasswordChange { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
