using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore; // ✅ FIX: Added for FirstOrDefaultAsync
using TimeTrackingApi.Data;          // ✅ FIX: Added for AppDbContext
using TimeTrackingApi.Models;
using TimeTrackingApi.Services;
using TimeTrackingApi.DTOs.Employee; 

namespace TimeTrackingApi.Endpoints
{
    public static class EmployeeEndpoints
    {
        public static void MapEmployeeEndpoints(this IEndpointRouteBuilder app)
        {
            var group = app.MapGroup("/api/employees").RequireAuthorization("ManagerOnly");

            group.MapGet("", async (EmployeeService service) => 
                Results.Ok(await service.GetAll()));

            group.MapGet("/{id}", async (int id, EmployeeService service) =>
            {
                var emp = await service.GetById(id);
                return emp is not null ? Results.Ok(emp) : Results.NotFound();
            });

            // ✅ FIX: Added 'AppDbContext db' to parameters
            group.MapPost("", async ([FromBody] CreateEmployeeDto dto, EmployeeService empService, AuthService authService, AppDbContext db) =>
            {
                if (string.IsNullOrEmpty(dto.Username) || string.IsNullOrEmpty(dto.Password))
                {
                    return Results.BadRequest(new { message = "Username and Password are required." });
                }

                var user = await authService.Register(dto.Username, dto.Password, dto.Role);
                if (user == null)
                {
                    return Results.Conflict(new { message = "Username already exists." });
                }

                var department = await db.Departments
                    .FirstOrDefaultAsync(d => d.Name == dto.Department);

                var newEmployee = new Employee
                {
                    FullName = dto.Name,
                    Position = dto.Position,
                    DepartmentId = department?.Id,
                    UserId = user.Id,
                    Email = dto.Email,
                    HourlyRate = dto.HourlyRate,
                    VacationDaysBalance = dto.VacationDays ?? 25
                };

                await empService.Create(newEmployee);
                
                return Results.Created($"/api/employees/{newEmployee.Id}", NewEmployee.MapFrom(newEmployee));
            }).RequireAuthorization("AdminOnly");

            group.MapPut("/{id}", async (int id, [FromBody] UpdateEmployeeDto dto, EmployeeService service) =>
            {
                var updated = await service.Update(id, dto);
                return updated is not null ? Results.Ok(updated) : Results.NotFound();
            });

            group.MapDelete("/{id}", async (int id, EmployeeService service) =>
            {
                return await service.Delete(id) ? Results.Ok() : Results.NotFound();
            });

            group.MapDelete("/", async (EmployeeService service) =>
            {
                await service.DeleteAll();
                return Results.Ok(new { message = "All employees and linked users have been deleted." });
            }).RequireAuthorization("AdminOnly");
        }
    }

    public record NewEmployee(int Id, int UserId, string FullName, string Position, DateTime HireDate)
    {
        public static NewEmployee MapFrom(Employee employee)
        {
            return new NewEmployee(
                employee.Id,
                employee.UserId ?? 0, 
                employee.FullName, 
                employee.Position, 
                employee.HireDate
            );
        }
    }
}