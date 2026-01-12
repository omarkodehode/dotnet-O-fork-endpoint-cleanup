using TimeTrackingApi.DTOs; // ✅ Ensure this using exists

namespace TimeTrackingApi.DTOs.Auth
{
    public class LoginResponse
    {
        public string Token { get; set; } = string.Empty;
        
        public UserDto User { get; set; } 
    }
}