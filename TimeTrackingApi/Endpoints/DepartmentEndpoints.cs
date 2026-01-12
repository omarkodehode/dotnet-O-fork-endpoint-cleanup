using Microsoft.AspNetCore.Mvc;
using TimeTrackingApi.DTOs;
using TimeTrackingApi.Services;

namespace TimeTrackingApi.Endpoints
{
    public static class DepartmentEndpoints
    {
        public static void MapDepartmentEndpoints(this IEndpointRouteBuilder app)
        {
            var group = app.MapGroup("/departments").RequireAuthorization();

            group.MapGet("/", async (DepartmentService service) =>
            {
                return Results.Ok(await service.GetAllDepartments());
            });

            group.MapPost("/", async ([FromBody] CreateDepartmentDto dto, DepartmentService service) =>
            {
                var result = await service.CreateDepartment(dto);
                return result is not null 
                    ? Results.Ok(result) 
                    : Results.BadRequest("Department already exists or invalid data.");
            }).RequireAuthorization("AdminOnly");

            group.MapDelete("/{id}", async (int id, DepartmentService service) =>
            {
                var success = await service.DeleteDepartment(id);
                return success ? Results.Ok() : Results.NotFound();
            }).RequireAuthorization("AdminOnly");
        }
    }
}