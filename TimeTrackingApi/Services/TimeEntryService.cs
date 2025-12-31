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

        public async Task<TimeEntry?> ClockIn(int employeeId)
        {
            var employee = await _db.Employees.FirstOrDefaultAsync(e => e.UserId == employeeId);
            if (employee == null)
            {
                employee = new Employee
                {
                    UserId = employeeId,
                    FullName = string.Empty,
                    Position = string.Empty,
                    HireDate = DateTime.UtcNow
                };

                _db.Employees.Add(employee);
                await _db.SaveChangesAsync();
            }

            var active = await _db.TimeEntries
                .FirstOrDefaultAsync(t => t.EmployeeId == employee.Id && t.ClockOut == null);

            if (active != null)
                return null;

            var entry = new TimeEntry
            {
                EmployeeId = employee.Id,
                ClockIn = DateTime.UtcNow
            };

            _db.TimeEntries.Add(entry);
            await _db.SaveChangesAsync();
            return entry;
        }

        public async Task<TimeEntry?> ClockOut(int employeeId)
        {
            var employee = await _db.Employees.FirstOrDefaultAsync(e => e.UserId == employeeId);
            if (employee == null)
                return null;

            var active = await _db.TimeEntries
                .FirstOrDefaultAsync(t => t.EmployeeId == employee.Id && t.ClockOut == null);

            if (active == null)
                return null;

            active.ClockOut = DateTime.UtcNow;
            await _db.SaveChangesAsync();
            return active;
        }

        public async Task<List<TimeEntry>> GetActiveByUser(int userId)
        {
            var employee = await _db.Employees.FirstOrDefaultAsync(e => e.UserId == userId);
            if (employee == null)
                return new List<TimeEntry>();

            return await _db.TimeEntries
                .Where(t => t.EmployeeId == employee.Id && t.ClockOut == null)
                .ToListAsync();
        }

        public async Task<List<TimeEntry>> GetAllActive()
        {
            return await _db.TimeEntries
                .Where(t => t.ClockOut == null)
                .ToListAsync();
        }

        public async Task<List<TimeEntry>> GetByUserId(int userId)
        {
            var employee = await _db.Employees.FirstOrDefaultAsync(e => e.UserId == userId);
            if (employee == null) return new List<TimeEntry>();

            return await _db.TimeEntries
                .Where(t => t.EmployeeId == employee.Id)
                .OrderByDescending(t => t.ClockIn)
                .ToListAsync();
        }
    }
}
