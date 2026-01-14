using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TimeTrackingApi.Services;
using TimeTrackingApi.DTOs.TimeEntries; 
using TimeTrackingApi.DTOs.Absences;

namespace TimeTrackingApi.Endpoints
{
    public static class EmployeeAreaEndpoints
    {
        public static void MapEmployeeAreaEndpoints(this IEndpointRouteBuilder app)
        {
            var group = app.MapGroup("/api/employee").RequireAuthorization("EmployeeOnly");

            int? GetUserId(ClaimsPrincipal user)
            {
                var idStr = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                return int.TryParse(idStr, out int id) ? id : null;
            }

           
            group.MapGet("/flex-balance", async (HttpContext ctx, TimeEntryService service) =>
            {
                var userId = GetUserId(ctx.User);
                if (userId == null) return Results.Unauthorized();

                var balance = await service.GetFlexBalance(userId.Value);
                return Results.Ok(new { FlexHours = balance });
            });

            // GET STATUS
            group.MapGet("/status", async (HttpContext ctx, TimeEntryService service) =>
            {
                var userId = GetUserId(ctx.User);
                if (userId == null) return Results.Unauthorized();

                var entry = await service.GetCurrentEntry(userId.Value);
                
                return Results.Ok(new { 
                    status = entry != null ? "Clocked In" : "Clocked Out",
                    startTime = entry?.ClockIn
                });
            });

            // CLOCK IN
            group.MapPost("/clockin", async (HttpContext ctx, TimeEntryService service) =>
            {
                var userId = GetUserId(ctx.User);
                if (userId == null) return Results.Unauthorized();

                var result = await service.ClockIn(userId.Value);
                if (result == null) return Results.Conflict(new { message = "Already clocked in." });
                
                return Results.Ok(new { message = "Clocked In", time = result.ClockIn });
            });

            // CLOCK OUT
            group.MapPost("/clockout", async (HttpContext ctx, TimeEntryService service) =>
            {
                var userId = GetUserId(ctx.User);
                if (userId == null) return Results.Unauthorized();

                var result = await service.ClockOut(userId.Value);
                if (result == null) return Results.Conflict(new { message = "Not clocked in." });
                
                return Results.Ok(new { message = "Clocked Out", time = result.ClockOut });
            });

            group.MapPut("/time-entries/{id}", async (int id, [FromBody] UpdateEntryDto dto, HttpContext ctx, TimeEntryService service) =>
            {
                var userId = GetUserId(ctx.User);
                if (userId == null) return Results.Unauthorized();

                try
                {
                    var success = await service.UpdateEntry(userId.Value, id, dto.ClockIn, dto.ClockOut);
                    if (!success) return Results.NotFound("Entry not found.");
                    
                    return Results.Ok(new { message = "Entry updated successfully." });
                }
                catch (InvalidOperationException ex)
                {
                    return Results.BadRequest(new { error = ex.Message }); 
                }
            });

            group.MapDelete("/time-entries/{id}", async (int id, HttpContext ctx, TimeEntryService service) =>
            {
                var userId = GetUserId(ctx.User);
                if (userId == null) return Results.Unauthorized();

                try
                {
                    var success = await service.DeleteEntry(userId.Value, id);
                    return success ? Results.Ok() : Results.NotFound();
                }
                catch (InvalidOperationException ex)
                {
                     return Results.BadRequest(new { error = ex.Message });
                }
            });

            // GET HISTORY
            group.MapGet("/history", async (HttpContext ctx, TimeEntryService service) =>
            {
                var userId = GetUserId(ctx.User);
                if (userId == null) return Results.Unauthorized();

                var history = await service.GetHistory(userId.Value);
                var dtos = history.Select(t => new 
                {
                    t.Id,
                    ClockIn = t.ClockIn,
                    ClockOut = t.ClockOut,
                    Duration = t.ClockOut.HasValue ? (t.ClockOut.Value - t.ClockIn).TotalHours : 0,
                    IsApproved = t.IsApproved
                });

                return Results.Ok(dtos);
            });

            // GET My Absences
            group.MapGet("/absences", async (HttpContext ctx, AbsenceService service) =>
            {
                var userId = GetUserId(ctx.User);
                if (userId == null) return Results.Unauthorized();

                var list = await service.GetByEmployee(userId.Value);
                var dtos = list.Select(a => new 
                {
                    a.Id,
                    StartDate = a.StartDate,
                    EndDate = a.EndDate,
                    Type = a.Type.ToString(),
                    Description = a.Description,
                    a.Approved
                });

                return Results.Ok(dtos);
            });

            // POST Request Absence
            group.MapPost("/absences", async (HttpContext ctx, [FromBody] CreateAbsenceDto dto, AbsenceService service) =>
            {
                var userId = GetUserId(ctx.User);
                if (userId == null) return Results.Unauthorized();
                
                var created = await service.Create(userId.Value, dto);
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