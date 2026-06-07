using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TradeNote.API.DTOs
{
    // ── RESPONSE DTO (returned to frontend) ───
    public class TradeEntryDto
    {
        public int Id { get; set; }
        public DateTime TradeDate { get; set; }
        public string StockName { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public decimal BuyAmount { get; set; }
        public decimal SellAmount { get; set; }
        public decimal ProfitLoss { get; set; }
        public string? Notes { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    // ── CREATE DTO (frontend → backend) ───────
    public class CreateTradeDto
    {
        [Required(ErrorMessage = "Trade date is required")]
        public DateTime TradeDate { get; set; }

        [Required(ErrorMessage = "Stock name is required")]
        [MaxLength(50, ErrorMessage = "Stock name max 50 characters")]
        public string StockName { get; set; } = string.Empty;

        [Required(ErrorMessage = "Quantity is required")]
        [Range(1, int.MaxValue, ErrorMessage = "Quantity must be at least 1")]
        public int Quantity { get; set; }

        [Required(ErrorMessage = "Buy amount is required")]
        [Range(0.01, double.MaxValue, ErrorMessage = "Buy amount must be greater than 0")]
        [Column(TypeName = "decimal(18,2)")]
        public decimal BuyAmount { get; set; }

        [Required(ErrorMessage = "Sell amount is required")]
        [Range(0.01, double.MaxValue, ErrorMessage = "Sell amount must be greater than 0")]
        [Column(TypeName = "decimal(18,2)")]
        public decimal SellAmount { get; set; }

        [MaxLength(500, ErrorMessage = "Notes max 500 characters")]
        public string? Notes { get; set; }
    }

    // ── UPDATE DTO (frontend → backend) ───────
    public class UpdateTradeDto
    {
        [Required(ErrorMessage = "Stock name is required")]
        [MaxLength(50)]
        public string StockName { get; set; } = string.Empty;

        [Required(ErrorMessage = "Quantity is required")]
        [Range(1, int.MaxValue, ErrorMessage = "Quantity must be at least 1")]
        public int Quantity { get; set; }

        [Required(ErrorMessage = "Buy amount is required")]
        [Range(0.01, double.MaxValue, ErrorMessage = "Buy amount must be greater than 0")]
        [Column(TypeName = "decimal(18,2)")]
        public decimal BuyAmount { get; set; }

        [Required(ErrorMessage = "Sell amount is required")]
        [Range(0.01, double.MaxValue, ErrorMessage = "Sell amount must be greater than 0")]
        [Column(TypeName = "decimal(18,2)")]
        public decimal SellAmount { get; set; }

        [MaxLength(500)]
        public string? Notes { get; set; }
    }

    // ── DAY SUMMARY (Calendar view) ───────────
    public class DaySummaryDto
    {
        public DateTime TradeDate { get; set; }
        public int TradeCount { get; set; }
        public decimal TotalProfitLoss { get; set; }
        public bool IsProfit { get; set; }
    }

    // ── API RESPONSE WRAPPER ──────────────────
    public class ApiResponseDto<T>
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public T? Data { get; set; }

        public static ApiResponseDto<T> Ok(T data, string message = "Success")
            => new() { Success = true, Message = message, Data = data };

        public static ApiResponseDto<T> Fail(string message)
            => new() { Success = false, Message = message, Data = default };
    }
}