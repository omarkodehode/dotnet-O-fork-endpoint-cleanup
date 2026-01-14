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

            static async Task<int?> GetCurrentEmployeeId(HttpContext ctx, EmployeeService service)
            {
                 var userIdStr = ctx.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                 if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out int userId)) return null;
                 var emp = await service.GetByUserId(userId);
                 return emp?.Id;
            }

            group.MapGet("/weekly-summary", async (int year, int week, HttpContext ctx, EmployeeService empService, TimeEntryService timeService) =>
            {
                var managerId = await GetCurrentEmployeeId(ctx, empService);
                if (managerId == null) return Results.Unauthorized();
                var summary = await timeService.GetTeamWeeklySummary(managerId.Value, year, week);
                return Results.Ok(summary);
            });

            group.MapGet("/weekly-details/{employeeId}", async (int employeeId, int year, int week, HttpContext ctx, EmployeeService empService, TimeEntryService timeService) =>
            {
                var managerId = await GetCurrentEmployeeId(ctx, empService);
                if (managerId == null) return Results.Unauthorized();
                
                var details = await timeService.GetEmployeeWeeklyDetails(managerId.Value, employeeId, year, week);
                
                return Results.Ok(details.Select(d => new 
                {
                    Date = d.ClockIn,
                    Start = d.ClockIn,
                    End = d.ClockOut,
                    Hours = d.ClockOut.HasValue ? Math.Round((d.ClockOut.Value - d.ClockIn).TotalHours, 2) : 0,
                    IsApproved = d.IsApproved
                }));
            });

            group.MapPost("/approve-week/{employeeId}", async (int employeeId, [FromBody] WeekApprovalRequest req, HttpContext ctx, EmployeeService empService, TimeEntryService timeService) =>
            {
                var managerId = await GetCurrentEmployeeId(ctx, empService);
                if (managerId == null) return Results.Unauthorized();
                var success = await timeService.ApproveWeek(managerId.Value, employeeId, req.Year, req.Week);
                return success ? Results.Ok(new { message = "Week approved." }) : Results.BadRequest("Failed.");
            });

            group.MapGet("/export-payroll", async (int year, int month, HttpContext ctx, EmployeeService empService, TimeEntryService timeService) =>
            {
                var managerId = await GetCurrentEmployeeId(ctx, empService);
                if (managerId == null) return Results.Unauthorized();

                var csvBytes = await timeService.GetPayrollCsv(month, year, managerId.Value); 
                return Results.File(csvBytes, "text/csv", $"payroll-{year}-{month}.csv");
            });

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

            group.MapPost("/absences/{id}/approve", async (int id, [FromBody] ApproveAbsenceRequest req, AbsenceService absService) =>
            {
                var success = await absService.ToggleApproval(id, req.Approved);
                return success ? Results.Ok(new { message = req.Approved ? "Approved" : "Rejected" }) : Results.NotFound();
            }); 

            group.MapPost("/absences", async ([FromBody] CreateAbsenceManagerDto dto, HttpContext ctx, EmployeeService empService, AbsenceService absService) =>
            {
                var managerId = await GetCurrentEmployeeId(ctx, empService);
                if (managerId == null) return Results.Unauthorized();

                var targetEmployee = await empService.GetById(dto.EmployeeId);
                if (targetEmployee == null || targetEmployee.ManagerId != managerId)
                {
                    return Results.Unauthorized(); 
                }

                var created = await absService.Create(new Models.Absence
                {
                    EmployeeId = dto.EmployeeId,
                    StartDate = dto.StartDate,
                    EndDate = dto.EndDate,
                    Type = dto.Type,
                    Description = dto.Description,
                    Approved = true // Auto-approve since Manager created it
                });

                return created != null ? Results.Ok(created) : Results.Conflict("Overlap detected.");
            });
        }
    }
    
    public record WeekApprovalRequest(int Year, int Week);
    public record ApproveAbsenceRequest(bool Approved);
    
    public class CreateAbsenceManagerDto
    {
        public int EmployeeId { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public TimeTrackingApi.Models.AbsenceType Type { get; set; }
        public string? Description { get; set; }
    }
}