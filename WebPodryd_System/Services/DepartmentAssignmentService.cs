// WebPodryd_System/Services/DepartmentAssignmentService.cs
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using WebPodryd_System.Data;
using WebPodryd_System.Models;

namespace WebPodryd_System.Services
{
    public class DepartmentAssignmentService
    {
        private readonly AppDbContext _context;
        private readonly IIdentityServiceClient _identityClient;

        public DepartmentAssignmentService(
            AppDbContext context,
            IIdentityServiceClient identityClient)
        {
            _context = context;
            _identityClient = identityClient;
        }

        public async Task AssignUserToDepartmentAsync(
            string userId, // Изменено с int на string
            int departmentId,
            string assignedBy)
        {
            var userExists = await _identityClient.CheckUserExistsAsync(userId);
            if (!userExists) throw new Exception("Пользователь не найден");

            var departmentExists = await _context.Departments
                .AnyAsync(d => d.Id == departmentId);
            if (!departmentExists) throw new Exception("Департамент не найден");

            var existingAssignments = _context.UserDepartments
                .Where(ud => ud.UserId == userId);
            _context.UserDepartments.RemoveRange(existingAssignments);

            var assignment = new UserDepartment
            {
                UserId = userId,
                DepartmentId = departmentId,
                AssignedBy = assignedBy,
                AssignedDate = DateTime.UtcNow
            };

            _context.UserDepartments.Add(assignment);
            await _context.SaveChangesAsync();
        }

        public async Task<List<DepartmentWithUsersDto>> GetUserDepartmentsAsync(string userId) // Изменено с int на string
        {
            return await _context.UserDepartments
                .Where(ud => ud.UserId == userId)
                .Include(ud => ud.Department)
                .Select(ud => new DepartmentWithUsersDto
                {
                    DepartmentId = ud.Department.Id,
                    DepartmentName = ud.Department.Name,
                    AssignedDate = ud.AssignedDate
                })
                .ToListAsync();
        }
    }

    public class DepartmentWithUsersDto
    {
        public int DepartmentId { get; set; }
        public string DepartmentName { get; set; }
        public DateTime AssignedDate { get; set; }
    }
}