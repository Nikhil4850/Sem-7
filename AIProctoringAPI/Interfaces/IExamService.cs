using AIProctoringAPI.DTOs;

namespace AIProctoringAPI.Interfaces;

public interface IExamService
{
    Task<(bool Success, string Message, int? ExamId)> CreateExamAsync(CreateExamRequest request, int createdByUserId);
    Task<List<ExamResponse>> GetAllExamsAsync();
    Task<ExamResponse?> GetExamByIdAsync(int examId);
    Task<(bool Success, string Message)> UpdateExamAsync(int examId, UpdateExamRequest request);
    Task<(bool Success, string Message)> DeleteExamAsync(int examId);
}
