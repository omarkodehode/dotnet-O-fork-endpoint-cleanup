using Microsoft.AspNetCore.Authorization;
using TimeTrackingApi.Data;
using Microsoft.EntityFrameworkCore;
using TimeTrackingApi.Models;

namespace TimeTrackingApi.Endpoints
{
    public static class LogEndpoints
    {
        public static void MapLogEndpoints(this IEndpointRouteBuilder app)
        {
            var group = app.MapGroup("/logs").RequireAuthorization("AdminOnly");

            group.MapGet("/", async (AppDbContext db) =>
            {
                // 1. Fetch Time Entries
                var timeEntries = await db.TimeEntries
                    .Include(t => t.Employee)
                    .Select(t => new 
                    {
                        Id = t.Id,
                        Type = "TimeEntry",
                        Employee = t.Employee != null ? t.Employee.FullName : "Unknown",
                        // ✅ FIX: Use 'ClockIn' instead of 'StartTime'
                        Date = t.ClockIn,
                        // ✅ FIX: Use 'ClockOut' instead of 'EndTime'
                        Details = t.ClockOut.HasValue 
                                  ? $"Worked: {Math.Round((t.ClockOut.Value - t.ClockIn).TotalHours, 2)} hrs" 
                                  : "Currently Clocked In"
                    }).ToListAsync();

                // 2. Fetch Absences
                var absences = await db.Absences
                    .Include(a => a.Employee)
                    .Select(a => new 
                    {
                        Id = a.Id,
                        Type = "Absence",
                        Employee = a.Employee != null ? a.Employee.FullName : "Unknown",
                        Date = a.Date,
                        Details = $"Reason: {a.Reason}"
                    }).ToListAsync();

                // 3. Merge and Sort
                var combinedLogs = timeEntries.Concat(absences)
                    .OrderByDescending(x => x.Date)
                    .ToList();

                return Results.Ok(combinedLogs);
            });
        }
    }
}