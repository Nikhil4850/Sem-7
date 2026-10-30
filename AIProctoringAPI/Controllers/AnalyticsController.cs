using AIProctoringAPI.DTOs;
using AIProctoringAPI.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AIProctoringAPI.Controllers;

[ApiController]
[Route("api/analytics")]
[Produces("application/json")]
[Authorize(Roles = "administrator")]
public class AnalyticsController : ControllerBase
{
    private readonly IAnalyticsService _analytics;

    public AnalyticsController(IAnalyticsService analytics) => _analytics = analytics;

    /// <summary>Get an analytics summary for the dashboard.</summary>
    [HttpGet("summary")]
    [ProducesResponseType(typeof(AnalyticsSummaryResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetSummary() =>
        Ok(await _analytics.GetSummaryAsync());

    /// <summary>Get hourly analytics data.</summary>
    [HttpGet("hourly")]
    [ProducesResponseType(typeof(List<HourlyAnalyticsResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetHourly() =>
        Ok(await _analytics.GetHourlyAnalyticsAsync());
}
