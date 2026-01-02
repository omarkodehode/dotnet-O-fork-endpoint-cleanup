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
            var group = app.MapGroup("/employees").RequireAuthorization("AdminOnly");

            // GET All
            group.MapGet("", async (EmployeeService service) => 
                Results.Ok(await service.GetAll()));

            // GET Single
            group.MapGet("/{id}", async (int id, EmployeeService service) =>
            {
                var emp = await service.GetById(id);
                return emp is not null ? Results.Ok(emp) : Results.NotFound();
            });

            // ✅ FIXED POST ENDPOINT
            // 1. Removes the trailing slash ("/") to prevent 405 errors
            // 2. Uses CreateEmployeeDto to handle Username/Password
            group.MapPost("", async ([FromBody] CreateEmployeeDto dto, EmployeeService empService, AuthService authService) =>
            {
                // Validate
                if (string.IsNullOrEmpty(dto.Username) || string.IsNullOrEmpty(dto.Password))
                {
                    return Results.BadRequest(new { message = "Username and Password are required." });
                }

                // 1. Create the User Login
                var user = await authService.Register(dto.Username, dto.Password, dto.Role);
                if (user == null)
                {
                    return Results.Conflict(new { message = "Username already exists." });
                }

                // 2. Create the Employee Profile
                var newEmployee = new Employee
                {
                    FullName = dto.Name,        // Maps 'name' from React
                    Position = dto.Department,  // Maps 'department' from React
                    UserId = user.Id,           // Links to the new User
                    HireDate = DateTime.UtcNow
                };

                await empService.Create(newEmployee);
                
                return Results.Created($"/employees/{newEmployee.Id}", newEmployee);
            });

            // PUT
            group.MapPut("/{id}", async (int id, [FromBody] Employee emp, EmployeeService service) =>
            {
                var updated = await service.Update(id, emp);
                return updated is not null ? Results.Ok(updated) : Results.NotFound();
            });

            // DELETE
            group.MapDelete("/{id}", async (int id, EmployeeService service) =>
            {
                return await service.Delete(id) ? Results.Ok() : Results.NotFound();
            });
        }
    }
}