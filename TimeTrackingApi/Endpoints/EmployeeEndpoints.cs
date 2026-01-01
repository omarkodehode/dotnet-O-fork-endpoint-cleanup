using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc; // Needed for [FromBody]
using TimeTrackingApi.Models;
using TimeTrackingApi.Services;

namespace TimeTrackingApi.Endpoints
{
    public static class EmployeeEndpoints
    {
        public static void MapEmployeeEndpoints(this IEndpointRouteBuilder app)
        {
            var group = app.MapGroup("/employees").RequireAuthorization("AdminOnly");

            group.MapGet("/", async (EmployeeService service) => Results.Ok(await service.GetAll()));

            group.MapGet("/{id}", async (int id, EmployeeService service) =>
            {
                var emp = await service.GetById(id);
                return emp is not null ? Results.Ok(emp) : Results.NotFound();
            });

            group.MapPost("/", async ([FromBody] Employee emp, EmployeeService service) =>
            {
                await service.Create(emp);
                return Results.Created($"/employees/{emp.Id}", emp);
            });

            // ✅ ADD THIS PUT ENDPOINT
            group.MapPut("/{id}", async (int id, [FromBody] Employee emp, EmployeeService service) =>
            {
                var updated = await service.Update(id, emp);
                return updated is not null ? Results.Ok(updated) : Results.NotFound();
            });

            group.MapDelete("/{id}", async (int id, EmployeeService service) =>
            {
                return await service.Delete(id) ? Results.Ok() : Results.NotFound();
            });
        }
    }
}