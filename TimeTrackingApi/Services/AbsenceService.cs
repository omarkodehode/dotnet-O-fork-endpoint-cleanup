using Microsoft.EntityFrameworkCore;
using TimeTrackingApi.Data;
using TimeTrackingApi.DTOs.Absences; 
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

        // --- ALIASES ---
        public async Task<List<Absence>> GetPendingAbsencesAsync() => await GetPending();
        public async Task<List<Absence>> GetAbsencesForEmployeeAsync(int employeeId) => await GetByEmployee(employeeId);
        public async Task<Absence?> CreateAbsenceAsync(CreateAbsenceDto dto) => await Create(dto.EmployeeId, dto);
        public async Task ApproveAbsenceAsync(int id, bool approved) => await ToggleApproval(id, approved);

        // --- CORE METHODS ---
        public async Task<List<Absence>> GetPending()
        {
            return await _db.Absences
                .Include(a => a.Employee)
                .Where(a => !a.Approved)
                .ToListAsync();
        }

        public async Task<List<Absence>> GetByManager(int managerId)
        {
            var subordinateIds = _db.Employees.Where(e => e.ManagerId == managerId).Select(e => e.Id);
            return await _db.Absences
                .Include(a => a.Employee)
                .Where(a => subordinateIds.Contains(a.EmployeeId))
                .OrderByDescending(a => a.StartDate)
                .ToListAsync();
        }

        public async Task<bool> ToggleApproval(int absenceId, bool isApproved)
        {
            var abs = await _db.Absences.FindAsync(absenceId);
            if (abs == null) return false;

            if (isApproved) abs.Approved = true;
            else _db.Absences.Remove(abs);
            
            await _db.SaveChangesAsync();
            return true;
        }

        public async Task<List<Absence>> GetAll()
        {
            return await _db.Absences.Include(a => a.Employee).OrderByDescending(a => a.StartDate).ToListAsync();
        }

        public async Task<List<Absence>> GetByEmployee(int id)
        {
            // Try by EmployeeId first
            var list = await _db.Absences.Where(a => a.EmployeeId == id).OrderByDescending(a => a.StartDate).ToListAsync();
            if (list.Any()) return list;

            // Fallback to UserId
            var emp = await _db.Employees.FirstOrDefaultAsync(e => e.UserId == id);
            if (emp != null)
            {
                return await _db.Absences.Where(a => a.EmployeeId == emp.Id).OrderByDescending(a => a.StartDate).ToListAsync();
            }
            return new List<Absence>();
        }

        public async Task<Absence?> GetById(int id)
        {
            return await _db.Absences.Include(a => a.Employee).FirstOrDefaultAsync(a => a.Id == id);
        }

        // Create with UserId or EmployeeId support
        public async Task<Absence?> Create(int id, CreateAbsenceDto dto)
        {
            if (dto.EndDate < dto.StartDate) return null; 

            var emp = await _db.Employees.FindAsync(id) ?? await _db.Employees.FirstOrDefaultAsync(e => e.UserId == id);
            if (emp == null) return null;

            var startUtc = DateTime.SpecifyKind(dto.StartDate, DateTimeKind.Utc);
            var endUtc = DateTime.SpecifyKind(dto.EndDate, DateTimeKind.Utc);

            var overlap = await _db.Absences
                .AnyAsync(a => a.EmployeeId == emp.Id && a.StartDate <= endUtc && a.EndDate >= startUtc);
            
            if (overlap) return null; 

            var absence = new Absence
            {
                EmployeeId = emp.Id,
                StartDate = startUtc,
                EndDate = endUtc,
                Type = dto.Type,
                Description = dto.Description,
                Approved = false
            };

            _db.Absences.Add(absence);
            await _db.SaveChangesAsync();
            return absence;
        }

        public async Task<Absence?> Create(Absence abs)
        {
            var empExists = await _db.Employees.AnyAsync(e => e.Id == abs.EmployeeId);
            if (!empExists) return null;
            if (abs.EndDate < abs.StartDate) return null;

            abs.StartDate = DateTime.SpecifyKind(abs.StartDate, DateTimeKind.Utc);
            abs.EndDate = DateTime.SpecifyKind(abs.EndDate, DateTimeKind.Utc);

            _db.Absences.Add(abs);
            await _db.SaveChangesAsync();
            return abs;
        }

        public async Task<bool> Delete(int id)
        {
            var abs = await _db.Absences.FindAsync(id);
            if (abs == null) return false;
            _db.Absences.Remove(abs);
            await _db.SaveChangesAsync();
            return true;
        }

        public async Task<int> GetAbsenceCountForDate(DateTime date)
        {
            return await _db.Absences.CountAsync(a => a.StartDate.Date <= date.Date && a.EndDate.Date >= date.Date);
        }

        // --- USERNAME-BASED METHODS ---
        public async Task<List<Absence>> GetByUsername(string username)
        {
            var user = await _db.Users.FirstOrDefaultAsync(u => u.Username == username);
            if (user == null) return new List<Absence>();

            var emp = await _db.Employees.FirstOrDefaultAsync(e => e.UserId == user.Id);
            if (emp == null) return new List<Absence>();

            return await _db.Absences
                .Where(a => a.EmployeeId == emp.Id)
                .OrderByDescending(a => a.StartDate)
                .ToListAsync();
        }

        public async Task<bool> DeleteByUsername(string username, int absenceId)
        {
            var user = await _db.Users.FirstOrDefaultAsync(u => u.Username == username);
            if (user == null) return false;

            var emp = await _db.Employees.FirstOrDefaultAsync(e => e.UserId == user.Id);
            if (emp == null) return false;

            var absence = await _db.Absences.FirstOrDefaultAsync(a => a.Id == absenceId && a.EmployeeId == emp.Id);
            if (absence == null) return false;

            _db.Absences.Remove(absence);
            await _db.SaveChangesAsync();
            return true;
        }

        public async Task<Absence?> CreateByUsername(string username, CreateAbsenceDto dto)
        {
            var user = await _db.Users.FirstOrDefaultAsync(u => u.Username == username);
            if (user == null) return null;

            var emp = await _db.Employees.FirstOrDefaultAsync(e => e.UserId == user.Id);
            if (emp == null) return null;

            if (dto.EndDate < dto.StartDate) return null;

            var startUtc = DateTime.SpecifyKind(dto.StartDate, DateTimeKind.Utc);
            var endUtc = DateTime.SpecifyKind(dto.EndDate, DateTimeKind.Utc);

            var overlap = await _db.Absences
                .AnyAsync(a => a.EmployeeId == emp.Id && a.StartDate <= endUtc && a.EndDate >= startUtc);

            if (overlap) return null;

            var absence = new Absence
            {
                EmployeeId = emp.Id,
                StartDate = startUtc,
                EndDate = endUtc,
                Type = dto.Type,
                Description = dto.Description,
                Approved = false
            };

            _db.Absences.Add(absence);
            await _db.SaveChangesAsync();
            return absence;
        }
    }
}