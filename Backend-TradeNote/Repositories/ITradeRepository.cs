using TradeNote.API.DTOs;
using TradeNote.API.Models;

namespace TradeNote.API.Repositories
{
    public interface ITradeRepository
    {
        // Get trades for a specific day
        Task<List<TradeEntryDto>> GetByDateAsync(int userId, DateTime date);

        // Get month summary for calendar
        Task<List<DaySummaryDto>> GetMonthSummaryAsync(
            int userId, int year, int month);

        // Get single trade by id
        Task<TradeEntry?> GetByIdAsync(int id, int userId);

        // Get trade count for a specific day
        Task<int> GetDayCountAsync(int userId, DateTime date);

        // CRUD
        Task<TradeEntryDto> CreateAsync(TradeEntry trade);
        Task<TradeEntryDto> UpdateAsync(TradeEntry trade);
        Task<bool> DeleteAsync(int id, int userId);
    }
}