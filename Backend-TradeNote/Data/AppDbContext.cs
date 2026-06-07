using Microsoft.EntityFrameworkCore;
using TradeNote.API.Models;

namespace TradeNote.API.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<TradeEntry> TradeEntries { get; set; }
        public DbSet<OtpRecord> OtpRecords { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // ── USER ──────────────────────────────────
            // Unique email — cannot do with attributes
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();

            // ── TRADE ENTRY ───────────────────────────
            // Composite index — fast calendar queries
            modelBuilder.Entity<TradeEntry>()
                .HasIndex(t => new { t.UserId, t.TradeDate });

            // ── OTP RECORD ────────────────────────────
            // Index for fast OTP lookup by userId
            modelBuilder.Entity<OtpRecord>()
                .HasIndex(o => new { o.UserId, o.IsUsed });
        }
    }
}