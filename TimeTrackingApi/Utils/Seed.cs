using TimeTrackingApi.Data;
using TimeTrackingApi.Models;

namespace TimeTrackingApi.Utils
{
    public static class Seed
    {
        public static void Initialize(AppDbContext db)
        {
            // Ensure there's an admin account for development.
            // If no users exist, create the default admin. If users exist but no `admin` user,
            // add it. This helps avoid a situation where the DB was seeded earlier with
            // incompatible data and prevents accidental lockout during development.

            if (!db.Users.Any())
            {
                var admin = new User
                {
                    Username = "admin",
                    PasswordHash = PasswordHasher.Hash("admin123"),
                    Role = "admin"
                };

                db.Users.Add(admin);
                db.SaveChanges();
                return;
            }

            // If users exist but admin is missing, add the admin user.
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
        }
    }
}
