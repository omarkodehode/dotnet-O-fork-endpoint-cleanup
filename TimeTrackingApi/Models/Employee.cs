namespace TimeTrackingApi.Models
{
    public class Employee
    {
        public int Id { get; set; }

        public string FullName { get; set; } = string.Empty;
        public string Position { get; set; } = string.Empty;

        public DateTime HireDate { get; set; }

        public int? UserId { get; set; }
        public User? User { get; set; }

        // Navigation
        public ICollection<TimeEntry> TimeEntries { get; set; } = new List<TimeEntry>();
        public ICollection<Absence> Absences { get; set; } = new List<Absence>();
    }
}
