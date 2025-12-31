using Microsoft.AspNetCore.Authorization;
using System.Linq;
using TimeTrackingApi.Services;
using TimeTrackingApi.DTOs;

namespace TimeTrackingApi.Endpoints
{
    public static class TimeEntryEndpoints
    {
        public static void MapTimeEntryEndpoints(this IEndpointRouteBuilder app)
        {
            var group = app.MapGroup("/time")
                .RequireAuthorization("EmployeeOnly");

            // CLOCK IN
            group.MapPost("/clockin", async (HttpContext ctx, TimeEntryService service) =>
            {
                var empId = int.Parse(ctx.User.FindFirst("id")!.Value);

                var result = await service.ClockIn(empId);
                if (result is null)
                    return Results.Conflict("Already clocked in.");

                var dto = new TimeEntryDto
                {
                    Id = result.Id,
                    EmployeeId = result.EmployeeId,
                    ClockIn = result.ClockIn,
                    ClockOut = result.ClockOut
                };
                return Results.Ok(dto);
            });

            // ACTIVE SHIFTS 
            group.MapGet("/active", async (HttpContext ctx, TimeEntryService service) =>
            {
                var userId = int.Parse(ctx.User.FindFirst("id")!.Value);
                var active = await service.GetActiveByUser(userId);
                var mapped = active.Select(e => new TimeEntryDto
                {
                    Id = e.Id,
                    EmployeeId = e.EmployeeId,
                    ClockIn = e.ClockIn,
                    ClockOut = e.ClockOut
                });
                return Results.Ok(mapped);
            });

            // CLOCK OUT
            group.MapPost("/clockout", async (HttpContext ctx, TimeEntryService service) =>
            {
                var empId = int.Parse(ctx.User.FindFirst("id")!.Value);

                var result = await service.ClockOut(empId);
                if (result is null)
                    return Results.BadRequest("No active shift.");

                var dto = new TimeEntryDto
                {
                    Id = result.Id,
                    EmployeeId = result.EmployeeId,
                    ClockIn = result.ClockIn,
                    ClockOut = result.ClockOut
                };
                return Results.Ok(dto);
            });
        }
    }
}
