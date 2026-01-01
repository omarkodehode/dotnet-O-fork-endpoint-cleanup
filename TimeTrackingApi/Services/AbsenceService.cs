using Microsoft.EntityFrameworkCore;
using TimeTrackingApi.Data;
using TimeTrackingApi.Models;

namespace TimeTrackingApi.Services
{
    public class AbsenceService
    {
        private readonly AppDbContext _db;

        public AbsenceService(AppDbContext db)
        {
            _db = db;
        }

        public async Task<List<Absence>> GetAll()
        {
            return await _db.Absences.Include(a => a.Employee).ToListAsync();
        }

        public async Task<List<Absence>> GetByEmployee(int userId)
        {
            var emp = await _db.Employees.FirstOrDefaultAsync(e => e.UserId == userId);
            if (emp == null) return new List<Absence>();

            return await _db.Absences
                .Where(a => a.EmployeeId == emp.Id)
                .OrderByDescending(a => a.Date)
                .ToListAsync();
        }

        public async Task<Absence?> GetById(int id)
        {
            return await _db.Absences.FindAsync(id);
        }

        // METHOD 1: Employee Create (With Auto-Create Logic)
        public async Task<Absence?> Create(int userId, Absence abs)
        {
            // 1. Find or Auto-Create Employee
            var emp = await _db.Employees.FirstOrDefaultAsync(e => e.UserId == userId);
            if (emp == null)
            {
                emp = new Employee 
                { 
                    UserId = userId, 
                    FullName = "Employee", // Default name
                    Position = "Staff", 
                    HireDate = DateTime.UtcNow 
                };
                _db.Employees.Add(emp);
                await _db.SaveChangesAsync();
            }

            abs.Date = DateTime.SpecifyKind(abs.Date, DateTimeKind.Utc);

            // 2. Check Duplicate
            var exists = await _db.Absences
                .AnyAsync(a => a.EmployeeId == emp.Id && a.Date.Date == abs.Date.Date);
            
            if (exists) return null;

            // 3. Save
            abs.EmployeeId = emp.Id;
            _db.Absences.Add(abs);
            await _db.SaveChangesAsync();
            return abs;
        }

        // METHOD 2: Admin Create
        public async Task<Absence?> Create(Absence abs)
        {
            var empExists = await _db.Employees.AnyAsync(e => e.Id == abs.EmployeeId);
            if (!empExists) return null;

            abs.Date = DateTime.SpecifyKind(abs.Date, DateTimeKind.Utc);

            var exists = await _db.Absences
                .AnyAsync(a => a.EmployeeId == abs.EmployeeId && a.Date.Date == abs.Date.Date);
            
            if (exists) return null;

            _db.Absences.Add(abs);
            await _db.SaveChangesAsync();
            return abs;
        }

        public async Task<Absence?> Update(int id, Absence data)
        {
            var existing = await _db.Absences.FindAsync(id);
            if (existing == null) return null;

            existing.Date = DateTime.SpecifyKind(data.Date, DateTimeKind.Utc);
            existing.Reason = data.Reason;

            await _db.SaveChangesAsync();
            return existing;
        }

        public async Task<bool> Delete(int id)
        {
            var abs = await _db.Absences.FindAsync(id);
            if (abs == null) return false;

            _db.Absences.Remove(abs);
            await _db.SaveChangesAsync();
            return true;
        }
    }
}