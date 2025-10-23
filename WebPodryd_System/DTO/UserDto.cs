// WebPodryd_System/DTO/UserDto.cs
using System.Collections.Generic;

namespace WebPodryd_System.DTO
{
    public class UserDto
    {
        public string Id { get; set; }
        public string LastName { get; set; }
        public string FirstName { get; set; }
        public string MiddleName { get; set; }
        public string Position { get; set; }
        public string Email { get; set; }
        public string Role { get; set; } // Будет заполнено на фронтенде
        public List<DepartmentDto> Departments { get; set; } = new List<DepartmentDto>();
    }

    public class CreateUserDto
    {
        public string IdentityUserId { get; set; }
        public string LastName { get; set; }
        public string FirstName { get; set; }
        public string MiddleName { get; set; }
        public string Position { get; set; }
        public string Email { get; set; }
        public List<int> DepartmentIds { get; set; } = new List<int>();
    }

    public class UpdateUserDto
    {
        public string LastName { get; set; }
        public string FirstName { get; set; }
        public string MiddleName { get; set; }
        public string Position { get; set; }
        public List<int> DepartmentIds { get; set; } = new List<int>();
    }

    public class DepartmentDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Code { get; set; }
    }
}