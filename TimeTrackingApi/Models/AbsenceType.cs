
using System.Text.Json.Serialization;

namespace TimeTrackingApi.Models
{
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public enum AbsenceType
    {
        Vacation,           
        SickLeave,         
        SelfCertified,      
        ChildSick,          
        UnpaidLeave,       
        Other               
    }
}
