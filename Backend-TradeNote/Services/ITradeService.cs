using TradeNote.API.DTOs;

namespace TradeNote.API.Services
{
    public interface ITradeService
    {
        Task<ApiResponseDto<List<TradeEntryDto>>> GetByDateAsync(
            int userId, DateTime date);

        Task<ApiResponseDto<List<DaySummaryDto>>> GetMonthSummaryAsync(
            int userId, int year, int month);

        Task<ApiResponseDto<TradeEntryDto>> CreateAsync(
            int userId, CreateTradeDto dto);

        Task<ApiResponseDto<TradeEntryDto>> UpdateAsync(
            int userId, int tradeId, UpdateTradeDto dto);

        Task<ApiResponseDto<string>> DeleteAsync(
            int userId, int tradeId);
    }
}