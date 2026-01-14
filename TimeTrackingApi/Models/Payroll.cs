using System.ComponentModel.DataAnnotations.Schema;

namespace TimeTrackingApi.Models
{
    public class Payroll
    {
        public int Id { get; set; }

        public int EmployeeId { get; set; }
        public Employee? Employee { get; set; }

        // ✅ FIX: Renamed properties to match Endpoint expectations
        public DateTime PayPeriodStart { get; set; }
        public DateTime PayPeriodEnd { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalHours { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal HourlyRate { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal GrossPay { get; set; }

        // ✅ FIX: Added NetPay
        [Column(TypeName = "decimal(18,2)")]
        public decimal NetPay { get; set; }

        // ✅ FIX: Added IsPaid
        public bool IsPaid { get; set; }

        public DateTime GeneratedAt { get; set; } = DateTime.UtcNow;
    }
}