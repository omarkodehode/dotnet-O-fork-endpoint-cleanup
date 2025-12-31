namespace TimeTrackingApi.DTOs
{
    public class EmployeeDto
    {
        public int Id { get; set; }
        public int? UserId { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string? Position { get; set; }
        public DateTime? HireDate { get; set; }
    }
}
