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

            // ---------------- TIME CLOCK ----------------
            
            // GET STATUS
            group.MapGet("/status", async (HttpContext ctx, TimeEntryService service) =>
            {
                var userId = int.Parse(ctx.User.FindFirst("id")!.Value);
                var entry = await service.GetCurrentEntry(userId);
                
                return Results.Ok(new { 
                    status = entry != null ? "Clocked In" : "Clocked Out",
                    startTime = entry?.ClockIn
                });
            });

            // CLOCK IN
            group.MapPost("/clockin", async (HttpContext ctx, TimeEntryService service) =>
            {
                var userId = int.Parse(ctx.User.FindFirst("id")!.Value);
                var result = await service.ClockIn(userId);

                if (result == null) return Results.Conflict(new { message = "Already clocked in." });
                return Results.Ok(new { message = "Clocked In", time = result.ClockIn });
            });

            // CLOCK OUT
            group.MapPost("/clockout", async (HttpContext ctx, TimeEntryService service) =>
            {
                var userId = int.Parse(ctx.User.FindFirst("id")!.Value);
                var result = await service.ClockOut(userId);

                if (result == null) return Results.Conflict(new { message = "Not clocked in." });
                return Results.Ok(new { message = "Clocked Out", time = result.ClockOut });
            });

            // ---------------- ABSENCES ----------------

            // GET My Absences (FIXED 500 ERROR)
            group.MapGet("/absences", async (HttpContext ctx, AbsenceService service) =>
            {
                var userId = int.Parse(ctx.User.FindFirst("id")!.Value);
                var list = await service.GetByEmployee(userId);
                
                // MAP TO DTO TO STOP CIRCULAR REFERENCE CRASH
                var dtos = list.Select(a => new 
                {
                    a.Id,
                    a.Date,
                    a.Reason,
                    a.Approved
                });

                return Results.Ok(dtos);
            });

            // POST Request Absence
            group.MapPost("/absences", async (HttpContext ctx, [FromBody] Absence abs, AbsenceService service) =>
            {
                var userId = int.Parse(ctx.User.FindFirst("id")!.Value);
                var created = await service.Create(userId, abs);

                if (created == null) return Results.Conflict(new { message = "Duplicate request or date taken." });
                
                return Results.Ok(new { created.Id, created.Date, created.Reason });
            });
        }
    }
}