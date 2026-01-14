using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TimeTrackingApi.Services;
using TimeTrackingApi.DTOs.Absences;
using Models = TimeTrackingApi.Models; 

namespace TimeTrackingApi.Endpoints
{
    public static class ManagerEndpoints
    {
        public static void MapManagerEndpoints(this IEndpointRouteBuilder app)
        {
            var group = app.MapGroup("/api/manager").RequireAuthorization("ManagerOnly");

            // Helper to get Manager's Employee ID from their User ID
            static async Task<int?> GetCurrentEmployeeId(HttpContext ctx, EmployeeService service)
            {
                 var userIdStr = ctx.User.FindFirst("id")?.Value ?? ctx.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                 if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out int userId)) return null;
                 var emp = await service.GetByUserId(userId);
                 return emp?.Id;
            }

            // 1. Get Team List
            group.MapGet("/employees", async (HttpContext ctx, EmployeeService empService) =>
            {
                var managerId = await GetCurrentEmployeeId(ctx, empService);
                if (managerId == null) return Results.Unauthorized();
                var team = await empService.GetByManager(managerId.Value);
                return Results.Ok(team.Select(e => new 
                { 
                    e.Id, e.FullName, e.Position, Department = e.Department?.Name ?? "-" 
                }));
            });

            // 2. Get Weekly Summary (Matches Frontend: /manager/summary)
            group.MapGet("/summary", async (int year, int week, HttpContext ctx, EmployeeService empService, TimeEntryService timeService) =>
            {
                var managerId = await GetCurrentEmployeeId(ctx, empService);
                if (managerId == null) return Results.Unauthorized();
                var summary = await timeService.GetWeeklySummaryForManagerAsync(year, week); // Ensure Service method matches this name or logic
                return Results.Ok(summary);
            });

            // 3. Get Details (Matches Frontend: /manager/details/{id})
            group.MapGet("/details/{employeeId}", async (int employeeId, int year, int week, HttpContext ctx, EmployeeService empService, TimeEntryService timeService) =>
            {
                var managerId = await GetCurrentEmployeeId(ctx, empService);
                if (managerId == null) return Results.Unauthorized();
                
                var details = await timeService.GetWeeklyDetailsAsync(employeeId, year, week);
                return Results.Ok(details);
            });

            // 4. Approve Week (Matches Frontend Query Params: ?employeeId=X&year=Y&week=Z)
            group.MapPost("/approve", async (int employeeId, int year, int week, HttpContext ctx, EmployeeService empService, TimeEntryService timeService) =>
            {
                var managerId = await GetCurrentEmployeeId(ctx, empService);
                if (managerId == null) return Results.Unauthorized();
                
                await timeService.ApproveWeekAsync(employeeId, year, week);
                return Results.Ok(new { message = "Week approved." });
            });

            // 5. Get Pending Absences (Matches Frontend: /manager/absences/pending)
            group.MapGet("/absences/pending", async (HttpContext ctx, EmployeeService empService, AbsenceService absService) =>
            {
                var managerId = await GetCurrentEmployeeId(ctx, empService);
                if (managerId == null) return Results.Unauthorized();
                
                // Fetch absences for manager's team
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

            // 6. Approve/Reject Absence
            group.MapPost("/absences/{id}/approve", async (int id, bool approved, AbsenceService absService) =>
            {
                await absService.ApproveAbsenceAsync(id, approved);
                return Results.Ok(new { message = approved ? "Approved" : "Rejected" });
            }); 

            // 7. Manager Create Absence (for employee)
            group.MapPost("/absences/create", async ([FromBody] CreateAbsenceDto dto, HttpContext ctx, EmployeeService empService, AbsenceService absService) =>
            {
                var managerId = await GetCurrentEmployeeId(ctx, empService);
                if (managerId == null) return Results.Unauthorized();

                // Validation: Is this employee in my team?
                var targetEmployee = await empService.GetById(dto.EmployeeId);
                if (targetEmployee == null || targetEmployee.ManagerId != managerId)
                {
                    return Results.Unauthorized(); 
                }

                await absService.CreateAbsenceAsync(dto); // Assumes service handles conversion
                return Results.Ok(new { message = "Absence created" });
            });

            // 8. Export Payroll
            group.MapGet("/export-payroll", async (int year, int month, int? employeeId, HttpContext ctx, EmployeeService empService, PayrollService payrollService) => // Inject PayrollService
            {
                var managerId = await GetCurrentEmployeeId(ctx, empService);
                if (managerId == null) return Results.Unauthorized();

                var csvBytes = await payrollService.GeneratePayrollCsvAsync(year, month, employeeId); 
                return Results.File(csvBytes, "text/csv", $"payroll-{year}-{month}.csv");
            });
        }
    }
}