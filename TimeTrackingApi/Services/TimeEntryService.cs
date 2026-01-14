using Microsoft.EntityFrameworkCore;
using TimeTrackingApi.Data;
using TimeTrackingApi.Models;
using System.Globalization; 
using System.Text;

namespace TimeTrackingApi.Services
{
    public class TimeEntryService
    {
        private readonly AppDbContext _db;

        public TimeEntryService(AppDbContext db)
        {
            _db = db;
        }

        // --- ALIASES FOR ENDPOINTS ---
        public async Task<TimeEntry?> ClockInAsync(int userId) => await ClockIn(userId);
        public async Task<TimeEntry?> ClockOutAsync(int userId) => await ClockOut(userId);
        
        public async Task<object> GetStatusAsync(int userId)
        {
            var entry = await GetCurrentEntry(userId);
            return new 
            { 
                IsClockedIn = entry != null, 
                ClockIn = entry?.ClockIn 
            };
        }

        public async Task<object> GetWeeklySummaryForManagerAsync(int year, int week)
        {
            return await GetTeamWeeklySummaryLogic(null, year, week);
        }

        // --- CORE CRUD ---

        public async Task<List<TimeEntry>> GetAllActive()
        {
            return await _db.TimeEntries
                .Include(t => t.Employee)
                .Where(t => t.ClockOut == null)
                .ToListAsync();
        }

        public async Task<TimeEntry?> GetCurrentEntry(int userId)
        {
            return await _db.TimeEntries
                .Where(t => t.Employee != null && t.Employee.UserId == userId && t.ClockOut == null)
                .OrderByDescending(t => t.ClockIn)
                .FirstOrDefaultAsync();
        }

        public async Task<List<TimeEntry>> GetHistory(int userId)
        {
            return await _db.TimeEntries
                .Where(t => t.Employee != null && t.Employee.UserId == userId && t.ClockOut != null)
                .OrderByDescending(t => t.ClockIn)
                .Take(50) 
                .ToListAsync();
        }

        public async Task<TimeEntry?> ClockIn(int userId)
        {
            var emp = await _db.Employees.FirstOrDefaultAsync(e => e.UserId == userId);
            if (emp == null) return null; 

            var active = await GetCurrentEntry(userId);
            if (active != null) return null; 

            var entry = new TimeEntry
            {
                EmployeeId = emp.Id,
                ClockIn = DateTime.UtcNow,
                IsApproved = false
            };

            _db.TimeEntries.Add(entry);
            await _db.SaveChangesAsync();
            return entry;
        }

        public async Task<TimeEntry?> ClockOut(int userId)
        {
            var entry = await GetCurrentEntry(userId);
            if (entry == null) return null; 

            if (DateTime.UtcNow < entry.ClockIn) 
                throw new InvalidOperationException("Cannot clock out before clock in time.");

            entry.ClockOut = DateTime.UtcNow;
            await _db.SaveChangesAsync();
            return entry;
        }

        // --- UPDATE / DELETE ---

