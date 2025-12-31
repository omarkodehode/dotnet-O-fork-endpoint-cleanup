namespace TimeTrackingApi.DTOs.Employee
{
    public class CreateEmployeeDto
    {
        public string Name { get; set; } = string.Empty;
        public string Department { get; set; } = string.Empty;
        public string Role { get; set; } = "employee";

      
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }
}
