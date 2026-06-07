using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TradeNote.API.DTOs;
using TradeNote.API.Services;

namespace TradeNote.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // All trade endpoints require JWT token
    public class TradeController : ControllerBase
    {
        private readonly ITradeService _tradeService;

        public TradeController(ITradeService tradeService)
        {
            _tradeService = tradeService;
        }

        // ── HELPER: Get UserId from JWT ───────────────
        private int GetUserId()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.Parse(claim!);
        }

        // ── GET TRADES BY DATE ────────────────────────
        // GET: api/trade/by-date?date=2024-04-28
        [HttpGet("by-date")]
        public async Task<IActionResult> GetByDate([FromQuery] DateTime date)
        {
            var userId = GetUserId();
            var result = await _tradeService.GetByDateAsync(userId, date);
            return Ok(result);
        }

        // ── GET MONTH SUMMARY (Calendar) ──────────────
        // GET: api/trade/month-summary?year=2024&month=4
        [HttpGet("month-summary")]
        public async Task<IActionResult> GetMonthSummary(
            [FromQuery] int year,
            [FromQuery] int month)
        {
            var userId = GetUserId();
            var result = await _tradeService.GetMonthSummaryAsync(
                userId, year, month);

            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }

        // ── CREATE TRADE ──────────────────────────────
        // POST: api/trade
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateTradeDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = GetUserId();
            var result = await _tradeService.CreateAsync(userId, dto);

            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }

        // ── UPDATE TRADE ──────────────────────────────
        // PUT: api/trade/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(
            int id, [FromBody] UpdateTradeDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = GetUserId();
            var result = await _tradeService.UpdateAsync(userId, id, dto);

            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }

        // ── DELETE TRADE ──────────────────────────────
        // DELETE: api/trade/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var userId = GetUserId();
            var result = await _tradeService.DeleteAsync(userId, id);

            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }
    }
}