using System.Text.Json.Serialization;

namespace TimeTrackingApi.DTOs.Employee
{
    public class UpdateEmployeeDto
    {
        [JsonPropertyName("name")]
        public string FullName { get; set; } = string.Empty;

        [JsonPropertyName("position")]
        public string Position { get; set; } = string.Empty;

        [JsonPropertyName("departmentId")]
        public int? DepartmentId { get; set; }

        [JsonPropertyName("managerId")]
        public int? ManagerId { get; set; }
    }
}
