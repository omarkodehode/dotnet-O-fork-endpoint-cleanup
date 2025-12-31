using Microsoft.EntityFrameworkCore;
using TimeTrackingApi.Data;
using TimeTrackingApi.Models;

namespace TimeTrackingApi.Services
{
    public class EmployeeService
    {
        private readonly AppDbContext _db;

        public EmployeeService(AppDbContext db)
        {
            _db = db;
        }

        public async Task<List<Employee>> GetAll() =>
            await _db.Employees.ToListAsync();

        public async Task<Employee?> Get(int id) =>
            await _db.Employees.FindAsync(id);

        public async Task<Employee?> GetByUserId(int userId) =>
            await _db.Employees.FirstOrDefaultAsync(e => e.UserId == userId);

        public async Task<Employee> Create(Employee emp)
        {
            _db.Employees.Add(emp);
            await _db.SaveChangesAsync();
            return emp;
        }

        public async Task<Employee?> Update(int id, Employee update)
        {
            var emp = await _db.Employees.FindAsync(id);
            if (emp == null) return null;

            emp.FullName = update.FullName;
            emp.Position = update.Position;
            emp.HireDate = update.HireDate;

            await _db.SaveChangesAsync();
            return emp;
        }

        // ✅ FIX: Delete both the Employee AND the associated User account
        public async Task<bool> Delete(int id)
        {
            // 1. Find the employee
            var emp = await _db.Employees.FindAsync(id);
            if (emp == null) return false;

            // 2. Find the associated User account (if any)
            if (emp.UserId.HasValue)
            {
                var user = await _db.Users.FindAsync(emp.UserId.Value);
                if (user != null)
                {
                    _db.Users.Remove(user);
                }
            }

            // 3. Remove the Employee (Cascading rules in AppDbContext will handle TimeEntries/Absences)
            _db.Employees.Remove(emp);
            
            await _db.SaveChangesAsync();
            return true;
        }
    }
}