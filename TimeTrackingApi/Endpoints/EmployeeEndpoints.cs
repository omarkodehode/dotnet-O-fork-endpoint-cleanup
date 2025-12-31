using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Linq;
using TimeTrackingApi.Models;
using TimeTrackingApi.Services;
using TimeTrackingApi.DTOs;

namespace TimeTrackingApi.Endpoints
{
    public static class EmployeeEndpoints
    {
        public static void MapEmployeeEndpoints(this IEndpointRouteBuilder app)
        {
            var group = app.MapGroup("/employees").RequireAuthorization("AdminOnly");

            // GET ALL
            group.MapGet("/", async (EmployeeService service) =>
            {
                var list = await service.GetAll();
                var dtos = list.Select(e => new EmployeeDto
                {
                    Id = e.Id,
                    UserId = e.UserId,
                    FullName = e.FullName,
                    Position = e.Position,
                    HireDate = e.HireDate
                }).ToList();

                return Results.Ok(dtos);
            });

            // GET BY ID
            group.MapGet("/{id}", async (int id, EmployeeService service) =>
            {
                var emp = await service.Get(id);
                if (emp is null) return Results.NotFound();
                
                var dto = new EmployeeDto
                {
                    Id = emp.Id,
                    UserId = emp.UserId,
                    FullName = emp.FullName,
                    Position = emp.Position,
                    HireDate = emp.HireDate
                };
                return Results.Ok(dto);
            });

            // ✅ POST (Corrected Logic)
            group.MapPost("/", async ([FromBody] EmployeeCreateRequest req, AuthService authService, EmployeeService service) =>
            {
                // 1. Register User (This automatically creates an empty Employee record in DB)
                var user = await authService.Register(req.Username, req.Password, req.Role);
                if (user == null)
                    return Results.BadRequest(new { message = "Unable to create user or username exists." });

                // 2. Find that automatically created employee record
                var emp = await service.GetByUserId(user.Id);

                if (emp == null)
                {
                    // Fallback in case AuthService behavior changes in future
                    emp = new Employee { UserId = user.Id, FullName = req.Name, Position = req.Department, HireDate = DateTime.UtcNow };
                    await service.Create(emp);
                }
                else
                {
                    // 3. Update the existing record with real details
                    emp.FullName = req.Name;
                    emp.Position = req.Department;
                    await service.Update(emp.Id, emp);
                }

                var dto = new EmployeeDto
                {
                    Id = emp.Id,
                    UserId = emp.UserId,
                    FullName = emp.FullName,
                    Position = emp.Position,
                    HireDate = emp.HireDate
                };

                return Results.Created($"/employees/{emp.Id}", dto);
            });

            // UPDATE
            group.MapPut("/{id}", async (int id, [FromBody] Employee update, EmployeeService service) =>
            {
                var updated = await service.Update(id, update);
                if (updated is null) return Results.NotFound();
                
                var dto = new EmployeeDto
                {
                    Id = updated.Id,
                    UserId = updated.UserId,
                    FullName = updated.FullName,
                    Position = updated.Position,
                    HireDate = updated.HireDate
                };
                return Results.Ok(dto);
            });

            // DELETE
            group.MapDelete("/{id}", async (int id, EmployeeService service) =>
            {
                var deleted = await service.Delete(id);
                return deleted ? Results.Ok() : Results.NotFound();
            });
        }
    }
}