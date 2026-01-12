using TimeTrackingApi.Models; // For AbsenceType

namespace TimeTrackingApi.DTOs.Absences
{
    public class CreateAbsenceDto
    {
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public AbsenceType Type { get; set; }
        public string? Description { get; set; }
    }
}