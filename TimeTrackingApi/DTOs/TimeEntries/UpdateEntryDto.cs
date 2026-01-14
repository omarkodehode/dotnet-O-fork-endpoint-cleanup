using System;

namespace TimeTrackingApi.DTOs.TimeEntries
{
    public class UpdateEntryDto
    {
        public DateTime ClockIn { get; set; }
        public DateTime? ClockOut { get; set; }
    }
}