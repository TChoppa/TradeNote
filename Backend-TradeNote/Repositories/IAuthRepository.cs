using TradeNote.API.Models;

namespace TradeNote.API.Repositories
{
    public interface IAuthRepository
    {
        Task<User?> GetByEmailAsync(string email);
        Task<bool> EmailExistsAsync(string email);
        Task<User> CreateUserAsync(User user);
        Task<User?> GetByIdAsync(int id);
        Task UpdateUserAsync(User user);

        // OTP
        Task<OtpRecord> CreateOtpAsync(OtpRecord otp);
        Task<OtpRecord?> GetLatestOtpAsync(int userId);
        Task UpdateOtpAsync(OtpRecord otp);
        Task InvalidateAllOtpsAsync(int userId);
    }
}