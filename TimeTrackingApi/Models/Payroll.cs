using System.ComponentModel.DataAnnotations.Schema;

namespace TimeTrackingApi.Models
{
    public class Payroll
    {
        public int Id { get; set; }

        public int EmployeeId { get; set; }
        public Employee? Employee { get; set; }

        public DateTime PeriodStart { get; set; }
        public DateTime PeriodEnd { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalHours { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal HourlyRate { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal GrossPay { get; set; }

        public DateTime GeneratedAt { get; set; } = DateTime.UtcNow;
    }
}
