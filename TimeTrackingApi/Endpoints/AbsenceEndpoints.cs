using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TimeTrackingApi.Models;
using TimeTrackingApi.Services;

namespace TimeTrackingApi.Endpoints
{
    public static class AbsenceEndpoints
    {
        public static void MapAbsenceEndpoints(this IEndpointRouteBuilder app)
        {
            // ✅ CHANGED: "ManagerOnly" -> "AdminOnly"
            // This is the global list for HR/Admins. Managers use /manager/absences.
            var adminGroup = app.MapGroup("/api/absences").RequireAuthorization("AdminOnly");

            // GET ALL (Global)
            adminGroup.MapGet("/", async (AbsenceService service) =>
            {
                var list = await service.GetAll();
                
                var dtos = list.Select(a => new 
                {
                    a.Id,
                    a.EmployeeId,
                    EmployeeName = a.Employee?.FullName ?? "Unknown",
                    StartDate = a.StartDate,
                    EndDate = a.EndDate,
                    Type = a.Type.ToString(),
                    Description = a.Description,
                    a.Approved
                });
                return Results.Ok(dtos);
            });

            // GET SINGLE
            adminGroup.MapGet("/{id}", async (int id, AbsenceService service) =>
            {
                var abs = await service.GetById(id);
                return abs is not null ? Results.Ok(abs) : Results.NotFound();
            });

            // CREATE (Admin Override)
            adminGroup.MapPost("/", async ([FromBody] Absence abs, AbsenceService service) =>
            {
                var created = await service.Create(abs);
                if(created == null) return Results.Conflict("Invalid Employee or Duplicate.");
                return Results.Created($"/api/absences/{created.Id}", created);
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
        }
    }
}