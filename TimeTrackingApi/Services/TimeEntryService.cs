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
        public async Task<bool> UpdateEntry(int userId, int entryId, DateTime newClockIn, DateTime? newClockOut)
{
    var emp = await GetEmployeeByUserId(userId);
    if (emp == null) return false;

    var entry = await _db.TimeEntries
        .FirstOrDefaultAsync(t => t.Id == entryId && t.EmployeeId == emp.Id);

    if (entry == null) return false; 
    
    
    var now = DateTime.UtcNow;
    
   
    int diff = (7 + (now.DayOfWeek - DayOfWeek.Monday)) % 7;
    var startOfCurrentWeek = now.Date.AddDays(-diff); 

    if (entry.ClockIn.Date < startOfCurrentWeek)
    {
        throw new InvalidOperationException("Cannot edit entries from previous weeks.");
    }

    entry.ClockIn = newClockIn;
    entry.ClockOut = newClockOut;

    await _db.SaveChangesAsync();
    return true;
}
public async Task<List<TimeEntry>> GetHistory(int userId)
{
    var emp = await GetEmployeeByUserId(userId);
    if (emp == null) return new List<TimeEntry>();

    return await _db.TimeEntries
        .Where(t => t.EmployeeId == emp.Id && t.ClockIn > DateTime.UtcNow.AddDays(-30))
        .OrderByDescending(t => t.ClockIn)
        .ToListAsync();
}



        public async Task<List<TimeEntry>> GetAllActive()
        {
            return await _db.TimeEntries
                .Include(t => t.Employee)
                .Where(t => t.ClockOut == null)
                .ToListAsync();
        }
    }
}