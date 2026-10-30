using AIProctoringAPI.DTOs;

namespace AIProctoringAPI.Interfaces;

public interface ISessionService
{
    Task<(bool Success, string Message, int? SessionId)> StartSessionAsync(int examId, int studentId);
    Task<SessionResponse?> GetSessionAsync(int sessionId);
    Task<List<SessionResponse>> GetStudentSessionsAsync(int studentId);
    Task<List<SessionResponse>> GetActiveSessionsAsync();
    Task<(bool Success, string Message)> UpdateHeartbeatAsync(int sessionId, int studentId);
    Task<(bool Success, string Message, SubmitExamResponse? Result)> SubmitExamAsync(int sessionId, int studentId, SubmitExamRequest request);
}
