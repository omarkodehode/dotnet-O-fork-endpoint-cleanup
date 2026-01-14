using Microsoft.AspNetCore.Authorization;
using TimeTrackingApi.Services;
using TimeTrackingApi.DTOs;
using System.Globalization;

namespace TimeTrackingApi.Endpoints
{
    public static class DashboardEndpoints
    {
        public static void MapDashboardEndpoints(this IEndpointRouteBuilder app)
        {
            app.MapGet("/api/dashboard", async (EmployeeService empService, TimeEntryService timeService, AbsenceService absService) =>
            {
                var totalEmployees = (await empService.GetAllEmployeesAsync()).Count;
                var activeEntries = await timeService.GetAllActive();
                var activeCount = activeEntries.Select(t => t.EmployeeId).Distinct().Count();
                var absencesToday = await absService.GetAbsenceCountForDate(DateTime.UtcNow);

                
                // Planned: Total Employees * 37.5 hours
                var plannedHours = totalEmployees * 37.5;
                
                // Registered: Actual sum of hours in DB for this week
                var now = DateTime.UtcNow;
                var startOfWeek = now.AddDays(-(int)now.DayOfWeek + (int)DayOfWeek.Monday); // Monday
                var endOfWeek = startOfWeek.AddDays(7);
                
                var registeredHours = await timeService.GetTotalHoursForWeek(startOfWeek, endOfWeek);

                var dto = new 
                {
                    TotalEmployees = totalEmployees,
                    ActiveEmployees = activeCount,
                    AbsencesToday = absencesToday,
                    WeeklyStats = new {
                        Planned = plannedHours,
                        Registered = Math.Round(registeredHours, 2)
                    }
                };

                return Results.Ok(dto);
            }).RequireAuthorization("AdminOnly");
        }
    }
}