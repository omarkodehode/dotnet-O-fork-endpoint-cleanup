using System.Text.Json.Serialization;

namespace TimeTrackingApi.DTOs
{
    public class EmployeeDto
    {
        public int Id { get; set; }

        [JsonPropertyName("name")]
        public string Name { get; set; } = string.Empty;

        [JsonPropertyName("department")]
        public string Department { get; set; } = string.Empty;

        [JsonPropertyName("role")]
        public string Role { get; set; } = string.Empty;
    }
}