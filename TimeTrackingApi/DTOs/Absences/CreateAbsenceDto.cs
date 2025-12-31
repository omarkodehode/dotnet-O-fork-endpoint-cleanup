namespace TimeTrackingApi.DTOs.Absences
{
    public class CreateAbsenceDto
    {
        public DateTime Date { get; set; }
        public string Reason { get; set; } = string.Empty;
    }
}
