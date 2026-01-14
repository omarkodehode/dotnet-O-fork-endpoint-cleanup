using Microsoft.EntityFrameworkCore;
using TimeTrackingApi.Data;
using TimeTrackingApi.DTOs;        
using TimeTrackingApi.DTOs.Auth;   
using TimeTrackingApi.Models;
using TimeTrackingApi.Utils;

namespace TimeTrackingApi.Services
{
    public class AuthService
    {
        private readonly AppDbContext _db;
        private readonly JwtService _jwt;

        public AuthService(AppDbContext db, JwtService jwt)
        {
            _db = db;
            _jwt = jwt;
        }

        public async Task<LoginResponse?> Authenticate(string username, string password)
        {
            var user = await _db.Users.FirstOrDefaultAsync(u => u.Username == username);
            if (user == null || !PasswordHasher.Verify(password, user.PasswordHash))
                return null;

            // ✅ Calls GenerateToken(int, string, string)
            var token = _jwt.GenerateToken(user.Id, user.Username, user.Role);

            return new LoginResponse
            {
                Token = token,
                User = new UserDto
                {
                    Id = user.Id,
                    Username = user.Username,
                    Role = user.Role
                }
            };
        }

        public async Task<User?> Register(string username, string password, string role)
        {
            if (await _db.Users.AnyAsync(u => u.Username == username))
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

        public async Task<bool> ChangePassword(int userId, string currentPassword, string newPassword)
        {
            var user = await _db.Users.FindAsync(userId);
            if (user == null) return false;

            if (!PasswordHasher.Verify(currentPassword, user.PasswordHash))
                return false; 

            user.PasswordHash = PasswordHasher.Hash(newPassword);
            await _db.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ResetPassword(int userId, string newPassword)
        {
            var user = await _db.Users.FindAsync(userId);
            if (user == null) return false;

            user.PasswordHash = PasswordHasher.Hash(newPassword);
            await _db.SaveChangesAsync();
            return true;
        }
    }
}