using AIProctoringAPI.DTOs;

namespace AIProctoringAPI.Interfaces;

public interface IAnalyticsService
{
    Task<AnalyticsSummaryResponse> GetSummaryAsync();
    Task<List<HourlyAnalyticsResponse>> GetHourlyAnalyticsAsync();
}
