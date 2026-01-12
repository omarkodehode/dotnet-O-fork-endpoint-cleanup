using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TimeTrackingApi.Models;
using TimeTrackingApi.Services;
using TimeTrackingApi.DTOs.TimeEntries; // For UpdateEntryDto
using TimeTrackingApi.DTOs.Absences;    // ✅ REQUIRED: For CreateAbsenceDto

namespace TimeTrackingApi.Endpoints
{
    public static class EmployeeAreaEndpoints
    {
        public static void MapEmployeeAreaEndpoints(this IEndpointRouteBuilder app)
        {
            var group = app.MapGroup("/employee").RequireAuthorization("EmployeeOnly");

            // ==========================================
            //              TIME CLOCK
            // ==========================================
            
            // GET STATUS
            group.MapGet("/status", async (HttpContext ctx, TimeEntryService service) =>
            {
                var userIdStr = ctx.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdStr)) return Results.Unauthorized();

                var userId = int.Parse(userIdStr);
                var entry = await service.GetCurrentEntry(userId);
                
                return Results.Ok(new { 
                    status = entry != null ? "Clocked In" : "Clocked Out",
                    startTime = entry?.ClockIn
                });
            });

            // CLOCK IN
            group.MapPost("/clockin", async (HttpContext ctx, TimeEntryService service) =>
            {
                var userIdStr = ctx.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdStr)) return Results.Unauthorized();

                var userId = int.Parse(userIdStr);
                var result = await service.ClockIn(userId);

                if (result == null) return Results.Conflict(new { message = "Already clocked in." });
                return Results.Ok(new { message = "Clocked In", time = result.ClockIn });
            });

            // CLOCK OUT
            group.MapPost("/clockout", async (HttpContext ctx, TimeEntryService service) =>
            {
                var userIdStr = ctx.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdStr)) return Results.Unauthorized();

                var userId = int.Parse(userIdStr);
                var result = await service.ClockOut(userId);

                if (result == null) return Results.Conflict(new { message = "Not clocked in." });
                return Results.Ok(new { message = "Clocked Out", time = result.ClockOut });
            });

            // UPDATE TIME ENTRY (Correction)
            group.MapPut("/time-entries/{id}", async (
                int id, 
                [FromBody] UpdateEntryDto dto, 
                HttpContext ctx, 
                TimeEntryService service) =>
            {
                var userIdStr = ctx.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdStr)) return Results.Unauthorized();
                var userId = int.Parse(userIdStr);

                try
                {
                    var success = await service.UpdateEntry(userId, id, dto.ClockIn, dto.ClockOut);
                    
                    if (!success) return Results.NotFound("Entry not found.");
                    
                    return Results.Ok(new { message = "Entry updated successfully." });
                }
                catch (InvalidOperationException ex)
                {
                    // Returns 403 Forbidden if the week is locked
                    return Results.Problem(detail: ex.Message, statusCode: 403); 
                }
            });

            // GET HISTORY
           group.MapGet("/history", async (HttpContext ctx, TimeEntryService service) =>
{
    var userIdStr = ctx.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    if (string.IsNullOrEmpty(userIdStr)) return Results.Unauthorized();
    var userId = int.Parse(userIdStr);

    var history = await service.GetHistory(userId);
    
    // Map to DTO
    var dtos = history.Select(t => new 
    {
        t.Id,
        ClockIn = t.ClockIn,
        ClockOut = t.ClockOut,
        // Calculate duration in hours if clocked out
        Duration = t.ClockOut.HasValue ? (t.ClockOut.Value - t.ClockIn).TotalHours : 0
    });

    return Results.Ok(dtos);
});



            // GET My Absences
            group.MapGet("/absences", async (HttpContext ctx, AbsenceService service) =>
            {
                var userIdStr = ctx.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdStr)) return Results.Unauthorized();

                var userId = int.Parse(userIdStr);
                var list = await service.GetByEmployee(userId);
                
                // Map to DTO with new fields (StartDate, EndDate, Type)
                var dtos = list.Select(a => new 
                {
                    a.Id,
                    StartDate = a.StartDate,
                    EndDate = a.EndDate,
                    Type = a.Type.ToString(), // "Vacation", "SickLeave" etc.
                    Description = a.Description,
                    a.Approved
                });

                return Results.Ok(dtos);
            });

            // POST Request Absence (Updated for Periods)
            group.MapPost("/absences", async (HttpContext ctx, [FromBody] CreateAbsenceDto dto, AbsenceService service) =>
            {
                var userIdStr = ctx.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdStr)) return Results.Unauthorized();

                var userId = int.Parse(userIdStr);
                
                // Pass DTO to the service
                var created = await service.Create(userId, dto);

                if (created == null) return Results.Conflict(new { message = "Invalid date range or dates already taken." });
                
                return Results.Ok(new { 
                    created.Id, 
                    created.StartDate, 
                    created.EndDate, 
                    Type = created.Type.ToString() 
                });
            });
        }
    }
}