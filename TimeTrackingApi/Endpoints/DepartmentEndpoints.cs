using Microsoft.AspNetCore.Mvc;
using TimeTrackingApi.DTOs;
using TimeTrackingApi.Models;
using TimeTrackingApi.Services;

namespace TimeTrackingApi.Endpoints
{
    public static class DepartmentEndpoints
    {
        public static void MapDepartmentEndpoints(this IEndpointRouteBuilder app)
        {
            var group = app.MapGroup("/departments").RequireAuthorization("AdminOnly"); // ✅ Changed to AdminOnly

            // ✅ UPDATED: Fetch with details (Employees + Managers)
            group.MapGet("/", async (DepartmentService service) =>
            {
                var list = await service.GetAllWithDetails(); // Make sure Service has this method!
                
                var result = list.Select(d => new 
                {
                    d.Id,
                    d.Name,
                    EmployeeCount = d.Employees?.Count ?? 0,
                    Employees = d.Employees?.Select(e => new 
                    {
                        e.Id,
                        e.FullName,
                        e.Position,
                        ManagerName = e.Manager?.FullName ?? "-" // Shows manager name or "-"
                    })
                });
                return Results.Ok(result);
            });

            group.MapPost("/", async ([FromBody] Department dept, DepartmentService service) =>
            {
                var created = await service.Create(dept.Name);
                return created != null ? Results.Ok(created) : Results.BadRequest("Exists");
            });

            group.MapDelete("/{id}", async (int id, DepartmentService service) =>
            {
               
                 var success = await service.Delete(id);
                return Results.Ok();
            });
        }
    }
}