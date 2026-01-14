using Microsoft.EntityFrameworkCore;
using TimeTrackingApi.Data;
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

        // ✅ Existing: Simple list
        public async Task<List<Department>> GetAll()
        {
            return await _db.Departments.ToListAsync();
        }

        // ✅ NEW: Critical for Admin Dashboard (Employees + Managers)
        public async Task<List<Department>> GetAllWithDetails()
        {
            return await _db.Departments
                .Include(d => d.Employees)
                    .ThenInclude(e => e.Manager) // Join to get Manager info
                .ToListAsync();
        }

        public async Task<Department?> Create(string name)
        {
            if (await _db.Departments.AnyAsync(d => d.Name == name)) return null;
            
            var dept = new Department { Name = name };
            _db.Departments.Add(dept);
            await _db.SaveChangesAsync();
            return dept;
        }

        public async Task<bool> Delete(int id)
        {
            var dept = await _db.Departments
                .Include(d => d.Employees)
                .FirstOrDefaultAsync(d => d.Id == id);
                
            if (dept == null) return false;

            if (dept.Employees.Any())
            {
                foreach (var emp in dept.Employees)
                {
                    emp.DepartmentId = null;
                }
            }

            _db.Departments.Remove(dept);
            await _db.SaveChangesAsync();
            return true;
        }
    }
}