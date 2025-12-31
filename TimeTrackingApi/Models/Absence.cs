namespace TimeTrackingApi.Models
{
    public class Absence
    {
        public int Id { get; set; }

        public int EmployeeId { get; set; }
        public Employee? Employee { get; set; }

        public DateTime Date { get; set; }
        public string Reason { get; set; } = string.Empty;

        public bool Approved { get; set; } = false;
    }
}
