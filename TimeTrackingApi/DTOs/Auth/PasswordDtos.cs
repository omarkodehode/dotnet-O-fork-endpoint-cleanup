namespace TimeTrackingApi.DTOs.Auth
{
    public class ChangePasswordDto
    {
        public string CurrentPassword { get; set; } = string.Empty;
        public string NewPassword { get; set; } = string.Empty;
    }

    public class ResetPasswordDto
    {
        public int UserId { get; set; } 
        public string NewPassword { get; set; } = string.Empty;
    }
}