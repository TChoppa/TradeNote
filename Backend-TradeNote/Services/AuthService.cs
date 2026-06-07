using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using TradeNote.API.DTOs;
using TradeNote.API.Models;
using TradeNote.API.Repositories;

namespace TradeNote.API.Services
{
    public class AuthService : IAuthService
    {
        private readonly IAuthRepository _authRepo;
        private readonly IEmailService _emailService;
        private readonly IConfiguration _config;

        public AuthService(
            IAuthRepository authRepo,
            IEmailService emailService,
            IConfiguration config)
        {
            _authRepo = authRepo;
            _emailService = emailService;
            _config = config;
        }

        // ── REGISTER ──────────────────────────────────
        public async Task<ApiResponseDto<AuthResponseDto>> RegisterAsync(
            RegisterDto dto)
        {
            // Check if email already exists
            if (await _authRepo.EmailExistsAsync(dto.Email))
                return ApiResponseDto<AuthResponseDto>
                    .Fail("Email already registered");

            // Hash password
            var user = new User
            {
                FirstName = dto.FirstName.Trim(),
                LastName = dto.LastName.Trim(),
                Email = dto.Email.ToLower().Trim(),
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                CreatedAt = DateTime.UtcNow
            };

            await _authRepo.CreateUserAsync(user);

            // Generate JWT
            var token = GenerateJwtToken(user);

            return ApiResponseDto<AuthResponseDto>.Ok(new AuthResponseDto
            {
                Token = token,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email
            }, "Registration successful");
        }

        // ── LOGIN ─────────────────────────────────────
        public async Task<ApiResponseDto<AuthResponseDto>> LoginAsync(
            LoginDto dto)
        {
            // Find user
            var user = await _authRepo.GetByEmailAsync(dto.Email);
            if (user == null)
                return ApiResponseDto<AuthResponseDto>
                    .Fail("Invalid email or password");

            // Verify password
            if (!BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
                return ApiResponseDto<AuthResponseDto>
                    .Fail("Invalid email or password");

            // Generate JWT
            var token = GenerateJwtToken(user);

            return ApiResponseDto<AuthResponseDto>.Ok(new AuthResponseDto
            {
                Token = token,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email
            }, "Login successful");
        }

        // ── FORGOT PASSWORD ───────────────────────────
        public async Task<ApiResponseDto<string>> ForgotPasswordAsync(
            ForgotPasswordDto dto)
        {
            // Find user by email
            var user = await _authRepo.GetByEmailAsync(dto.Email);
            if (user == null)
                return ApiResponseDto<string>.Fail(
                    "Email does not exist in our system");

            // Invalidate all previous OTPs
            await _authRepo.InvalidateAllOtpsAsync(user.Id);

            // Generate 6-digit OTP
            var otpCode = GenerateOtp();

            // Save OTP to DB
            var otp = new OtpRecord
            {
                UserId = user.Id,
                OtpCode = otpCode,
                ExpiresAt = DateTime.UtcNow.AddMinutes(10),
                IsUsed = false,
                AttemptCount = 0,
                CreatedAt = DateTime.UtcNow
            };

            await _authRepo.CreateOtpAsync(otp);

            // Send OTP email
            await _emailService.SendOtpEmailAsync(
                user.Email, user.FirstName, otpCode);

            return ApiResponseDto<string>.Ok(
                "success",
                "OTP sent to your email. Valid for 10 minutes");
        }

        // ── VERIFY OTP ────────────────────────────────
        public async Task<ApiResponseDto<string>> VerifyOtpAsync(
            VerifyOtpDto dto)
        {
            // Find user and validate email
            var user = await _authRepo.GetByEmailAsync(dto.Email);
            if (user == null)
                return ApiResponseDto<string>.Fail("Email is not registered in our system");

            // Get latest OTP
            var otp = await _authRepo.GetLatestOtpAsync(user.Id);
            if (otp == null)
                return ApiResponseDto<string>.Fail("No OTP found. Please request a new one");

            // Check if expired
            if (otp.ExpiresAt < DateTime.UtcNow)
                return ApiResponseDto<string>.Fail("OTP has expired. Please request a new one");

            // Check attempt count (max 3 attempts)
            if (otp.AttemptCount >= 3)
                return ApiResponseDto<string>.Fail("Too many attempts. Please request a new OTP");

            // Verify OTP code
            if (otp.OtpCode != dto.OtpCode)
            {
                // Increment attempt count
                otp.AttemptCount++;
                await _authRepo.UpdateOtpAsync(otp);

                var remaining = 3 - otp.AttemptCount;
                return ApiResponseDto<string>
                    .Fail($"Invalid OTP. {remaining} attempts remaining");
            }

            // OTP is valid — don't mark as used yet
            // Mark as used only after password reset
            return ApiResponseDto<string>.Ok(
                "verified", "OTP verified successfully");
        }

        // ── RESET PASSWORD ────────────────────────────
        public async Task<ApiResponseDto<string>> ResetPasswordAsync(
            ResetPasswordDto dto)
        {
            // Find user and validate email
            var user = await _authRepo.GetByEmailAsync(dto.Email);
            if (user == null)
                return ApiResponseDto<string>.Fail("Email is not registered in our system");

            // Get latest OTP
            var otp = await _authRepo.GetLatestOtpAsync(user.Id);
            if (otp == null)
                return ApiResponseDto<string>.Fail("Invalid request");

            // Verify OTP one more time
            if (otp.OtpCode != dto.OtpCode
            || otp.ExpiresAt < DateTime.UtcNow
            || otp.IsUsed)
                return ApiResponseDto<string>.Fail("Invalid or expired OTP");

            // Update password
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
            await _authRepo.UpdateUserAsync(user);

            // Mark OTP as used
            otp.IsUsed = true;
            await _authRepo.UpdateOtpAsync(otp);

            return ApiResponseDto<string>.Ok(
                "success", "Password reset successfully");
        }

        // ── PRIVATE: Generate JWT ─────────────────────
        private string GenerateJwtToken(User user)
        {
            var key = new SymmetricSecurityKey(
                              Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
            var creds = new SigningCredentials(
                              key, SecurityAlgorithms.HmacSha256);
            var expiry = DateTime.UtcNow.AddDays(
                              int.Parse(_config["Jwt:ExpiryInDays"]!));

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email,          user.Email),
                new Claim(ClaimTypes.GivenName,      user.FirstName),
                new Claim(ClaimTypes.Surname,        user.LastName),
            };

            var token = new JwtSecurityToken(
                issuer: _config["Jwt:Issuer"],
                audience: _config["Jwt:Audience"],
                claims: claims,
                expires: expiry,
                signingCredentials: creds);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        // ── PRIVATE: Generate OTP ─────────────────────
        private static string GenerateOtp()
        {
            var random = new Random();
            return random.Next(100000, 999999).ToString();
        }
    }
}