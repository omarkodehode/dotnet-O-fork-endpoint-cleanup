using Microsoft.AspNetCore.Http;
using System.Security.Claims;
using TimeTrackingApi.Data;
using TimeTrackingApi.Models;
using Microsoft.EntityFrameworkCore;

namespace TimeTrackingApi.Services
{
    public class AuthService
    {
        private readonly AppDbContext _db;

        public AuthService(AppDbContext db)
        {
            _db = db;
        }

        public async Task<User?> Authenticate(string username, string password)
        {
            var user = await _db.Users.FirstOrDefaultAsync(u => u.Username == username);

            if (user == null)
                return null;

            if (!PasswordHasher.Verify(password, user.PasswordHash))
                return null;

            return user;
        }

        public async Task<User?> Register(string username, string password, string role)
        {
            var exists = await _db.Users.AnyAsync(u => u.Username == username);
            if (exists)
                return null;

            var user = new User
            {
                Username = username,
                PasswordHash = PasswordHasher.Hash(password),
                Role = role
            };

            _db.Users.Add(user);
            await _db.SaveChangesAsync();




            return user;
        }

        public async Task<User?> GetCurrentUser(HttpContext http)
        {
            var idClaim = http.User.FindFirst("id")?.Value;
            if (string.IsNullOrEmpty(idClaim))
                return null;

            if (!int.TryParse(idClaim, out var id))
                return null;

            return await _db.Users.FirstOrDefaultAsync(u => u.Id == id);
        }
    }
}
