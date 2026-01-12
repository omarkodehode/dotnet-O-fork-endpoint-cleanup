using Microsoft.AspNetCore.Authorization;
using TimeTrackingApi.Services;
using System.Linq;

namespace TimeTrackingApi.Endpoints
{
    public static class AdminTimeEntryEndpoints
    {
        public static void MapAdminTimeEntryEndpoints(this IEndpointRouteBuilder app)
        {
            var group = app.MapGroup("/admin/time").RequireAuthorization("AdminOnly");

            // GET ALL ACTIVE (Fixes Dashboard Error)
            group.MapGet("/active", async (TimeEntryService service) =>
            {
                var active = await service.GetAllActive();

                var result = active.Select(t => new
                {
                    Id = t.Id,
                    EmployeeId = t.EmployeeId,
                    EmployeeName = t.Employee?.FullName ?? "Unknown",
                    ClockIn = t.ClockIn,
                    ClockOut = t.ClockOut
                });

                return Results.Ok(result);
            });

            // ADMIN CLOCK IN (For User)
            group.MapPost("/clockin/{userId}", async (int userId, TimeEntryService service) =>
            {
                var result = await service.ClockIn(userId);
                if (result is null)
                    return Results.Conflict(new { message = "Already clocked in or user not found." });

                return Results.Ok(new { Id = result.Id, ClockIn = result.ClockIn });
            });

            // ADMIN CLOCK OUT (For User)
            group.MapPost("/clockout/{userId}", async (int userId, TimeEntryService service) =>
            {
                var result = await service.ClockOut(userId);
                if (result is null)
                    return Results.BadRequest(new { message = "No active shift for this user." });

                return Results.Ok(new { Id = result.Id, ClockOut = result.ClockOut });
            });
        }
    }
}