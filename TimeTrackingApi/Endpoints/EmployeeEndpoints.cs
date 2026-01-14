using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TimeTrackingApi.Models;
using TimeTrackingApi.Services;
using TimeTrackingApi.DTOs.Employee; 

namespace TimeTrackingApi.Endpoints
{
    public static class EmployeeEndpoints
    {
        public static void MapEmployeeEndpoints(this IEndpointRouteBuilder app)
        {
            var group = app.MapGroup("/employees").RequireAuthorization("ManagerOnly");

            // GET All
            group.MapGet("", async (EmployeeService service) => 
                Results.Ok(await service.GetAll()));

            // GET Single
            group.MapGet("/{id}", async (int id, EmployeeService service) =>
            {
                var emp = await service.GetById(id);
                return emp is not null ? Results.Ok(emp) : Results.NotFound();
            });

            // CREATE
            group.MapPost("", async ([FromBody] CreateEmployeeDto dto, EmployeeService empService, AuthService authService) =>
            {
                if (string.IsNullOrEmpty(dto.Username) || string.IsNullOrEmpty(dto.Password))
                {
                    return Results.BadRequest(new { message = "Username and Password are required." });
                }

                // 1. Create User (Login)
                var user = await authService.Register(dto.Username, dto.Password, dto.Role);
                if (user == null)
                {
                    return Results.Conflict(new { message = "Username already exists." });
                }

                // 2. Create Employee (Profile)
                var newEmployee = new Employee
                {
                    FullName = dto.Name,
                    Position = dto.Department, 
                    UserId = user.Id,
                    HireDate = DateTime.UtcNow
                };

                await empService.Create(newEmployee);
                
                return Results.Created($"/employees/{newEmployee.Id}", NewEmployee.MapFrom(newEmployee));
            }).RequireAuthorization("AdminOnly");

            // UPDATE
            group.MapPut("/{id}", async (int id, [FromBody] UpdateEmployeeDto dto, EmployeeService service) =>
            {
                var updated = await service.Update(id, dto);
                return updated is not null ? Results.Ok(updated) : Results.NotFound();
            });

            // DELETE Single
            group.MapDelete("/{id}", async (int id, EmployeeService service) =>
            {
                return await service.Delete(id) ? Results.Ok() : Results.NotFound();
            });

            // DELETE ALL
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