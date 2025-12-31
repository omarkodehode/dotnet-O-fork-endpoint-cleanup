namespace TimeTrackingApi.Models
{
    public class User
    {
        public int Id { get; set; }

        public string Username { get; set; } = string.Empty;
        public byte[] PasswordHash { get; set; } = Array.Empty<byte>();

        public string Role { get; set; } = "User"; // Admin, Manager, User
        
      
        public Employee? Employee { get; set; }
    }
}
