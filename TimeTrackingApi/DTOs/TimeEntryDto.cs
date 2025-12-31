namespace TimeTrackingApi.DTOs
{
    public class TimeEntryDto
    {
        public int Id { get; set; }
        public int EmployeeId { get; set; }
        public DateTime ClockIn { get; set; }
        public DateTime? ClockOut { get; set; }
    }
}
