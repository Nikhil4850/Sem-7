using AIProctoringAPI.DTOs;

namespace AIProctoringAPI.Interfaces;

public interface IQuestionService
{
    Task<(bool Success, string Message, int? QuestionId)> AddQuestionAsync(AddQuestionRequest request);
    Task<List<QuestionAdminResponse>> GetAllQuestionsAsync();
    Task<QuestionAdminResponse?> GetQuestionByIdAsync(int questionId);
    Task<List<QuestionStudentResponse>> GetQuestionsForStudentAsync(int examId);
    Task<(bool Success, string Message)> UpdateQuestionAsync(int questionId, UpdateQuestionRequest request);
    Task<(bool Success, string Message)> DeleteQuestionAsync(int questionId);
}
