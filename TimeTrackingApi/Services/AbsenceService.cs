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

        // Main Create method: Takes userId + Absence object
        public async Task<Absence?> Create(int userId, Absence abs)
        {
            // 1. Find the Employee associated with this User
            var emp = await _db.Employees.FirstOrDefaultAsync(e => e.UserId == userId);
            if (emp == null) return null; // User is not an employee

            // 2. Ensure Date is UTC
            abs.Date = DateTime.SpecifyKind(abs.Date, DateTimeKind.Utc);

            // 3. CHECK FOR DUPLICATE
            var exists = await _db.Absences
                .AnyAsync(a => a.EmployeeId == emp.Id && a.Date.Date == abs.Date.Date);
            
            if (exists) 
                return null; // Return null to indicate duplicate

            // 4. Assign the correct EmployeeId
            abs.EmployeeId = emp.Id;

            _db.Absences.Add(abs);
            await _db.SaveChangesAsync();
            return abs;
        }

        // Overload for Admin usage (if needed)
        public async Task<Absence> Create(Absence abs)
        {
             abs.Date = DateTime.SpecifyKind(abs.Date, DateTimeKind.Utc);
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