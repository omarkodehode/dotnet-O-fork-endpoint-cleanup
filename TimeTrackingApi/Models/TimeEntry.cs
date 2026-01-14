using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace TimeTrackingApi.Models
{
    public class TimeEntry
    {
        public int Id { get; set; }

        public int EmployeeId { get; set; }
        [JsonIgnore]
        public Employee? Employee { get; set; }

        public DateTime ClockIn { get; set; }
        public DateTime? ClockOut { get; set; }

        // ✅ NEW: Approval Locking
        public bool IsApproved { get; set; } = false;
        public DateTime? ApprovedAt { get; set; }
    }
}