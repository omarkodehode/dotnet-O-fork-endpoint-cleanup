using System.Text.Json.Serialization;

namespace TimeTrackingApi.DTOs
{
    public class UpdateEmployeeDto
    {
        [JsonPropertyName("fullName")]
        public string FullName { get; set; } = string.Empty;

        [JsonPropertyName("position")]
        public string Position { get; set; } = string.Empty;

        [JsonPropertyName("departmentId")]
        public int? DepartmentId { get; set; }

        [JsonPropertyName("managerId")]
        public int? ManagerId { get; set; }

        [JsonPropertyName("hourlyRate")]
        public decimal HourlyRate { get; set; }

        [JsonPropertyName("vacationDaysBalance")]
        public int VacationDaysBalance { get; set; }

        [JsonPropertyName("password")]
        public string? Password { get; set; }
    }
}
