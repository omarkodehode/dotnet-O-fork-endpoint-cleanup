using Microsoft.EntityFrameworkCore;
using TimeTrackingApi.Data;
using TimeTrackingApi.DTOs.Absences; // Ensure you have this namespace for CreateAbsenceDto
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

        public async Task<List<Absence>> GetByManager(int managerId)
        {
            // 1. Find all employees managed by this ID
            var subordinateIds = _db.Employees
                .Where(e => e.ManagerId == managerId)
                .Select(e => e.Id);

            // 2. Fetch their absences
            return await _db.Absences
                .Include(a => a.Employee)
                .Where(a => subordinateIds.Contains(a.EmployeeId))
                .OrderByDescending(a => a.StartDate)
                .ToListAsync();
        }

        // ✅ NEW: Approve/Reject Absence
        public async Task<bool> ToggleApproval(int absenceId, bool isApproved)
        {
            var abs = await _db.Absences.FindAsync(absenceId);
            if (abs == null) return false;

            abs.Approved = isApproved;
            await _db.SaveChangesAsync();
            return true;
        }

        // --- GET ALL (Admin) ---
        public async Task<List<Absence>> GetAll()
        {
            return await _db.Absences
                .Include(a => a.Employee)
                .OrderByDescending(a => a.StartDate) // Updated to StartDate
                .ToListAsync();
        }

        // --- GET BY EMPLOYEE ---
        public async Task<List<Absence>> GetByEmployee(int userId)
        {
            var emp = await _db.Employees.FirstOrDefaultAsync(e => e.UserId == userId);
            if (emp == null) return new List<Absence>();

            return await _db.Absences
                .Where(a => a.EmployeeId == emp.Id)
                .OrderByDescending(a => a.StartDate)
                .ToListAsync();
        }

        // --- GET SINGLE BY ID ---
        public async Task<Absence?> GetById(int id)
        {
            return await _db.Absences
                .Include(a => a.Employee)
                .FirstOrDefaultAsync(a => a.Id == id);
        }

        // --- CREATE (Employee Request) ---
        public async Task<Absence?> Create(int userId, CreateAbsenceDto dto)
        {
            // 1. Validate Date Range
            if (dto.EndDate < dto.StartDate) return null; 

            // 2. Find Employee
            var emp = await _db.Employees.FirstOrDefaultAsync(e => e.UserId == userId);
            
            // Auto-create employee if missing (failsafe for this project)
            if (emp == null)
            {
                emp = new Employee 
                { 
                    UserId = userId, 
                    FullName = "Employee", 
                    Position = "Staff", 
                    HireDate = DateTime.UtcNow 
                };
                _db.Employees.Add(emp);
                await _db.SaveChangesAsync();
            }

            // 3. Ensure UTC
            var startUtc = DateTime.SpecifyKind(dto.StartDate, DateTimeKind.Utc);
            var endUtc = DateTime.SpecifyKind(dto.EndDate, DateTimeKind.Utc);

            // 4. Check for Overlapping Absences
            // (If existing Start is before new End AND existing End is after new Start)
            var overlap = await _db.Absences
                .AnyAsync(a => a.EmployeeId == emp.Id && 
                               a.StartDate <= endUtc && 
                               a.EndDate >= startUtc);
            
            if (overlap) return null; // Date range already taken

            // 5. Create & Save
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

        // --- CREATE (Admin Override) ---
        public async Task<Absence?> Create(Absence abs)
        {
            // Validate Employee exists
            var empExists = await _db.Employees.AnyAsync(e => e.Id == abs.EmployeeId);
            if (!empExists) return null;

            // Validate Dates
            if (abs.EndDate < abs.StartDate) return null;

            abs.StartDate = DateTime.SpecifyKind(abs.StartDate, DateTimeKind.Utc);
            abs.EndDate = DateTime.SpecifyKind(abs.EndDate, DateTimeKind.Utc);

            // Check Overlap
            var overlap = await _db.Absences
                .AnyAsync(a => a.EmployeeId == abs.EmployeeId && 
                               a.StartDate <= abs.EndDate && 
                               a.EndDate >= abs.StartDate);

            if (overlap) return null;

            _db.Absences.Add(abs);
            await _db.SaveChangesAsync();
            return abs;
        }

        // --- UPDATE ---
        public async Task<Absence?> Update(int id, Absence data)
        {
            var existing = await _db.Absences.FindAsync(id);
            if (existing == null) return null;

            // Validate Dates
            if (data.EndDate < data.StartDate) return null;

            existing.StartDate = DateTime.SpecifyKind(data.StartDate, DateTimeKind.Utc);
            existing.EndDate = DateTime.SpecifyKind(data.EndDate, DateTimeKind.Utc);
            
            // Update Type & Desc (Old 'Reason' is gone)
            existing.Type = data.Type;
            existing.Description = data.Description; 
            existing.Approved = data.Approved;

            await _db.SaveChangesAsync();
            return existing;
        }

        // --- DELETE ---
        public async Task<bool> Delete(int id)
        {
            var abs = await _db.Absences.FindAsync(id);
            if (abs == null) return false;

            _db.Absences.Remove(abs);
            await _db.SaveChangesAsync();
            return true;
        }

        // --- DASHBOARD HELPER ---
        public async Task<int> GetAbsenceCountForDate(DateTime date)
        {
            // Counts employees absent on a specific date (within range)
            return await _db.Absences
                .CountAsync(a => a.StartDate.Date <= date.Date && a.EndDate.Date >= date.Date);
        }

    }
}