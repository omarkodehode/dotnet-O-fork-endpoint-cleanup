namespace TimeTrackingApi.DTOs.Employee
{
    public class CreateEmployeeDto
    {
        public string Name { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string Role { get; set; } = "Employee";
        
        // ✅ FIX: Added properties required by EmployeeEndpoints
        public string Position { get; set; } = string.Empty;
        public string? Email { get; set; }
        public decimal HourlyRate { get; set; }
        public string? Department { get; set; }
        public int? VacationDays { get; set; }
    }
}