namespace TimeTrackingApi.Models
{
    public class Absence
    {
        public int Id { get; set; }

        public int EmployeeId { get; set; }
        public Employee? Employee { get; set; }

        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }

        public AbsenceType Type { get; set; }
        
        public string? Description { get; set; } 

        public bool Approved { get; set; } = false;
    }
}