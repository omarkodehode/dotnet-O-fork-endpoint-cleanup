using Microsoft.AspNetCore.Mvc;
using TimeTrackingApi.Services;
using TimeTrackingApi.DTOs;
using TimeTrackingApi.Models;

namespace TimeTrackingApi.Endpoints
{
    public static class EmployeeEndpoints
    {
        public static void MapEmployeeEndpoints(this IEndpointRouteBuilder app)
        {
            // ✅ FIX: Mapped to /api/employees (plural) for Admin CRUD
            var group = app.MapGroup("/api/employees").RequireAuthorization("AdminOnly");

            // GET ALL
            group.MapGet("/", async (EmployeeService service) =>
            {
                var list = await service.GetAllEmployeesAsync();
                return Results.Ok(list);
            });

            // GET BY ID
            group.MapGet("/{id}", async (int id, EmployeeService service) =>
            {
                var emp = await service.GetById(id);
                return emp is not null ? Results.Ok(emp) : Results.NotFound();
            });

            // CREATE
            group.MapPost("/", async ([FromBody] EmployeeCreateRequest dto, EmployeeService service) =>
            {
                try {
                    var newEmp = await service.CreateEmployeeAsync(dto);
                    return Results.Created($"/api/employees/{newEmp.Id}", newEmp);
                } catch (Exception ex) {
                    return Results.BadRequest(new { message = ex.Message });
                }
            });

            // UPDATE
            group.MapPut("/{id}", async (int id, [FromBody] UpdateEmployeeDto dto, EmployeeService service) =>
            {
                var updated = await service.UpdateEmployeeAsync(id, dto);
                return updated is not null ? Results.Ok(updated) : Results.NotFound();
            });

            // DELETE
            group.MapDelete("/{id}", async (int id, EmployeeService service) =>
            {
                var success = await service.DeleteEmployeeAsync(id);
                return success ? Results.Ok() : Results.NotFound();
            });
        }
    }
}