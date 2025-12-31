using Microsoft.AspNetCore.Authorization;
using TimeTrackingApi.Services;
using TimeTrackingApi.DTOs;
using TimeTrackingApi.Data;
using Microsoft.EntityFrameworkCore;
using System.Linq;

namespace TimeTrackingApi.Endpoints
{
    public static class AdminTimeEntryEndpoints
    {
        public static void MapAdminTimeEntryEndpoints(this IEndpointRouteBuilder app)
        {
            var group = app.MapGroup("/admin/time").RequireAuthorization("AdminOnly");

         
            group.MapGet("/active", async (TimeEntryService service, AppDbContext db) =>
            {
                var active = await service.GetAllActive();

  
                var result = await Task.WhenAll(active.Select(async t =>
                {
                    var emp = await db.Employees.FirstOrDefaultAsync(e => e.Id == t.EmployeeId);
                    return new
                    {
                        Id = t.Id,
                        EmployeeId = t.EmployeeId,
                        UserId = emp?.UserId,
                        FullName = emp?.FullName,
                        ClockIn = t.ClockIn,
                        ClockOut = t.ClockOut
                    };
                }));

                return Results.Ok(result);
            });

         
            group.MapPost("/clockin/{userId}", async (int userId, TimeEntryService service) =>
            {
                var result = await service.ClockIn(userId);
                if (result is null)
                    return Results.Conflict(new { message = "Already clocked in or user has no employee record." });

                return Results.Ok(new
                {
                    Id = result.Id,
                    EmployeeId = result.EmployeeId,
                    ClockIn = result.ClockIn,
                    ClockOut = result.ClockOut
                });
            });

        
            group.MapPost("/clockout/{userId}", async (int userId, TimeEntryService service) =>
            {
                var result = await service.ClockOut(userId);
                if (result is null)
                    return Results.BadRequest(new { message = "No active shift for this user." });

                return Results.Ok(new
                {
                    Id = result.Id,
                    EmployeeId = result.EmployeeId,
                    ClockIn = result.ClockIn,
                    ClockOut = result.ClockOut
                });
            });

            
            group.MapGet("/history/{userId}", async (int userId, TimeEntryService service, AppDbContext db) =>
            {
                var list = await service.GetByUserId(userId);

                var result = await Task.WhenAll(list.Select(async t =>
                {
                    var emp = await db.Employees.FirstOrDefaultAsync(e => e.Id == t.EmployeeId);
                    return new
                    {
                        Id = t.Id,
                        EmployeeId = t.EmployeeId,
                        UserId = emp?.UserId,
                        FullName = emp?.FullName,
                        ClockIn = t.ClockIn,
                        ClockOut = t.ClockOut
                    };
                }));

                return Results.Ok(result);
            });
        }
    }
}
