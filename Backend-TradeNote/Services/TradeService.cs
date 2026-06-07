using TradeNote.API.DTOs;
using TradeNote.API.Models;
using TradeNote.API.Repositories;

namespace TradeNote.API.Services
{
    public class TradeService : ITradeService
    {
        private readonly ITradeRepository _tradeRepo;
        private const int MaxTradesPerDay = 5;

        public TradeService(ITradeRepository tradeRepo)
        {
            _tradeRepo = tradeRepo;
        }

        // ── GET BY DATE ───────────────────────────────
        public async Task<ApiResponseDto<List<TradeEntryDto>>> GetByDateAsync(
            int userId, DateTime date)
        {
            var trades = await _tradeRepo.GetByDateAsync(userId, date);
            return ApiResponseDto<List<TradeEntryDto>>.Ok(trades);
        }

        // ── GET MONTH SUMMARY ─────────────────────────
        public async Task<ApiResponseDto<List<DaySummaryDto>>> GetMonthSummaryAsync(
            int userId, int year, int month)
        {
            // Validate month and year
            if (month < 1 || month > 12)
                return ApiResponseDto<List<DaySummaryDto>>
                    .Fail("Invalid month");

            if (year < 2000 || year > DateTime.UtcNow.Year + 1)
                return ApiResponseDto<List<DaySummaryDto>>
                    .Fail("Invalid year");

            var summary = await _tradeRepo.GetMonthSummaryAsync(
                userId, year, month);

            return ApiResponseDto<List<DaySummaryDto>>.Ok(summary);
        }

        // ── CREATE ────────────────────────────────────
        public async Task<ApiResponseDto<TradeEntryDto>> CreateAsync(
    int userId, CreateTradeDto dto)
        {
            // ✅ Use India Standard Time for date comparison
            var indiaZone = TimeZoneInfo.FindSystemTimeZoneById("India Standard Time");
            var indiaToday = TimeZoneInfo.ConvertTimeFromUtc(
                                 DateTime.UtcNow, indiaZone).Date;

            // ✅ Compare only date part using India timezone
            if (dto.TradeDate.Date > indiaToday)
                return ApiResponseDto<TradeEntryDto>
                    .Fail("Cannot add trades for future dates");

            var trade = new TradeEntry
            {
                UserId = userId,
                TradeDate = dto.TradeDate.Date,
                StockName = dto.StockName.ToUpper().Trim(),
                Quantity = dto.Quantity,
                BuyAmount = dto.BuyAmount,
                SellAmount = dto.SellAmount,
                Notes = dto.Notes?.Trim(),
                CreatedAt = DateTime.UtcNow
            };

            var result = await _tradeRepo.CreateAsync(trade);
            return ApiResponseDto<TradeEntryDto>.Ok(
                result, "Trade created successfully");
        }

        // ── UPDATE ────────────────────────────────────
        public async Task<ApiResponseDto<TradeEntryDto>> UpdateAsync(
    int userId, int tradeId, UpdateTradeDto dto)
        {
            var trade = await _tradeRepo.GetByIdAsync(tradeId, userId);
            if (trade == null)
                return ApiResponseDto<TradeEntryDto>
                    .Fail("Trade not found");

            // ✅ Same India timezone fix for update too
            var indiaZone = TimeZoneInfo.FindSystemTimeZoneById("India Standard Time");
            var indiaToday = TimeZoneInfo.ConvertTimeFromUtc(
                                 DateTime.UtcNow, indiaZone).Date;

            if (trade.TradeDate.Date > indiaToday)
                return ApiResponseDto<TradeEntryDto>
                    .Fail("Cannot edit trades for future dates");

            trade.StockName = dto.StockName.ToUpper().Trim();
            trade.Quantity = dto.Quantity;
            trade.BuyAmount = dto.BuyAmount;
            trade.SellAmount = dto.SellAmount;
            trade.Notes = dto.Notes?.Trim();
            trade.UpdatedAt = DateTime.UtcNow;

            var result = await _tradeRepo.UpdateAsync(trade);
            return ApiResponseDto<TradeEntryDto>.Ok(
                result, "Trade updated successfully");
        }
        // ── DELETE ────────────────────────────────────
        public async Task<ApiResponseDto<string>> DeleteAsync(
            int userId, int tradeId)
        {
            var deleted = await _tradeRepo.DeleteAsync(tradeId, userId);
            if (!deleted)
                return ApiResponseDto<string>.Fail("Trade not found");

            return ApiResponseDto<string>.Ok(
                "deleted", "Trade deleted successfully");
        }
    }
}