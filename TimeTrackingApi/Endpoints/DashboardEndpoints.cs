using Microsoft.AspNetCore.Authorization;
using TimeTrackingApi.Services;
using TimeTrackingApi.DTOs;

namespace TimeTrackingApi.Endpoints
{
    public static class DashboardEndpoints
    {
        public static void MapDashboard(this IEndpointRouteBuilder app)
        {
            app.MapGet("/dashboard", async (EmployeeService empService, TimeEntryService timeService, AbsenceService absService) =>
            {
                var totalEmployees = (await empService.GetAll()).Count;

                // activeEmployees: count of employees with any active timeentry
                // Fixed: Ensure GetAllActive is available in service
                var activeEntries = await timeService.GetAllActive();
                var activeCount = activeEntries.Select(t => t.EmployeeId).Distinct().Count();

                var absencesToday = (await absService.GetAll()).Count(a => a.Date.Date == DateTime.UtcNow.Date);

                var dto = new DashboardDto
                {
                    TotalEmployees = totalEmployees,
                    ActiveEmployees = activeCount,
                    AbsencesToday = absencesToday
                };

                return Results.Ok(dto);
            }).RequireAuthorization("AdminOnly");
        }
    }
}