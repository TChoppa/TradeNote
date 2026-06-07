
using System.ComponentModel.DataAnnotations;
namespace TradeNote.API.DTOs
{
        // ── REGISTER ──────────────────────────────
        public class RegisterDto
        {
            [Required(ErrorMessage = "First name is required")]
            [MaxLength(50)]
            public string FirstName { get; set; } = string.Empty;

            [Required(ErrorMessage = "Last name is required")]
            [MaxLength(50)]
            public string LastName { get; set; } = string.Empty;

            [Required(ErrorMessage = "Email is required")]
            [EmailAddress(ErrorMessage = "Invalid email address")]
            public string Email { get; set; } = string.Empty;

            [Required(ErrorMessage = "Password is required")]
            [MinLength(6, ErrorMessage = "Password must be at least 6 characters")]
            public string Password { get; set; } = string.Empty;
        }

        // ── LOGIN ─────────────────────────────────
        public class LoginDto
        {
            [Required(ErrorMessage = "Email is required")]
            [EmailAddress(ErrorMessage = "Invalid email address")]
            public string Email { get; set; } = string.Empty;

            [Required(ErrorMessage = "Password is required")]
            public string Password { get; set; } = string.Empty;
        }

        // ── AUTH RESPONSE ─────────────────────────
        public class AuthResponseDto
        {
            public string Token { get; set; } = string.Empty;
            public string FirstName { get; set; } = string.Empty;
            public string LastName { get; set; } = string.Empty;
            public string Email { get; set; } = string.Empty;
        }

        // ── FORGOT PASSWORD — STEP 1 ──────────────
        public class ForgotPasswordDto
        {
            [Required(ErrorMessage = "Email is required")]
            [EmailAddress(ErrorMessage = "Invalid email address")]
            public string Email { get; set; } = string.Empty;
        }

        // ── FORGOT PASSWORD — STEP 2 (Verify OTP) ─
        public class VerifyOtpDto
        {
            [Required(ErrorMessage = "Email is required")]
            [EmailAddress]
            public string Email { get; set; } = string.Empty;

            [Required(ErrorMessage = "OTP is required")]
            [MaxLength(6)]
            [MinLength(6, ErrorMessage = "OTP must be 6 digits")]
            public string OtpCode { get; set; } = string.Empty;
        }

        // ── FORGOT PASSWORD — STEP 3 (Reset) ──────
        public class ResetPasswordDto
        {
            [Required(ErrorMessage = "Email is required")]
            [EmailAddress]
            public string Email { get; set; } = string.Empty;

            [Required(ErrorMessage = "OTP is required")]
            [MaxLength(6)]
            public string OtpCode { get; set; } = string.Empty;

            [Required(ErrorMessage = "New password is required")]
            [MinLength(6, ErrorMessage = "Password must be at least 6 characters")]
            public string NewPassword { get; set; } = string.Empty;

            [Required(ErrorMessage = "Confirm password is required")]
            [Compare("NewPassword", ErrorMessage = "Passwords do not match")]
            public string ConfirmPassword { get; set; } = string.Empty;
        }
   
}
