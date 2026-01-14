using Microsoft.AspNetCore.Authorization;
using TimeTrackingApi.Services;
using System.Linq;

namespace TimeTrackingApi.Endpoints
{
    public static class AdminTimeEntryEndpoints
    {
        public static void MapAdminTimeEntryEndpoints(this IEndpointRouteBuilder app)
        {
            var group = app.MapGroup("/api/admin/time").RequireAuthorization("AdminOnly");

            // 1. GET ALL ACTIVE (For Admin Dashboard)
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

            // 2. ADMIN CLOCK IN (For User)
            group.MapPost("/clockin/{userId}", async (int userId, TimeEntryService service) =>
            {
                var result = await service.ClockIn(userId);
                if (result is null)
                    return Results.Conflict(new { message = "Already clocked in or user not found." });

                return Results.Ok(new { Id = result.Id, ClockIn = result.ClockIn });
            });

            // 3. ADMIN CLOCK OUT (For User)
            group.MapPost("/clockout/{userId}", async (int userId, TimeEntryService service) =>
            {
                var result = await service.ClockOut(userId);
                if (result is null)
                    return Results.BadRequest(new { message = "No active shift for this user." });

                return Results.Ok(new { Id = result.Id, ClockOut = result.ClockOut });
            });
            group.MapGet("/history/{userId}", async (int userId, TimeEntryService service) => 
{
    var history = await service.GetHistory(userId);
    return Results.Ok(history);
});

            group.MapGet("/export-payroll", async (int year, int month, TimeEntryService service) =>
            {
                var csvBytes = await service.GetGlobalPayrollCsv(month, year);
                return Results.File(csvBytes, "text/csv", $"global-payroll-{year}-{month}.csv");
            });
        }
    }
}