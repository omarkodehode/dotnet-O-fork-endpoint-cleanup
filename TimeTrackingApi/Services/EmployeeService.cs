using Microsoft.EntityFrameworkCore;
using TimeTrackingApi.Data;
using TimeTrackingApi.Models;

namespace TimeTrackingApi.Services
{
    public class EmployeeService
    {
        private readonly AppDbContext _db;
        public EmployeeService(AppDbContext db) { _db = db; }

        public async Task<List<Employee>> GetAll()
        {
            return await _db.Employees.ToListAsync();
        }

        public async Task<Employee?> GetById(int id)
        {
            return await _db.Employees.FindAsync(id);
        }

        public async Task<Employee?> Create(Employee emp)
        {
            _db.Employees.Add(emp);
            await _db.SaveChangesAsync();
            return emp;
        }

        // ✅ ADD THIS METHOD
        public async Task<Employee?> Update(int id, Employee input)
        {
            var existing = await _db.Employees.FindAsync(id);
            if (existing == null) return null;

            existing.FullName = input.FullName;
            existing.Position = input.Position;
            
                        
            await _db.SaveChangesAsync();
            return existing;
        }

        public async Task<bool> Delete(int id)
        {
            var emp = await _db.Employees.FindAsync(id);
            if (emp == null) return false;
            _db.Employees.Remove(emp);
            await _db.SaveChangesAsync();
            return true;
        }
    }
}