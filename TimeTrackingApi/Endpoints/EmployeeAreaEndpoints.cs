using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TimeTrackingApi.Services;
using TimeTrackingApi.DTOs.TimeEntries; 
using TimeTrackingApi.DTOs.Absences;

namespace TimeTrackingApi.Endpoints
{
    public static class EmployeeAreaEndpoints
    {
        public static void MapEmployeeAreaEndpoints(this IEndpointRouteBuilder app)
        {
            var group = app.MapGroup("/api/employee").RequireAuthorization("EmployeeOnly");

            int? GetUserId(ClaimsPrincipal user)
            {
                var idStr = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                return int.TryParse(idStr, out int id) ? id : null;
            }

            group.MapGet("/flex-balance", async (HttpContext ctx, TimeEntryService service) =>
            {
                var userId = GetUserId(ctx.User);
                if (userId == null) return Results.Unauthorized();
                var balance = await service.GetFlexBalance(userId.Value);
                return Results.Ok(new { FlexHours = balance });
            });

            group.MapGet("/status", async (HttpContext ctx, TimeEntryService service) =>
            {
                var userId = GetUserId(ctx.User);
                if (userId == null) return Results.Unauthorized();
                var status = await service.GetStatusAsync(userId.Value);
                return Results.Ok(status);
            });

            group.MapPost("/clockin", async (HttpContext ctx, TimeEntryService service) =>
            {
                var userId = GetUserId(ctx.User);
                if (userId == null) return Results.Unauthorized();
                var result = await service.ClockIn(userId.Value);
                if (result == null) return Results.Conflict(new { message = "Already clocked in." });
                return Results.Ok(new { message = "Clocked In", ClockIn = result.ClockIn });
            });

            group.MapPost("/clockout", async (HttpContext ctx, TimeEntryService service) =>
            {
                var userId = GetUserId(ctx.User);
                if (userId == null) return Results.Unauthorized();
                var result = await service.ClockOut(userId.Value);
                if (result == null) return Results.Conflict(new { message = "Not clocked in." });
                return Results.Ok(new { message = "Clocked Out", ClockOut = result.ClockOut });
            });

            group.MapGet("/history", async (HttpContext ctx, TimeEntryService service) =>
            {
                var userId = GetUserId(ctx.User);
                if (userId == null) return Results.Unauthorized();
                var history = await service.GetHistory(userId.Value);
                return Results.Ok(history.Select(t => new { t.Id, t.ClockIn, t.ClockOut, t.IsApproved }));
            });

            group.MapGet("/absences", async (HttpContext ctx, AbsenceService service) =>
            {
                var userId = GetUserId(ctx.User);
                if (userId == null) return Results.Unauthorized();
                var list = await service.GetByEmployee(userId.Value);
                return Results.Ok(list);
            });

            group.MapPost("/absences", async (HttpContext ctx, [FromBody] CreateAbsenceDto dto, AbsenceService service) =>
            {
                var userId = GetUserId(ctx.User);
                if (userId == null) return Results.Unauthorized();
                var created = await service.Create(userId.Value, dto);
                if (created == null) return Results.Conflict(new { message = "Error creating absence." });
                return Results.Ok(created);
            });

            group.MapPut("/time-entries/{id}", async (int id, [FromBody] UpdateEntryDto dto, HttpContext ctx, TimeEntryService service) =>
            {
                var userId = GetUserId(ctx.User);
                if (userId == null) return Results.Unauthorized();
                try {
                    await service.UpdateEntry(userId.Value, id, dto.ClockIn, dto.ClockOut);
                    return Results.Ok(new { message = "Updated" });
                } catch (Exception ex) { return Results.BadRequest(new { error = ex.Message }); }
            });

            group.MapDelete("/time-entries/{id}", async (int id, HttpContext ctx, TimeEntryService service) =>
            {
                var userId = GetUserId(ctx.User);
                if (userId == null) return Results.Unauthorized();
                try {
                    await service.DeleteEntry(userId.Value, id);
                    return Results.Ok(new { message = "Deleted" });
                } catch (Exception ex) { return Results.BadRequest(new { error = ex.Message }); }
            });
        }
    }
}