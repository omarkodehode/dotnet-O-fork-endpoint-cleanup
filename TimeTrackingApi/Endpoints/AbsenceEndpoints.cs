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

            // CREATE (Admin)
            adminGroup.MapPost("/", async ([FromBody] Absence abs, AbsenceService service) =>
            {
                var created = await service.Create(abs);
                if(created == null) return Results.Conflict("Invalid Employee or Duplicate.");
                return Results.Created($"/absences/{created.Id}", created);
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