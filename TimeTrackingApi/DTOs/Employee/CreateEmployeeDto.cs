using System.Text.Json.Serialization;

namespace TimeTrackingApi.DTOs.Employee
{
    public class CreateEmployeeDto
    {
        [JsonPropertyName("name")]
        public string Name { get; set; } = string.Empty;

        [JsonPropertyName("department")]
        public string Department { get; set; } = string.Empty;

        [JsonPropertyName("role")]
        public string Role { get; set; } = "employee";

        [JsonPropertyName("username")]
        public string Username { get; set; } = string.Empty;

        [JsonPropertyName("password")]
        public string Password { get; set; } = string.Empty;
    }
}