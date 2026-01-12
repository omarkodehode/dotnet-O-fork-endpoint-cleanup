using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TimeTrackingApi.Services;

namespace TimeTrackingApi.Endpoints
{
    public static class ManagerEndpoints
    {
        public static void MapManagerEndpoints(this IEndpointRouteBuilder app)
        {
            var group = app.MapGroup("/manager").RequireAuthorization("ManagerOnly");

            // 1. GET MY TEAM
            group.MapGet("/employees", async (HttpContext ctx, EmployeeService empService) =>
            {
                var managerId = await GetCurrentEmployeeId(ctx, empService);
                if (managerId == null) return Results.Unauthorized();

                var team = await empService.GetByManager(managerId.Value);
                return Results.Ok(team.Select(e => new 
                { 
                    e.Id, 
                    e.FullName, 
                    e.Position, 
                    Department = e.Department?.Name ?? "-" 
                }));
            });

            // 2. GET TEAM ABSENCES (For Approval)
            group.MapGet("/absences", async (HttpContext ctx, EmployeeService empService, AbsenceService absService) =>
            {
                var managerId = await GetCurrentEmployeeId(ctx, empService);
                if (managerId == null) return Results.Unauthorized();

                var absences = await absService.GetByManager(managerId.Value);
                
                return Results.Ok(absences.Select(a => new
                {
                    a.Id,
                    EmployeeName = a.Employee?.FullName ?? "Unknown",
                    StartDate = a.StartDate,
                    EndDate = a.EndDate,
                    Type = a.Type.ToString(),
                    Description = a.Description,
                    Approved = a.Approved
                }));
            });

            // 3. APPROVE/REJECT ABSENCE
            group.MapPost("/absences/{id}/approve", async (int id, [FromBody] bool approved, AbsenceService absService) =>
            {
                // Note: Ideally, we should check if the absence belongs to a subordinate here for security.
                var success = await absService.ToggleApproval(id, approved);
                return success ? Results.Ok(new { message = approved ? "Approved" : "Rejected" }) : Results.NotFound();
            });
        }

        // Helper to get the Employee ID of the logged-in User
        private static async Task<int?> GetCurrentEmployeeId(HttpContext ctx, EmployeeService service)
        {
            var userIdStr = ctx.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdStr)) return null;

            var emp = await service.GetByUserId(int.Parse(userIdStr));
            return emp?.Id;
        }
    }
}