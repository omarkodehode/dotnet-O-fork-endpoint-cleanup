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
            // ================= ADMIN ONLY (/absences) =================
            var adminGroup = app.MapGroup("/absences").RequireAuthorization("AdminOnly");

            // GET ALL
            adminGroup.MapGet("/", async (AbsenceService service) =>
            {
                var list = await service.GetAll();
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

            // ✅ NEW: GET SINGLE (Fixes loading data for Edit Page)
            adminGroup.MapGet("/{id}", async (int id, AbsenceService service) =>
            {
                var abs = await service.GetById(id);
                return abs is not null ? Results.Ok(abs) : Results.NotFound();
            });

            // CREATE (Admin)
            adminGroup.MapPost("/", async ([FromBody] Absence abs, AbsenceService service) =>
            {
                var created = await service.Create(abs);
                if(created == null) return Results.Conflict("Invalid Employee or Duplicate.");
                return Results.Created($"/absences/{created.Id}", created);
            });

            // ✅ NEW: UPDATE (Fixes the 405 Error)
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