namespace TradeNote.API.Services
{
    public interface IEmailService
    {
        Task<bool> SendOtpEmailAsync(string toEmail, string firstName, string otpCode);
    }
}