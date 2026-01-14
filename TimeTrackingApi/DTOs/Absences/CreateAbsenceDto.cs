using System;
using System.Text.Json.Serialization;
using TimeTrackingApi.Models;

namespace TimeTrackingApi.DTOs.Absences
{
    public class CreateAbsenceDto
    {

        [JsonPropertyName("employeeId")]
        public int EmployeeId { get; set; }
        
        [JsonPropertyName("startDate")]
        public DateTime StartDate { get; set; }
        
        [JsonPropertyName("endDate")]
        public DateTime EndDate { get; set; }
        
        [JsonPropertyName("type")]
        public AbsenceType Type { get; set; }
        
        [JsonPropertyName("description")]
        public string? Description { get; set; }
    }
}