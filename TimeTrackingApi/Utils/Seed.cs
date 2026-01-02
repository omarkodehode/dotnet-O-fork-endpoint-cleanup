using TimeTrackingApi.Data;
using TimeTrackingApi.Models;

namespace TimeTrackingApi.Utils
{
    public static class Seed
    {
        public static void Initialize(AppDbContext db)
        {
            db.Database.EnsureCreated();

            var existingAdmin = db.Users.FirstOrDefault(u => u.Username == "admin");

            if (existingAdmin == null)
            {
                var admin = new User
                {
                    Username = "admin",
                    PasswordHash = PasswordHasher.Hash("admin123"),
                    Role = "admin"
                };
                db.Users.Add(admin);
                db.SaveChanges();
            }
            else
            {
                // FORCE FIX: Ensure role is lowercase "admin"
                if (existingAdmin.Role != "admin")
                {
                    existingAdmin.Role = "admin";
                    db.SaveChanges();
                }
            }
        }
    }
}