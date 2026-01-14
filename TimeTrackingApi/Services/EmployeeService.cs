using Microsoft.EntityFrameworkCore;
using TimeTrackingApi.Data;
using TimeTrackingApi.DTOs;
using TimeTrackingApi.Models;
using TimeTrackingApi.Utils; // For PasswordHasher

namespace TimeTrackingApi.Services
{
    public class EmployeeService
    {
        private readonly AppDbContext _context;

        public EmployeeService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<Employee>> GetAllEmployeesAsync()
        {
            return await _context.Employees
                .Include(e => e.Department)
                .Include(e => e.User) // Include User to get username/role if needed
                .OrderBy(e => e.FullName)
                .ToListAsync();
        }

        public async Task<List<Employee>> GetAll() => await GetAllEmployeesAsync();

        public async Task<Employee?> GetById(int id)
        {
            return await _context.Employees
                .Include(e => e.Department)
                .Include(e => e.User)
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

        public async Task<Employee> CreateEmployeeAsync(EmployeeCreateRequest dto)
        {
            // 1. Create User Account
            if (await _context.Users.AnyAsync(u => u.Username == dto.Username))
                throw new Exception("Username already exists");

            var user = new User
            {
                Username = dto.Username,
                PasswordHash = PasswordHasher.Hash(dto.Password),
                Role = dto.Role,
                Email = null  // Not provided by frontend
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            // 2. Handle department lookup by name
            int? departmentId = null;
            if (!string.IsNullOrEmpty(dto.Department))
            {
                var dept = await _context.Departments
                    .FirstOrDefaultAsync(d => d.Name == dto.Department);
                departmentId = dept?.Id;
            }

            // 3. Create Employee Profile
            var employee = new Employee
            {
                FullName = dto.FullName,
                Position = dto.Position ?? "",
                DepartmentId = departmentId,
                ManagerId = null,  // Not provided by frontend
                UserId = user.Id,
                HourlyRate = dto.HourlyRate,
                VacationDaysBalance = dto.VacationDaysBalance
            };

            _context.Employees.Add(employee);
            await _context.SaveChangesAsync();

            return employee;
        }

        public async Task<Employee?> UpdateEmployeeAsync(int id, UpdateEmployeeDto dto)
        {
            var emp = await _context.Employees.FindAsync(id);
            if (emp == null) return null;

            emp.FullName = dto.FullName;
            emp.Position = dto.Position;
            emp.DepartmentId = dto.DepartmentId;
            emp.ManagerId = dto.ManagerId;
            emp.HourlyRate = dto.HourlyRate;

            if (!string.IsNullOrEmpty(dto.Password))
            {
                // Retrieve the user associated with this employee
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

        public async Task<bool> DeleteEmployeeAsync(int id)
        {
            var emp = await _context.Employees
                .Include(e => e.TimeEntries)
                .Include(e => e.Absences)
                .FirstOrDefaultAsync(e => e.Id == id);
                
            if (emp == null) return false;

            // 1. Remove all time entries for this employee
            if (emp.TimeEntries.Any())
            {
                _context.TimeEntries.RemoveRange(emp.TimeEntries);
            }

            // 2. Remove all absences for this employee
            if (emp.Absences.Any())
            {
                _context.Absences.RemoveRange(emp.Absences);
            }

            // 3. Set ManagerId to null for any employees managed by this employee
            var managedEmployees = await _context.Employees
                .Where(e => e.ManagerId == id)
                .ToListAsync();
            
            foreach (var managedEmp in managedEmployees)
            {
                managedEmp.ManagerId = null;
            }

            // 4. Delete linked User account
            if (emp.UserId != null && emp.UserId != 0)
            {
                var user = await _context.Users.FindAsync(emp.UserId);
                if (user != null) _context.Users.Remove(user);
            }

            // 5. Finally, delete the employee
            _context.Employees.Remove(emp);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}