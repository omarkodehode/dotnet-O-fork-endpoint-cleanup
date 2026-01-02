using TimeTrackingApi.DTOs; // ✅ Ensure this using exists

namespace TimeTrackingApi.DTOs.Auth
{
    public class LoginResponse
    {
        public string Token { get; set; } = string.Empty;
        
        // ✅ FIX: Added User property to match Frontend expectation
        public UserDto User { get; set; } 
    }
}