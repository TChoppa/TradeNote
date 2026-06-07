using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TradeNote.API.Models
{
    public class TradeEntry
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public DateTime TradeDate { get; set; }

        [Required]
        [MaxLength(50)]
        public string StockName { get; set; } = string.Empty;

        [Required]
        [Range(1, int.MaxValue, ErrorMessage = "Quantity must be at least 1")]
        public int Quantity { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal BuyAmount { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal SellAmount { get; set; }

        [NotMapped]
        public decimal ProfitLoss => SellAmount - BuyAmount;

        [MaxLength(500)]
        public string? Notes { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        // Foreign Key
        public int UserId { get; set; }

        [ForeignKey("UserId")]
        public User? User { get; set; }
    }
}
