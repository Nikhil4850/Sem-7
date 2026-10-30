using AIProctoringAPI.Data;
using AIProctoringAPI.DTOs;
using AIProctoringAPI.Interfaces;

namespace AIProctoringAPI.Services;

public class AnalyticsService : IAnalyticsService
{
    private readonly DatabaseHelper _db;
    private readonly ILogger<AnalyticsService> _logger;

    public AnalyticsService(DatabaseHelper db, ILogger<AnalyticsService> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task<AnalyticsSummaryResponse> GetSummaryAsync()
    {
        var result = await _db.ExecuteSingleAsync("sp_GetAnalyticsSummary",
            cmd => { },
            reader => new AnalyticsSummaryResponse
            {
                TotalExams = reader.GetInt32(reader.GetOrdinal("TotalExams")),
                TotalStudents = reader.GetInt32(reader.GetOrdinal("TotalStudents")),
                TotalSessions = reader.GetInt32(reader.GetOrdinal("TotalSessions")),
                ActiveSessions = reader.GetInt32(reader.GetOrdinal("ActiveSessions")),
                CompletedSessions = reader.GetInt32(reader.GetOrdinal("CompletedSessions")),
                AverageScore = DatabaseHelper.GetNullableDecimal(reader, "AverageScore"),
                TotalProctoringEvents = reader.GetInt32(reader.GetOrdinal("TotalProctoringEvents")),
                FlaggedSessions = reader.GetInt32(reader.GetOrdinal("FlaggedSessions"))
            });

        return result ?? new AnalyticsSummaryResponse();
    }

    public async Task<List<HourlyAnalyticsResponse>> GetHourlyAnalyticsAsync()
    {
        return await _db.ExecuteReaderAsync("sp_GetHourlyAnalytics",
            cmd => { },
            reader => new HourlyAnalyticsResponse
            {
                Hour = reader.GetDateTime(reader.GetOrdinal("Hour")),
                SessionCount = reader.GetInt32(reader.GetOrdinal("SessionCount")),
                EventCount = reader.GetInt32(reader.GetOrdinal("EventCount")),
                AverageScore = DatabaseHelper.GetNullableDecimal(reader, "AverageScore")
            });
    }
}
