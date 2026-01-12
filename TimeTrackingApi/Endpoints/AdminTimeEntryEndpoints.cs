using Microsoft.EntityFrameworkCore;
using TimeTrackingApi.Data;
using TimeTrackingApi.Models;

namespace TimeTrackingApi.Services
{
    public class TimeEntryService
    {
        private readonly AppDbContext _db;

        public TimeEntryService(AppDbContext db)
        {
            _db = db;
        }

        // --- Methods for "My Page" (User acting on themselves via UserId) ---

        private async Task<Employee?> GetEmployeeByUserId(int userId)
        {
            return await _db.Employees.FirstOrDefaultAsync(e => e.UserId == userId);
        }

        public async Task<TimeEntry?> ClockIn(int userId)
        {
            var emp = await GetEmployeeByUserId(userId);
            // Fallback: If employee profile missing, create one (Optional, maybe risky)
            if (emp == null)
            {
                emp = new Employee { UserId = userId, FullName = "Employee", Position = "Staff", HireDate = DateTime.UtcNow };
                _db.Employees.Add(emp);
                await _db.SaveChangesAsync();
            }

            var active = await _db.TimeEntries.FirstOrDefaultAsync(t => t.EmployeeId == emp.Id && t.ClockOut == null);
            if (active != null) return null; // Already clocked in

            var entry = new TimeEntry { EmployeeId = emp.Id, ClockIn = DateTime.UtcNow };
            _db.TimeEntries.Add(entry);
            await _db.SaveChangesAsync();
            return entry;
        }

        public async Task<TimeEntry?> ClockOut(int userId)
        {
            var emp = await GetEmployeeByUserId(userId);
            if (emp == null) return null;

            var active = await _db.TimeEntries.FirstOrDefaultAsync(t => t.EmployeeId == emp.Id && t.ClockOut == null);
            if (active == null) return null;

            active.ClockOut = DateTime.UtcNow;
            await _db.SaveChangesAsync();
            return active;
        }

        public async Task<TimeEntry?> GetCurrentEntry(int userId)
        {
            var emp = await GetEmployeeByUserId(userId);
            if (emp == null) return null;
            return await _db.TimeEntries
                .Where(t => t.EmployeeId == emp.Id && t.ClockOut == null)
                .OrderByDescending(t => t.ClockIn)
                .FirstOrDefaultAsync();
        }

        public async Task<List<TimeEntry>> GetAllActive()
        {
            return await _db.TimeEntries
                .Include(t => t.Employee)
                .Where(t => t.ClockOut == null)
                .ToListAsync();
        }

        // --- NYE METODER FOR ADMIN (Bruker EmployeeId direkte) ---

        public async Task<TimeEntry?> ClockInByEmployeeId(int employeeId)
        {
            // 1. Check if employee exists
            var emp = await _db.Employees.FindAsync(employeeId);
            if (emp == null) return null;

            // 2. Check if already active
            var active = await _db.TimeEntries.FirstOrDefaultAsync(t => t.EmployeeId == emp.Id && t.ClockOut == null);
            if (active != null) return null; // Allerede stemplet inn

            // 3. Create entry
            var entry = new TimeEntry { EmployeeId = emp.Id, ClockIn = DateTime.UtcNow };
            _db.TimeEntries.Add(entry);
            await _db.SaveChangesAsync();
            return entry;
        }

        public async Task<TimeEntry?> ClockOutByEmployeeId(int employeeId)
        {
            // 1. Find active shift for this specific employee ID
            var active = await _db.TimeEntries.FirstOrDefaultAsync(t => t.EmployeeId == employeeId && t.ClockOut == null);
            if (active == null) return null; // Ingen aktiv vakt

            // 2. Clock out
            active.ClockOut = DateTime.UtcNow;
            await _db.SaveChangesAsync();
            return active;
        }
    }
}