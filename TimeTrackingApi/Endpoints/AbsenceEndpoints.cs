using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TimeTrackingApi.DTOs.Absences; // Ensure you have this namespace or DTOs
using TimeTrackingApi.Models;
using TimeTrackingApi.Services;

namespace TimeTrackingApi.Endpoints
{
    public static class AbsenceEndpoints
    {
        public static void MapAbsenceEndpoints(this IEndpointRouteBuilder app)
        {
            // Base group: Requires authentication (Employee, Manager, or Admin)
            var group = app.MapGroup("/api/absences").RequireAuthorization();

            // 1. EMPLOYEE: Create Absence Request
            group.MapPost("/create", async ([FromBody] CreateAbsenceDto dto, AbsenceService service, ClaimsPrincipal user) =>
            {
                var userIdStr = user.FindFirst("id")?.Value ?? user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out int empId)) 
                    return Results.Unauthorized();

                dto.EmployeeId = empId; // Force the logged-in user's ID
                
                await service.CreateAbsenceAsync(dto);
                return Results.Ok(new { message = "Absence requested successfully." });
            });

            // 2. EMPLOYEE: Get My History
            group.MapGet("/my-history", async (AbsenceService service, ClaimsPrincipal user) =>
            {
                var userIdStr = user.FindFirst("id")?.Value ?? user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out int empId)) 
                    return Results.Unauthorized();

                var history = await service.GetAbsencesForEmployeeAsync(empId);
                return Results.Ok(history);
            });

            // 3. ADMIN: Get All (Restricted to Admin)
            group.MapGet("/", async (AbsenceService service) =>
            {
                var list = await service.GetAll();
                return Results.Ok(list);
            }).RequireAuthorization("AdminOnly");

            // ADMIN: Create Absence (for any employee)
            group.MapPost("/", async ([FromBody] CreateAbsenceDto dto, AbsenceService service) =>
            {
                var created = await service.Create(dto.EmployeeId, dto);
                if (created == null) return Results.Conflict(new { message = "Failed to create absence. Check for overlapping dates." });
                return Results.Ok(created);
            }).RequireAuthorization("AdminOnly");

            // 4. ADMIN: CRUD Operations
            group.MapGet("/{id}", async (int id, AbsenceService service) =>
            {
                var abs = await service.GetById(id);
                return abs is not null ? Results.Ok(abs) : Results.NotFound();
            }).RequireAuthorization("AdminOnly");

            group.MapDelete("/{id}", async (int id, AbsenceService service) =>
            {
                var deleted = await service.Delete(id);
                return deleted ? Results.Ok() : Results.NotFound();
            }).RequireAuthorization("AdminOnly");

            // --- USERNAME-BASED ENDPOINTS ---
            // GET absences by username
            group.MapGet("/user/{username}", async (string username, AbsenceService service) =>
            {
                var absences = await service.GetByUsername(username);
                return Results.Ok(absences);
            }).RequireAuthorization("AdminOnly");

            // CREATE absence by username
            group.MapPost("/user/{username}", async (string username, [FromBody] CreateAbsenceDto dto, AbsenceService service) =>
            {
                var created = await service.CreateByUsername(username, dto);
                if (created == null) return Results.Conflict(new { message = "Failed to create absence. User not found or dates overlap." });
                return Results.Ok(created);
            }).RequireAuthorization("AdminOnly");

            // DELETE absence by username and absence ID
            group.MapDelete("/user/{username}/{absenceId}", async (string username, int absenceId, AbsenceService service) =>
            {
                var deleted = await service.DeleteByUsername(username, absenceId);
                return deleted ? Results.Ok(new { message = "Absence deleted" }) : Results.NotFound(new { message = "Absence not found or doesn't belong to user" });
            }).RequireAuthorization("AdminOnly");
        }
    }
}