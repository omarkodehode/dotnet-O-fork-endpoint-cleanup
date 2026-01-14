using Microsoft.EntityFrameworkCore;
using TimeTrackingApi.Data;
using TimeTrackingApi.DTOs;
using TimeTrackingApi.Models;
using TimeTrackingApi.Utils; 

namespace TimeTrackingApi.Services
{
    public class EmployeeService
    {
        private readonly AppDbContext _context;

        public EmployeeService(AppDbContext context)
        {
            _context = context;
        }

        // --- GET Methods ---

        public async Task<List<Employee>> GetAllEmployeesAsync()
        {
            return await _context.Employees
                .Include(e => e.Department)
                .Include(e => e.User)
                .OrderBy(e => e.FullName)
                .ToListAsync();
        }

        public async Task<Employee?> GetById(int id)
        {
            return await _context.Employees
                .Include(e => e.Department)
                .Include(e => e.User)
                .Include(e => e.Manager).ThenInclude(m => m.User) // Include Manager User for Username lookup
                .FirstOrDefaultAsync(e => e.Id == id);
        }

        public async Task<Employee?> GetByUserId(int userId)
        {
            return await _context.Employees
                .Include(e => e.Department)
                .FirstOrDefaultAsync(e => e.UserId == userId);
        }

        public async Task<List<Employee>> GetByManager(int managerId)
        {
            return await _context.Employees
                .Include(e => e.Department)
                .Where(e => e.ManagerId == managerId)
                .ToListAsync();
        }

        // --- CREATE Method ---

        public async Task<Employee> CreateEmployeeAsync(EmployeeCreateRequest dto)
        {
            // 1. Create User Account
            if (await _context.Users.AnyAsync(u => u.Username == dto.Username))
                throw new Exception("Username already exists");

            var user = new User
            {
                Username = dto.Username,
                PasswordHash = PasswordHasher.Hash(dto.Password),
                Role = dto.Role
                // Email is ignored/null as requested
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            // 2. Handle Department Lookup (by Name)
            int? departmentId = null;
            if (!string.IsNullOrEmpty(dto.Department))
            {
                var dept = await _context.Departments
                    .FirstOrDefaultAsync(d => d.Name == dto.Department);
                departmentId = dept?.Id;
            }

            // 3. Handle Manager Lookup (by Username)
            int? managerId = null;
            if (!string.IsNullOrEmpty(dto.ManagerUsername))
            {
                var mgrUser = await _context.Users
                    .FirstOrDefaultAsync(u => u.Username == dto.ManagerUsername);
                
                if (mgrUser != null)
                {
                    var mgr = await _context.Employees
                        .FirstOrDefaultAsync(e => e.UserId == mgrUser.Id);
                    managerId = mgr?.Id;
                }
            }

            // 4. Create Employee Profile
            var employee = new Employee
            {
                FullName = dto.FullName,
                Position = dto.Position ?? "",
                DepartmentId = departmentId,
                ManagerId = managerId,
                UserId = user.Id,
                HourlyRate = dto.HourlyRate,
                VacationDaysBalance = dto.VacationDaysBalance
            };

            _context.Employees.Add(employee);
            await _context.SaveChangesAsync();

            return employee;
        }

        // --- UPDATE Method ---

        public async Task<Employee?> UpdateEmployeeAsync(int id, UpdateEmployeeDto dto)
        {
            var emp = await _context.Employees.FindAsync(id);
            if (emp == null) return null;

            emp.FullName = dto.FullName;
            emp.Position = dto.Position;
            emp.HourlyRate = dto.HourlyRate;
            emp.VacationDaysBalance = dto.VacationDaysBalance;

            // 1. Update Department (Lookup by Name)
            if (!string.IsNullOrEmpty(dto.Department))
            {
                var dept = await _context.Departments
                    .FirstOrDefaultAsync(d => d.Name == dto.Department);
                emp.DepartmentId = dept?.Id;
            }
            else
            {
                emp.DepartmentId = null;
            }

            // 2. Update Manager (Lookup by Username)
            if (!string.IsNullOrEmpty(dto.ManagerUsername))
            {
                var mgrUser = await _context.Users
                    .FirstOrDefaultAsync(u => u.Username == dto.ManagerUsername);
                
                if (mgrUser != null)
                {
                    var mgr = await _context.Employees
                        .FirstOrDefaultAsync(e => e.UserId == mgrUser.Id);
                    emp.ManagerId = mgr?.Id;
                }
            }
            else
            {
                emp.ManagerId = null;
            }

            // 3. Update Password (if provided)
            if (!string.IsNullOrEmpty(dto.Password))
            {
                if (emp.UserId != 0)
                {
                    var user = await _context.Users.FindAsync(emp.UserId);
                    if (user != null)
                    {
                        user.PasswordHash = PasswordHasher.Hash(dto.Password);
                    }
                }
            }

            await _context.SaveChangesAsync();
            return emp;
        }

        // --- DELETE Method ---

        public async Task<bool> DeleteEmployeeAsync(int id)
        {
            var emp = await _context.Employees
                .Include(e => e.TimeEntries)
                .Include(e => e.Absences)
                .FirstOrDefaultAsync(e => e.Id == id);
                
            if (emp == null) return false;

            if (emp.TimeEntries.Any()) _context.TimeEntries.RemoveRange(emp.TimeEntries);
            if (emp.Absences.Any()) _context.Absences.RemoveRange(emp.Absences);
            
            // Fix: Remove Payroll records too
            var payrolls = await _context.Payroll.Where(p => p.EmployeeId == id).ToListAsync();
            if (payrolls.Any()) _context.Payroll.RemoveRange(payrolls);

            // Unlink managed employees
            var managedEmployees = await _context.Employees
                .Where(e => e.ManagerId == id)
                .ToListAsync();
            
            foreach (var managedEmp in managedEmployees)
            {
                managedEmp.ManagerId = null;
            }

            if (emp.UserId != 0)
            {
                var user = await _context.Users.FindAsync(emp.UserId);
                if (user != null) _context.Users.Remove(user);
            }

            _context.Employees.Remove(emp);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}