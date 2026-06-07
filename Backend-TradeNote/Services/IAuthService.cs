using TradeNote.API.DTOs;

namespace TradeNote.API.Services
{
    public interface IAuthService
    {
        Task<ApiResponseDto<AuthResponseDto>> RegisterAsync(RegisterDto dto);
        Task<ApiResponseDto<AuthResponseDto>> LoginAsync(LoginDto dto);
        Task<ApiResponseDto<string>> ForgotPasswordAsync(ForgotPasswordDto dto);
        Task<ApiResponseDto<string>> VerifyOtpAsync(VerifyOtpDto dto);
        Task<ApiResponseDto<string>> ResetPasswordAsync(ResetPasswordDto dto);
    }
}