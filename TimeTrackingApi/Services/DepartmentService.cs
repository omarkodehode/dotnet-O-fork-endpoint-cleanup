using Microsoft.EntityFrameworkCore;
using TimeTrackingApi.Data;
using TimeTrackingApi.DTOs;

using TimeTrackingApi.Models;

namespace TimeTrackingApi.Services
{
    public class DepartmentService
    {
        private readonly AppDbContext _db;

        public DepartmentService(AppDbContext db)
        {
            _db = db;
        }

        public async Task<List<DepartmentDto>> GetAllDepartments()
        {
            return await _db.Departments
                .Select(d => new DepartmentDto
                {
                    Id = d.Id,
                    Name = d.Name,
                    Description = d.Description,
                    EmployeeCount = d.Employees.Count
                })
                .ToListAsync();
        }

        public async Task<Department?> CreateDepartment(CreateDepartmentDto dto)
        {
            if (await _db.Departments.AnyAsync(d => d.Name == dto.Name))
                return null;

            var dept = new Department
            {
                Name = dto.Name,
                Description = dto.Description
            };

            _db.Departments.Add(dept);
            await _db.SaveChangesAsync();
            return dept;
        }

        public async Task<bool> DeleteDepartment(int id)
        {
            var dept = await _db.Departments.FindAsync(id);
            if (dept == null) return false;

            _db.Departments.Remove(dept);
            await _db.SaveChangesAsync();
            return true;
        }
    }
}