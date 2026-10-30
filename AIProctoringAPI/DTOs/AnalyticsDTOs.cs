namespace AIProctoringAPI.DTOs;

public class AnalyticsSummaryResponse
{
    public int TotalExams { get; set; }
    public int TotalStudents { get; set; }
    public int TotalSessions { get; set; }
    public int ActiveSessions { get; set; }
    public int CompletedSessions { get; set; }
    public decimal? AverageScore { get; set; }
    public int TotalProctoringEvents { get; set; }
    public int FlaggedSessions { get; set; }
}

public class HourlyAnalyticsResponse
{
    public DateTime Hour { get; set; }
    public int SessionCount { get; set; }
    public int EventCount { get; set; }
    public decimal? AverageScore { get; set; }
}
