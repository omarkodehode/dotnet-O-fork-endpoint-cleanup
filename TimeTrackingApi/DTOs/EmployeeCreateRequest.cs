using System.Text.Json.Serialization;

namespace TimeTrackingApi.DTOs
{
    public class EmployeeCreateRequest
    {
        [JsonPropertyName("name")]
        public string FullName { get; set; } = string.Empty;
        
        [JsonPropertyName("username")]
        public string Username { get; set; } = string.Empty;
        
        [JsonPropertyName("password")]
        public string Password { get; set; } = string.Empty;
        
        [JsonPropertyName("role")]
        public string Role { get; set; } = "Employee";
        
        [JsonPropertyName("department")]
        public string? Department { get; set; } // Look up by Name
        
        [JsonPropertyName("managerUsername")]
        public string? ManagerUsername { get; set; } // Look up by Username
        
        [JsonPropertyName("position")]
        public string? Position { get; set; }
        
        [JsonPropertyName("hourlyRate")]
        public decimal HourlyRate { get; set; } = 0;
        
        [JsonPropertyName("vacationDaysBalance")]
        public int VacationDaysBalance { get; set; } = 0;
    }
}