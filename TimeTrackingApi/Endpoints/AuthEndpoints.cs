using Microsoft.AspNetCore.Mvc;
using TimeTrackingApi.DTOs.Auth;
using TimeTrackingApi.Models;
using TimeTrackingApi.Services;

namespace TimeTrackingApi.Endpoints
{
    public static class AuthEndpoints
    {
        public static void MapAuthEndpoints(this IEndpointRouteBuilder app)
        {
            // -------------------- Login --------------------
            app.MapPost("/auth/login", async (
                [FromBody] LoginRequest dto,
                AuthService auth,
                JwtService jwt) =>
            {
                var user = await auth.Authenticate(dto.Username, dto.Password);
                if (user == null)
                    return Results.BadRequest(new { message = "Invalid credentials." });

                var token = jwt.GenerateToken(user.Id, user.Username, user.Role);
                var userDto = new TimeTrackingApi.DTOs.UserDto
                {
                    Id = user.Id,
                    Username = user.Username,
                    Role = user.Role
                };

                return Results.Ok(new { token, user = userDto });
            });

            // -------------------- Register --------------------
            app.MapPost("/auth/register", async (
                [FromBody] RegisterRequest dto,
                AuthService auth) =>
            {
                var user = await auth.Register(dto.Username, dto.Password, dto.Role);
                if (user == null)
                    return Results.BadRequest(new { message = "Username already exists." });

                var userDto = new TimeTrackingApi.DTOs.UserDto
                {
                    Id = user.Id,
                    Username = user.Username,
                    Role = user.Role
                };

                return Results.Ok(new { message = "User registered successfully.", user = userDto });
            });

            // -------------------- Get Current User --------------------
            app.MapGet("/auth/me", async (
                [FromServices] AuthService auth,
                HttpContext http) =>
            {
                var user = await auth.GetCurrentUser(http);
                if (user == null)
                    return Results.Unauthorized();

                var userDto = new TimeTrackingApi.DTOs.UserDto
                {
                    Id = user.Id,
                    Username = user.Username,
                    Role = user.Role
                };

                return Results.Ok(userDto);
            }).RequireAuthorization();
        }
    }
}
