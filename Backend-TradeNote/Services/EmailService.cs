using SendGrid;
using SendGrid.Helpers.Mail;

namespace TradeNote.API.Services
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _config;

        public EmailService(IConfiguration config)
        {
            _config = config;
        }

        public async Task<bool> SendOtpEmailAsync(
    string toEmail, string firstName, string otpCode)
        {
            try
            {
                var apiKey = _config["SendGrid:ApiKey"];
                var fromEmail = _config["SendGrid:FromEmail"];
                var fromName = _config["SendGrid:FromName"];

                var client = new SendGridClient(apiKey);
                var from = new EmailAddress(fromEmail, fromName);
                var to = new EmailAddress(toEmail, firstName);
                var subject = "TradeNote — Your OTP Code";

                // ⚠️ All CSS { } must be {{ }} in C# interpolated strings
                var htmlContent = $@"
        <div style='font-family: Arial, sans-serif; max-width: 480px;
                    margin: 0 auto; background: #13161f; color: #e2e8f0;
                    border-radius: 12px; padding: 32px;
                    border: 1px solid #1c2030;'>

            <div style='text-align: center; margin-bottom: 28px;'>
                <h1 style='font-family: monospace; color: #e2e8f0;
                           letter-spacing: 4px; font-size: 22px; margin: 0;'>
                    TRADE<span style='color: #c8a96e;'>NOTE</span>
                </h1>
                <p style='color: #4a5568; font-size: 12px;
                          margin-top: 6px; letter-spacing: 1px;'>
                    Professional Trading Journal
                </p>
            </div>

            <p style='color: #4a5568; font-size: 14px; margin-bottom: 8px;'>
                Hi <strong style='color: #e2e8f0;'>{firstName}</strong>,
            </p>
            <p style='color: #4a5568; font-size: 14px; margin-bottom: 24px;'>
                You requested a password reset. Use the OTP below:
            </p>

            <div style='background: #0d0f14; border: 1px solid #c8a96e;
                        border-radius: 10px; padding: 24px;
                        text-align: center; margin-bottom: 24px;'>
                <div style='font-family: monospace; font-size: 35px;
                            font-weight: 600; letter-spacing: 10px;
                            color: #c8a96e;'>
                    {otpCode}
                </div>
                <p style='color: #4a5568; font-size: 11px;
                          margin-top: 10px; letter-spacing: 1px;'>
                    EXPIRES IN 10 MINUTES
                </p>
            </div>

            <p style='color: #4a5568; font-size: 12px; line-height: 1.6;'>
                If you did not request this, please ignore this email.
                Your password will remain unchanged.
            </p>

            <div style='border-top: 1px solid #1c2030; margin-top: 24px;
                        padding-top: 16px; text-align: center;'>
                <p style='color: #2e3f58; font-size: 11px; letter-spacing: 1px;'>
                    &copy; TradeNote. All rights reserved.
                </p>
            </div>
        </div>";

                var plainText = $"Your TradeNote OTP is: {otpCode}. Valid for 10 minutes.";

                var msg = MailHelper.CreateSingleEmail(
                    from, to, subject, plainText, htmlContent);

                var response = await client.SendEmailAsync(msg);

                // Log status for debugging
                Console.WriteLine($"SendGrid Status Code: {response.StatusCode}");
                var body = await response.Body.ReadAsStringAsync();
                Console.WriteLine($"SendGrid Response: {body}");

                return response.StatusCode == System.Net.HttpStatusCode.Accepted
                    || response.StatusCode == System.Net.HttpStatusCode.OK;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"SendGrid Exception: {ex.Message}");
                return false;
            }
        }
     }
    }