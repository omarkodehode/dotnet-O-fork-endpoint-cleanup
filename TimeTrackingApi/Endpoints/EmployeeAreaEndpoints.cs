using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TimeTrackingApi.Models;
using TimeTrackingApi.Services;

namespace TimeTrackingApi.Endpoints
{
    public static class EmployeeAreaEndpoints
    {
        public static void MapEmployeeAreaEndpoints(this IEndpointRouteBuilder app)
        {
            var group = app.MapGroup("/employee").RequireAuthorization("EmployeeOnly");

            // ---------------- TIME ENTRY ----------------
            group.MapPost("/clockin", async (HttpContext ctx, TimeEntryService timeService) =>
            {
                var userId = int.Parse(ctx.User.FindFirst("id")!.Value);
                var entry = await timeService.ClockIn(userId);
                
                if (entry is null) return Results.Conflict("Already clocked in.");
                
                return Results.Ok(new { entry.Id, entry.EmployeeId, entry.ClockIn, entry.ClockOut });
            });

            group.MapPost("/clockout", async (HttpContext ctx, TimeEntryService timeService) =>
            {
                var userId = int.Parse(ctx.User.FindFirst("id")!.Value);
                var entry = await timeService.ClockOut(userId);
                
                if (entry is null) return Results.BadRequest("No active shift.");
                
                return Results.Ok(new { entry.Id, entry.EmployeeId, entry.ClockIn, entry.ClockOut });
            });

            // ---------------- ABSENCES ----------------
            // ✅ GET (Uses safe service method)
            group.MapGet("/absences", async (HttpContext ctx, AbsenceService absenceService) =>
            {
                var userId = int.Parse(ctx.User.FindFirst("id")!.Value);
                var list = await absenceService.GetByEmployee(userId);
                return Results.Ok(list);
            });

            // ✅ POST (Uses safe service method + Conflict check)
            group.MapPost("/absences", async (HttpContext ctx, [FromBody] Absence abs, AbsenceService absenceService) =>
            {
                var userId = int.Parse(ctx.User.FindFirst("id")!.Value);
                
                var created = await absenceService.Create(userId, abs);

                if (created == null)
                {
                    return Results.Conflict("Unable to create absence. It may be a duplicate date.");
                }

                return Results.Ok(created);
            });
        }
    }
}