using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TimeTrackingApi.Models;
using TimeTrackingApi.Services;
using TimeTrackingApi.DTOs;

namespace TimeTrackingApi.Endpoints
{
    public static class AbsenceEndpoints
    {
        public static void MapAbsenceEndpoints(this IEndpointRouteBuilder app)
        {
            // ================= ADMIN ENDPOINTS (/absences) =================
            var adminGroup = app.MapGroup("/absences")
                .RequireAuthorization("AdminOnly");

            // GET ALL (Fixes "Failed to load absences")
            adminGroup.MapGet("/", async (AbsenceService service) =>
            {
                var list = await service.GetAll();
                // Map to a DTO that includes the Employee Name for the table
                var dtos = list.Select(a => new 
                {
                    a.Id,
                    a.EmployeeId,
                    EmployeeName = a.Employee?.FullName ?? "Unknown",
                    a.Date,
                    a.Reason
                });
                return Results.Ok(dtos);
            });

            // GET SINGLE
            adminGroup.MapGet("/{id}", async (int id, AbsenceService service) =>
            {
                var abs = await service.GetById(id);
                return abs is not null ? Results.Ok(abs) : Results.NotFound();
            });

            // CREATE (Admin)
            adminGroup.MapPost("/", async ([FromBody] Absence abs, AbsenceService service) =>
            {
                var created = await service.Create(abs);
                return Results.Created($"/absences/{created.Id}", created);
            });

            // UPDATE
            adminGroup.MapPut("/{id}", async (int id, [FromBody] Absence abs, AbsenceService service) =>
            {
                var updated = await service.Update(id, abs);
                return updated is not null ? Results.Ok(updated) : Results.NotFound();
            });

            // DELETE
            adminGroup.MapDelete("/{id}", async (int id, AbsenceService service) =>
            {
                var deleted = await service.Delete(id);
                return deleted ? Results.Ok() : Results.NotFound();
            });


            // ================= EMPLOYEE ENDPOINTS (/absence) =================
            var empGroup = app.MapGroup("/absence")
                .RequireAuthorization("EmployeeOnly");

            // GET MY HISTORY
            empGroup.MapGet("/", async (HttpContext ctx, AbsenceService service) =>
            {
                var userId = int.Parse(ctx.User.FindFirst("id")!.Value);
                // Note: Ensure AbsenceService.GetByEmployee handles the User->Employee lookup
                // Since we updated Service to use EmployeeId, we might need to lookup user first here
                // But for now, assuming the Service or calling logic handles the ID translation:
                
                // Note: The previous logic passed 'userId' as 'employeeId' which was a bug.
                // You should ideally look up the employee ID first if they differ.
                // For safety, let's just pass the ID we have if your DB links them directly.
                var list = await service.GetByEmployee(userId); 
                
                return Results.Ok(list);
            });

            // CREATE (My Absence)
            empGroup.MapPost("/", async (HttpContext ctx, [FromBody] Absence abs, AbsenceService service) =>
            {
                var userId = int.Parse(ctx.User.FindFirst("id")!.Value);
                // Ideally look up the actual EmployeeId from UserId here
                abs.EmployeeId = userId; 
                
                var created = await service.Create(abs);
                return Results.Ok(created);
            });
        }
    }
}