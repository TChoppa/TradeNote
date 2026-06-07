using Microsoft.EntityFrameworkCore;
using TradeNote.API.Data;
using TradeNote.API.DTOs;
using TradeNote.API.Models;

namespace TradeNote.API.Repositories
{
    public class TradeRepository : ITradeRepository
    {
        private readonly AppDbContext _db;

        public TradeRepository(AppDbContext db)
        {
            _db = db;
        }

        // ── GET BY DATE ───────────────────────────────
        public async Task<List<TradeEntryDto>> GetByDateAsync(
            int userId, DateTime date)
        {
            return await _db.TradeEntries
                .Where(t => t.UserId == userId
                         && t.TradeDate.Date == date.Date)
                .OrderBy(t => t.CreatedAt)
                .Select(t => new TradeEntryDto
                {
                    Id = t.Id,
                    TradeDate = t.TradeDate,
                    StockName = t.StockName,
                    Quantity = t.Quantity,
                    BuyAmount = t.BuyAmount,
                    SellAmount = t.SellAmount,
                    ProfitLoss = t.SellAmount - t.BuyAmount,
                    Notes = t.Notes,
                    CreatedAt = t.CreatedAt,
                    UpdatedAt = t.UpdatedAt
                })
                .ToListAsync();
        }

        // ── GET MONTH SUMMARY ─────────────────────────
        public async Task<List<DaySummaryDto>> GetMonthSummaryAsync(
            int userId, int year, int month)
        {
            return await _db.TradeEntries
                .Where(t => t.UserId == userId
                         && t.TradeDate.Year == year
                         && t.TradeDate.Month == month)
                .GroupBy(t => t.TradeDate.Date)
                .Select(g => new DaySummaryDto
                {
                    TradeDate = g.Key,
                    TradeCount = g.Count(),
                    TotalProfitLoss = g.Sum(t => t.SellAmount - t.BuyAmount),
                    IsProfit = g.Sum(t => t.SellAmount - t.BuyAmount) >= 0
                })
                .OrderBy(d => d.TradeDate)
                .ToListAsync();
        }

        // ── GET BY ID ─────────────────────────────────
        public async Task<TradeEntry?> GetByIdAsync(int id, int userId)
        {
            return await _db.TradeEntries
                .FirstOrDefaultAsync(t => t.Id == id
                                       && t.UserId == userId);
        }

        // ── GET DAY COUNT ─────────────────────────────
        public async Task<int> GetDayCountAsync(int userId, DateTime date)
        {
            return await _db.TradeEntries
                .CountAsync(t => t.UserId == userId
                              && t.TradeDate.Date == date.Date);
        }

        // ── CREATE ────────────────────────────────────
        public async Task<TradeEntryDto> CreateAsync(TradeEntry trade)
        {
            _db.TradeEntries.Add(trade);
            await _db.SaveChangesAsync();

            return new TradeEntryDto
            {
                Id = trade.Id,
                TradeDate = trade.TradeDate,
                StockName = trade.StockName,
                Quantity = trade.Quantity,
                BuyAmount = trade.BuyAmount,
                SellAmount = trade.SellAmount,
                ProfitLoss = trade.SellAmount - trade.BuyAmount,
                Notes = trade.Notes,
                CreatedAt = trade.CreatedAt,
                UpdatedAt = trade.UpdatedAt
            };
        }

        // ── UPDATE ────────────────────────────────────
        public async Task<TradeEntryDto> UpdateAsync(TradeEntry trade)
        {
            _db.TradeEntries.Update(trade);
            await _db.SaveChangesAsync();

            return new TradeEntryDto
            {
                Id = trade.Id,
                TradeDate = trade.TradeDate,
                StockName = trade.StockName,
                Quantity = trade.Quantity,
                BuyAmount = trade.BuyAmount,
                SellAmount = trade.SellAmount,
                ProfitLoss = trade.SellAmount - trade.BuyAmount,
                Notes = trade.Notes,
                CreatedAt = trade.CreatedAt,
                UpdatedAt = trade.UpdatedAt
            };
        }

        // ── DELETE ────────────────────────────────────
        public async Task<bool> DeleteAsync(int id, int userId)
        {
            var trade = await _db.TradeEntries
                .FirstOrDefaultAsync(t => t.Id == id
                                       && t.UserId == userId);

            if (trade == null) return false;

            _db.TradeEntries.Remove(trade);
            await _db.SaveChangesAsync();
            return true;
        }
    }
}