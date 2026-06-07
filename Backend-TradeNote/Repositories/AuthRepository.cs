using Microsoft.EntityFrameworkCore;
using TradeNote.API.Data;
using TradeNote.API.Models;

namespace TradeNote.API.Repositories
{
    public class AuthRepository : IAuthRepository
    {
        private readonly AppDbContext _db;

        public AuthRepository(AppDbContext db)
        {
            _db = db;
        }

        // ── USER ──────────────────────────────────────
        public async Task<User?> GetByEmailAsync(string email)
        {
            return await _db.Users
                .FirstOrDefaultAsync(u => u.Email == email.ToLower().Trim());
        }

        public async Task<bool> EmailExistsAsync(string email)
        {
            return await _db.Users
                .AnyAsync(u => u.Email == email.ToLower().Trim());
        }

        public async Task<User?> GetByIdAsync(int id)
        {
            return await _db.Users
                .FirstOrDefaultAsync(u => u.Id == id);
        }

        public async Task<User> CreateUserAsync(User user)
        {
            user.Email = user.Email.ToLower().Trim();
            _db.Users.Add(user);
            await _db.SaveChangesAsync();
            return user;
        }

        public async Task UpdateUserAsync(User user)
        {
            _db.Users.Update(user);
            await _db.SaveChangesAsync();
        }

        // ── OTP ───────────────────────────────────────
        public async Task<OtpRecord> CreateOtpAsync(OtpRecord otp)
        {
            _db.OtpRecords.Add(otp);
            await _db.SaveChangesAsync();
            return otp;
        }

        public async Task<OtpRecord?> GetLatestOtpAsync(int userId)
        {
            return await _db.OtpRecords
                .Where(o => o.UserId == userId && !o.IsUsed)
                .OrderByDescending(o => o.CreatedAt)
                .FirstOrDefaultAsync();
        }

        public async Task UpdateOtpAsync(OtpRecord otp)
        {
            _db.OtpRecords.Update(otp);
            await _db.SaveChangesAsync();
        }

        public async Task InvalidateAllOtpsAsync(int userId)
        {
            var otps = await _db.OtpRecords
                .Where(o => o.UserId == userId && !o.IsUsed)
                .ToListAsync();

            otps.ForEach(o => o.IsUsed = true);
            await _db.SaveChangesAsync();
        }
    }
}