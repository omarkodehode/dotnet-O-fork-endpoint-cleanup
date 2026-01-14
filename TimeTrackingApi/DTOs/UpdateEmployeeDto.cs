using System.Text.Json.Serialization;

namespace TimeTrackingApi.DTOs
{
    public class UpdateEmployeeDto
    {
        [JsonPropertyName("fullName")]
        public string FullName { get; set; } = string.Empty;

        [JsonPropertyName("position")]
        public string Position { get; set; } = string.Empty;

        [JsonPropertyName("department")]
        public string? Department { get; set; } // Changed from DepartmentId

        [JsonPropertyName("managerUsername")]
        public string? ManagerUsername { get; set; } // Changed from ManagerId

        [JsonPropertyName("hourlyRate")]
        public decimal HourlyRate { get; set; }

        [JsonPropertyName("vacationDaysBalance")]
        public int VacationDaysBalance { get; set; }

        [JsonPropertyName("password")]
        public string? Password { get; set; }
    }
}