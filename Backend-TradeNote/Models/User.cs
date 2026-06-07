using System.ComponentModel.DataAnnotations;

namespace TradeNote.API.Models
{
    public class User
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(50)]
        public string FirstName { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string LastName { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string PasswordHash { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation
        public ICollection<TradeEntry> TradeEntries { get; set; }
            = new List<TradeEntry>();

        public ICollection<OtpRecord> OtpRecords { get; set; }
            = new List<OtpRecord>();

    }
}
