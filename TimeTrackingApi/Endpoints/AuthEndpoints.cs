using Microsoft.AspNetCore.Mvc;
using System.Security.Claims; // Needed to read User ID from token
using TimeTrackingApi.DTOs.Auth;
using TimeTrackingApi.Services;

namespace TimeTrackingApi.Endpoints
{
    public static class AuthEndpoints
    {
        public static void MapAuthEndpoints(this IEndpointRouteBuilder app)
        {
            var group = app.MapGroup("/auth");

            group.MapPost("/login", async ([FromBody] LoginRequest req, AuthService auth) =>
            {
                var response = await auth.Authenticate(req.Username, req.Password);
                return response is not null ? Results.Ok(response) : Results.Unauthorized();
            });

            // ✅ NEW: User Change Password
            group.MapPost("/change-password", async ([FromBody] ChangePasswordDto dto, AuthService auth, ClaimsPrincipal user) =>
            {
                // Get User ID safely from the token
                var userIdStr = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdStr)) return Results.Unauthorized();
                
                var success = await auth.ChangePassword(int.Parse(userIdStr), dto.CurrentPassword, dto.NewPassword);
                return success ? Results.Ok(new { message = "Password updated" }) : Results.BadRequest("Invalid current password");
            }).RequireAuthorization(); // Any logged in user can access

            // ✅ NEW: Admin Reset Password
            group.MapPost("/reset-password", async ([FromBody] ResetPasswordDto dto, AuthService auth) =>
            {
                var success = await auth.ResetPassword(dto.UserId, dto.NewPassword);
                return success ? Results.Ok(new { message = "Password reset successfully" }) : Results.NotFound("User not found");
            }).RequireAuthorization("AdminOnly"); // Only Admin can access
        }
    }
}