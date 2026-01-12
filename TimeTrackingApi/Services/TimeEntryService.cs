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

        private async Task<Employee?> GetEmployeeByUserId(int userId)
        {
            return await _db.Employees.FirstOrDefaultAsync(e => e.UserId == userId);
        }
        private async Task<Employee?> GetEmployeeById(int employeeId)
{
    return await _db.Employees.FindAsync(employeeId);
}

        public async Task<TimeEntry?> ClockIn(int userId)
        {
            var emp = await GetEmployeeByUserId(userId);
            if (emp == null)
            {
                emp = new Employee { UserId = userId, FullName = "Employee", Position = "Staff", HireDate = DateTime.UtcNow };
                _db.Employees.Add(emp);
                await _db.SaveChangesAsync();
            }

            var active = await _db.TimeEntries.FirstOrDefaultAsync(t => t.EmployeeId == emp.Id && t.ClockOut == null);
            if (active != null) return null;

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
        public async Task<TimeEntry?> ClockInByEmployeeId(int employeeId)
{
    var emp = await GetEmployeeById(employeeId);
    if (emp == null) return null; // Admin cannot auto-create employees here

    // Check for active shift
    var active = await _db.TimeEntries
        .FirstOrDefaultAsync(t => t.EmployeeId == emp.Id && t.ClockOut == null);
        
    if (active != null) return null; // Already clocked in

    var entry = new TimeEntry { EmployeeId = emp.Id, ClockIn = DateTime.UtcNow };
    _db.TimeEntries.Add(entry);
    await _db.SaveChangesAsync();
    return entry;
}

// ✅ NEW: Admin specific Clock Out
public async Task<TimeEntry?> ClockOutByEmployeeId(int employeeId)
{
    var active = await _db.TimeEntries
        .FirstOrDefaultAsync(t => t.EmployeeId == employeeId && t.ClockOut == null);

    if (active == null) return null;

    active.ClockOut = DateTime.UtcNow;
    await _db.SaveChangesAsync();
    return active;
}

        // Fix: This method is required by DashboardEndpoints
        public async Task<List<TimeEntry>> GetAllActive()
        {
            return await _db.TimeEntries
                .Include(t => t.Employee)
                .Where(t => t.ClockOut == null)
                .ToListAsync();
        }
    }
}