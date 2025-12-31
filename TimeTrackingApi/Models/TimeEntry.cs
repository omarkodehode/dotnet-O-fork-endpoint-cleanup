namespace TimeTrackingApi.Models
{
    public class TimeEntry
    {
        public int Id { get; set; }

        public int EmployeeId { get; set; }
        public Employee? Employee { get; set; }

        public DateTime ClockIn { get; set; }
        public DateTime? ClockOut { get; set; }

        public double TotalHours =>
            ClockOut.HasValue
                ? (ClockOut.Value - ClockIn).TotalHours
                : 0;
    }
}
