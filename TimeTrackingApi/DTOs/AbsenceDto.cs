using System;
using TimeTrackingApi.Models; 

namespace TimeTrackingApi.DTOs
{
    public class AbsenceDto
    {
        public int Id { get; set; }
        public int EmployeeId { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string Description { get; set; } = string.Empty;
        public AbsenceType Type { get; set; }
        public bool Approved { get; set; }
    }
}