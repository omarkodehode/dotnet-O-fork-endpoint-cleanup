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
                ClockIn = DateTime.UtcNow
            };

            _db.TimeEntries.Add(entry);
            await _db.SaveChangesAsync();
            return entry;
        }

        public async Task<TimeEntry?> ClockOut(int userId)
        {
            var entry = await GetCurrentEntry(userId);
            if (entry == null) return null;

            entry.ClockOut = DateTime.UtcNow;
            await _db.SaveChangesAsync();
            return entry;
        }

        // --- UPDATE / DELETE with LOCKING LOGIC ---

        public async Task<bool> UpdateEntry(int userId, int entryId, DateTime newIn, DateTime? newOut)
        {
            var entry = await _db.TimeEntries
                .Include(t => t.Employee)
                .FirstOrDefaultAsync(t => t.Id == entryId && t.Employee != null && t.Employee.UserId == userId);

            if (entry == null) return false;

            if (IsEntryLocked(entry))
                throw new InvalidOperationException("Cannot update entries that are approved or older than 7 days.");

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
                throw new InvalidOperationException("Cannot delete entries that are approved or older than 7 days.");

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

        // --- MANAGER & ADMIN FEATURES ---

        public async Task<object> GetTeamWeeklySummary(int managerId, int year, int weekNumber)
        {
            var employees = await _db.Employees
                .Where(e => e.ManagerId == managerId)
                .Include(e => e.TimeEntries)
                .ToListAsync();

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
                    Week = weekNumber,
                    TotalHours = Math.Round(totalHours, 2),
                    IsApproved = isApproved
                });
            }
            return result;
        }
        public async Task<List<TimeEntry>> GetEmployeeWeeklyDetails(int managerId, int employeeId, int year, int weekNumber)
        {
            var emp = await _db.Employees
                .Include(e => e.TimeEntries)
                .FirstOrDefaultAsync(e => e.Id == employeeId && e.ManagerId == managerId);

            if (emp == null) return new List<TimeEntry>();

            return emp.TimeEntries
                .Where(t => t.ClockIn.Year == year && GetIsoWeekOfYear(t.ClockIn) == weekNumber)
                .OrderBy(t => t.ClockIn)
                .ToList();
        }

        public async Task<bool> ApproveWeek(int managerId, int employeeId, int year, int weekNumber)
        {
            var emp = await _db.Employees
                .Include(e => e.TimeEntries)
                .FirstOrDefaultAsync(e => e.Id == employeeId && e.ManagerId == managerId);

            if (emp == null) return false;

            var entriesToLock = emp.TimeEntries
                .Where(t => GetIsoWeekOfYear(t.ClockIn) == weekNumber && t.ClockIn.Year == year)
                .ToList();

            foreach (var entry in entriesToLock)
            {
                entry.IsApproved = true;
                entry.ApprovedAt = DateTime.UtcNow;
            }

            await _db.SaveChangesAsync();
            return true;
        }

        public async Task<byte[]> GetPayrollCsv(int month, int year, int managerId)
        {
            return await GenerateCsv(month, year, managerId);
        }

        public async Task<byte[]> GetGlobalPayrollCsv(int month, int year)
        {
            return await GenerateCsv(month, year, null);
        }

        // ✅ 3. Shared CSV Logi
        private async Task<byte[]> GenerateCsv(int month, int year, int? managerId)
        {
            // Entries Query
            var query = _db.TimeEntries
                .Include(t => t.Employee)
                .Where(t => t.IsApproved && t.ClockIn.Month == month && t.ClockIn.Year == year);

            if (managerId.HasValue)
            {
                query = query.Where(t => t.Employee.ManagerId == managerId.Value);
            }

            var approvedEntries = await query
                .OrderBy(t => t.Employee != null ? t.Employee.FullName : "")
                .ThenBy(t => t.ClockIn)
                .ToListAsync();

            // Build CSV
            var sb = new StringBuilder();
            sb.AppendLine("EmployeeID;Name;Date;Hours;Type;ApprovedAt");

            foreach (var t in approvedEntries)
            {
                var hours = t.ClockOut.HasValue ? (t.ClockOut.Value - t.ClockIn).TotalHours : 0;
                sb.AppendLine($"{t.EmployeeId};{t.Employee?.FullName};{t.ClockIn:yyyy-MM-dd};{Math.Round(hours, 2)};Work;{t.ApprovedAt}");
            }

            // Absences Query
            var absQuery = _db.Absences
                .Include(a => a.Employee)
                .Where(a => a.Approved && a.StartDate.Month == month && a.StartDate.Year == year);

            if (managerId.HasValue)
            {
                absQuery = absQuery.Where(a => a.Employee.ManagerId == managerId.Value);
            }

            var approvedAbsences = await absQuery.ToListAsync();

            foreach (var a in approvedAbsences)
            {
                 var days = (a.EndDate - a.StartDate).TotalDays + 1;
                 var hours = days * 7.5;
                 sb.AppendLine($"{a.EmployeeId};{a.Employee?.FullName};{a.StartDate:yyyy-MM-dd};{hours};Absence-{a.Type};-");
            }

            return Encoding.UTF8.GetBytes(sb.ToString());
        }

        private static int GetIsoWeekOfYear(DateTime time)
        {
            DayOfWeek day = CultureInfo.InvariantCulture.Calendar.GetDayOfWeek(time);
            if (day >= DayOfWeek.Monday && day <= DayOfWeek.Wednesday)
            {
                time = time.AddDays(3);
            }
            return CultureInfo.InvariantCulture.Calendar.GetWeekOfYear(time, CalendarWeekRule.FirstFourDayWeek, DayOfWeek.Monday);
        }
    }
}