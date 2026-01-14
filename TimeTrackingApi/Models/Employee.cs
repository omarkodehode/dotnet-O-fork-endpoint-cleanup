using System.ComponentModel.DataAnnotations.Schema;
namespace TimeTrackingApi.Models
{
    public class Employee
    {
        public int Id { get; set; }

        public int? DepartmentId { get; set; }
        public Department? Department { get; set; }
        public int? ManagerId { get; set; }

        [ForeignKey("ManagerId")]
        public Employee? Manager { get; set; }

        public string FullName { get; set; } = string.Empty;
        public string Position { get; set; } = string.Empty;
        
     
        public DateTime HireDate { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal HourlyRate { get; set; } = 25.00m;
        
        // ✅ FIX: Added VacationDaysBalance
        public int VacationDaysBalance { get; set; } = 25;

        public int? UserId { get; set; }
        public User? User { get; set; }

        public ICollection<TimeEntry> TimeEntries { get; set; } = new List<TimeEntry>();
        public ICollection<Absence> Absences { get; set; } = new List<Absence>();
    }
}