using Microsoft.EntityFrameworkCore;
using TimeTrackingApi.Data;
using TimeTrackingApi.Models;

namespace TimeTrackingApi.Services
{
    public class EmployeeService
    {
        private readonly AppDbContext _db;
        public EmployeeService(AppDbContext db) { _db = db; }

        public async Task<List<Employee>> GetAll()
        {
            return await _db.Employees
                .Include(e => e.Department)
                .Include(e => e.User)
                .ToListAsync();
        }

        public async Task<Employee?> GetById(int id)
        {
            return await _db.Employees
                .Include(e => e.Department)
                .Include(e => e.User)
                .FirstOrDefaultAsync(e => e.Id == id);
        }

        public async Task<Employee?> Create(Employee emp)
        {
            // VIKTIG: Hindrer at EF prøver å opprette User/Department på nytt
            // ved å kun bruke ID-ene for koblingen.
            emp.User = null;
            emp.Department = null;
            emp.Manager = null;

            _db.Employees.Add(emp);
            await _db.SaveChangesAsync();
            return emp;
        }

        public async Task<Employee?> Update(int id, Employee input)
        {
            var existing = await _db.Employees.FindAsync(id);
            if (existing == null) return null;

            // Oppdater vanlige felter
            existing.FullName = input.FullName;
            existing.Position = input.Position;
            existing.HireDate = input.HireDate;

            // Oppdater relasjoner
            existing.DepartmentId = input.DepartmentId;
            existing.ManagerId = input.ManagerId;
            existing.UserId = input.UserId;

            await _db.SaveChangesAsync();
            return existing;
        }

        public async Task<bool> Delete(int id)
        {
            var emp = await _db.Employees.Include(e => e.User).FirstOrDefaultAsync(e => e.Id == id);
            if (emp == null) return false;

            // Slett også brukeren (login) hvis den finnes, for å unngå "Username taken" feil senere
            if (emp.User != null)
            {
                _db.Users.Remove(emp.User);
            }

            _db.Employees.Remove(emp);
            await _db.SaveChangesAsync();
            return true;
        }

        // ✅ NY METODE: Sletter ALLE ansatte og deres brukere
        public async Task DeleteAll()
        {
            // Henter alle ansatte og inkluderer User for å kunne slette login også
            var employees = await _db.Employees.Include(e => e.User).ToListAsync();

            foreach (var emp in employees)
            {
                if (emp.User != null)
                {
                    _db.Users.Remove(emp.User);
                }
            }

            _db.Employees.RemoveRange(employees);
            await _db.SaveChangesAsync();
        }
    }
}