        public async Task<bool> UpdateEntry(int userId, int entryId, DateTime newIn, DateTime? newOut)
        {
            var entry = await _db.TimeEntries
                .Include(t => t.Employee)
                .FirstOrDefaultAsync(t => t.Id == entryId && t.Employee != null && t.Employee.UserId == userId);

            if (entry == null) return false;

            if (IsEntryLocked(entry))
                throw new InvalidOperationException("Cannot update locked entries.");

            if (newOut.HasValue && newOut.Value < newIn)
                throw new ArgumentException("Clock out time cannot be before clock in time.");

            entry.ClockIn = newIn;
            entry.ClockOut = newOut;
            await _db.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteEntry(int userId, int entryId)
        {
            var entry = await _db.TimeEntries
                 .Include(t => t.Employee)
                 .FirstOrDefaultAsync(t => t.Id == entryId && t.Employee != null && t.Employee.UserId == userId);

            if (entry == null) return false;

            if (IsEntryLocked(entry))
                throw new InvalidOperationException("Cannot delete locked entries.");

            _db.TimeEntries.Remove(entry);
            await _db.SaveChangesAsync();
            return true;
        }

        private bool IsEntryLocked(TimeEntry entry)
        {
            if (entry.IsApproved) return true;
            if (entry.ClockIn < DateTime.UtcNow.AddDays(-7)) return true;
            return false;
        }

        // --- FLEX BALANCE ---

        public async Task<double> GetFlexBalance(int userId)
        {
            var entries = await _db.TimeEntries
                .Where(t => t.Employee != null && t.Employee.UserId == userId && t.ClockOut != null)
                .ToListAsync();

            double totalWorkedHours = entries.Sum(e => (e.ClockOut!.Value - e.ClockIn).TotalHours);

            var absences = await _db.Absences
                .Where(a => a.Employee != null && a.Employee.UserId == userId && a.Approved)
                .ToListAsync();

            foreach(var abs in absences)
            {
                var days = (abs.EndDate - abs.StartDate).TotalDays + 1; 
                totalWorkedHours += (days * 7.5);
            }

            if (!entries.Any()) return 0;
            
            var firstDate = entries.Min(e => e.ClockIn).Date;
            var today = DateTime.UtcNow.Date;
            
            int businessDays = 0;
            for (var date = firstDate; date <= today; date = date.AddDays(1))
            {
                if (date.DayOfWeek != DayOfWeek.Saturday && date.DayOfWeek != DayOfWeek.Sunday)
                    businessDays++;
            }

            double expectedHours = businessDays * 7.5;
            return Math.Round(totalWorkedHours - expectedHours, 2);
        }

        public async Task<double> GetTotalHoursForWeek(DateTime startOfWeek, DateTime endOfWeek)
        {
            var entries = await _db.TimeEntries
                .Where(t => t.ClockIn >= startOfWeek && t.ClockIn <= endOfWeek && t.ClockOut != null)
                .ToListAsync();

            return entries.Sum(t => (t.ClockOut!.Value - t.ClockIn).TotalHours);
        }

        // --- MANAGER HELPERS ---

        public async Task<object> GetTeamWeeklySummary(int managerId, int year, int weekNumber)
        {
            return await GetTeamWeeklySummaryLogic(managerId, year, weekNumber);
        }

        private async Task<object> GetTeamWeeklySummaryLogic(int? managerId, int year, int weekNumber)
        {
            var query = _db.Employees.Include(e => e.TimeEntries).AsQueryable();
            if (managerId.HasValue) query = query.Where(e => e.ManagerId == managerId);

            var employees = await query.ToListAsync();
            var result = new List<object>();

            foreach (var emp in employees)
            {
                var weekEntries = emp.TimeEntries
                    .Where(t => GetIsoWeekOfYear(t.ClockIn) == weekNumber && t.ClockIn.Year == year)
                    .ToList();

                var totalHours = weekEntries.Where(t => t.ClockOut.HasValue)
                                            .Sum(t => (t.ClockOut!.Value - t.ClockIn).TotalHours);

                var isApproved = weekEntries.Any() && weekEntries.All(t => t.IsApproved);

                result.Add(new 
                {
                    EmployeeId = emp.Id,
                    Name = emp.FullName,
                    TotalHours = Math.Round(totalHours, 2),
                    IsApproved = isApproved
                });
            }
            return result;
        }

        public async Task<List<WeeklyDetailDto>> GetWeeklyDetailsAsync(int employeeId, int year, int week)
        {
            var jan1 = new DateTime(year, 1, 1);
            var daysOffset = DayOfWeek.Monday - jan1.DayOfWeek;
            var firstMonday = jan1.AddDays(daysOffset);
            var weekNum = ISOWeek.GetWeekOfYear(jan1);
            if (weekNum > 1) firstMonday = firstMonday.AddDays(-7); 
            
            var startOfWeek = firstMonday.AddDays((week - 1) * 7);
            var endOfWeek = startOfWeek.AddDays(7);

            var entries = await _db.TimeEntries
                .Where(t => t.EmployeeId == employeeId && t.ClockIn >= startOfWeek && t.ClockIn < endOfWeek)
                .ToListAsync();

            return entries.Select(e => new WeeklyDetailDto
            {
                Date = e.ClockIn,
                ClockIn = e.ClockIn,
                ClockOut = e.ClockOut,
                Hours = e.ClockOut.HasValue ? (e.ClockOut.Value - e.ClockIn).TotalHours : 0,
                IsApproved = e.IsApproved
            }).ToList();
        }

        public async Task ApproveWeekAsync(int employeeId, int year, int week)
        {
            var jan1 = new DateTime(year, 1, 1);
            var daysOffset = DayOfWeek.Monday - jan1.DayOfWeek;
            var firstMonday = jan1.AddDays(daysOffset);
            var startOfWeek = firstMonday.AddDays((week - 1) * 7);
            var endOfWeek = startOfWeek.AddDays(7);

            var entries = await _db.TimeEntries
                .Where(t => t.EmployeeId == employeeId && t.ClockIn >= startOfWeek && t.ClockIn < endOfWeek)
                .ToListAsync();

            foreach(var e in entries) 
            {
                e.IsApproved = true;
                e.ApprovedAt = DateTime.UtcNow;
            }
            await _db.SaveChangesAsync();
        }

        public async Task<byte[]> GetGlobalPayrollCsv(int month, int year)
        {
            return await GenerateCsv(month, year, null);
        }

        public async Task<byte[]> GetPayrollCsv(int month, int year, int managerId)
        {
            return await GenerateCsv(month, year, managerId);
        }

        private async Task<byte[]> GenerateCsv(int month, int year, int? managerId)
        {
            var query = _db.TimeEntries.Include(t => t.Employee)
                .Where(t => t.IsApproved && t.ClockIn.Month == month && t.ClockIn.Year == year);

            if (managerId.HasValue) 
                query = query.Where(t => t.Employee != null && t.Employee.ManagerId == managerId.Value);

            var approvedEntries = await query.OrderBy(t => t.Employee != null ? t.Employee.FullName : "").ThenBy(t => t.ClockIn).ToListAsync();
            var sb = new StringBuilder();
            sb.AppendLine("EmployeeID;Name;Date;Hours;Type;ApprovedAt");

            foreach (var t in approvedEntries)
            {
                var hours = t.ClockOut.HasValue ? (t.ClockOut.Value - t.ClockIn).TotalHours : 0;
                sb.AppendLine($"{t.EmployeeId};{t.Employee?.FullName};{t.ClockIn:yyyy-MM-dd};{Math.Round(hours, 2)};Work;{t.ApprovedAt}");
            }
            return Encoding.UTF8.GetBytes(sb.ToString());
        }

        private static int GetIsoWeekOfYear(DateTime time)
        {
            DayOfWeek day = CultureInfo.InvariantCulture.Calendar.GetDayOfWeek(time);
            if (day >= DayOfWeek.Monday && day <= DayOfWeek.Wednesday) time = time.AddDays(3);
            return CultureInfo.InvariantCulture.Calendar.GetWeekOfYear(time, CalendarWeekRule.FirstFourDayWeek, DayOfWeek.Monday);
        }
    }

    public class WeeklyDetailDto
    {
        public DateTime Date { get; set; }
        public DateTime ClockIn { get; set; }
        public DateTime? ClockOut { get; set; }
        public double Hours { get; set; }
        public bool IsApproved { get; set; }
    }
}