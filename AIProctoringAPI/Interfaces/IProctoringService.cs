using AIProctoringAPI.DTOs;

namespace AIProctoringAPI.Interfaces;

public interface IProctoringService
{
    Task<(bool Success, string Message, int? LogId)> AddLogAsync(AddLogRequest request, int userId);
    Task<List<LogResponse>> GetSessionLogsAsync(int sessionId);
    Task<List<LogResponse>> GetUserLogsAsync(int userId);
    Task<List<LogResponse>> GetAllLogsAsync();
    Task<(bool Success, string Message, int? VerdictId)> SaveVerdictAsync(SaveVerdictRequest request);
    Task<List<VerdictResponse>> GetSessionVerdictsAsync(int sessionId);
}
