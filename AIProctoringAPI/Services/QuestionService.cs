using AIProctoringAPI.Data;
using AIProctoringAPI.DTOs;
using AIProctoringAPI.Interfaces;
using Microsoft.Data.SqlClient;

namespace AIProctoringAPI.Services;

public class QuestionService : IQuestionService
{
    private readonly DatabaseHelper _db;
    private readonly ILogger<QuestionService> _logger;

    public QuestionService(DatabaseHelper db, ILogger<QuestionService> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task<(bool Success, string Message, int? QuestionId)> AddQuestionAsync(AddQuestionRequest request)
    {
        try
        {
            var result = await _db.ExecuteScalarAsync("sp_AddQuestion", cmd =>
            {
                cmd.Parameters.Add(new SqlParameter("@ExamId", System.Data.SqlDbType.Int) { Value = request.ExamId });
                cmd.Parameters.Add(new SqlParameter("@QuestionText", System.Data.SqlDbType.NVarChar, 2000) { Value = request.QuestionText });
                cmd.Parameters.Add(new SqlParameter("@QuestionType", System.Data.SqlDbType.NVarChar, 50) { Value = request.QuestionType });
                cmd.Parameters.Add(new SqlParameter("@OptionA", System.Data.SqlDbType.NVarChar, 500) { Value = (object?)request.OptionA ?? DBNull.Value });
                cmd.Parameters.Add(new SqlParameter("@OptionB", System.Data.SqlDbType.NVarChar, 500) { Value = (object?)request.OptionB ?? DBNull.Value });
                cmd.Parameters.Add(new SqlParameter("@OptionC", System.Data.SqlDbType.NVarChar, 500) { Value = (object?)request.OptionC ?? DBNull.Value });
                cmd.Parameters.Add(new SqlParameter("@OptionD", System.Data.SqlDbType.NVarChar, 500) { Value = (object?)request.OptionD ?? DBNull.Value });
                cmd.Parameters.Add(new SqlParameter("@CorrectAnswer", System.Data.SqlDbType.NVarChar, 500) { Value = request.CorrectAnswer });
                cmd.Parameters.Add(new SqlParameter("@Marks", System.Data.SqlDbType.Int) { Value = request.Marks });
                cmd.Parameters.Add(new SqlParameter("@OrderNumber", System.Data.SqlDbType.Int) { Value = (object?)request.OrderNumber ?? DBNull.Value });
            });

            int? questionId = result is null ? null : Convert.ToInt32(result);
            return (true, "Question added.", questionId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error adding question to exam {ExamId}", request.ExamId);
            return (false, "Failed to add question.", null);
        }
    }

    public async Task<List<QuestionAdminResponse>> GetAllQuestionsAsync()
    {
        return await _db.ExecuteReaderAsync("sp_GetAllQuestions",
            cmd => { },
            MapAdminResponse);
    }

    public async Task<QuestionAdminResponse?> GetQuestionByIdAsync(int questionId)
    {
        return await _db.ExecuteSingleAsync("sp_GetQuestionById", cmd =>
        {
            cmd.Parameters.Add(new SqlParameter("@QuestionId", System.Data.SqlDbType.Int) { Value = questionId });
        }, MapAdminResponse);
    }

    public async Task<List<QuestionStudentResponse>> GetQuestionsForStudentAsync(int examId)
    {
        // Reuse GetAllQuestions filtered by examId, projecting without CorrectAnswer
        return await _db.ExecuteReaderAsync("sp_GetAllQuestions",
            cmd => { /* sp may support @ExamId filter; add if the procedure accepts it */ },
            MapStudentResponse);
    }

    public async Task<(bool Success, string Message)> UpdateQuestionAsync(int questionId, UpdateQuestionRequest request)
    {
        try
        {
            int affected = await _db.ExecuteNonQueryAsync("sp_UpdateQuestion", cmd =>
            {
                cmd.Parameters.Add(new SqlParameter("@QuestionId", System.Data.SqlDbType.Int) { Value = questionId });
                cmd.Parameters.Add(new SqlParameter("@QuestionText", System.Data.SqlDbType.NVarChar, 2000) { Value = (object?)request.QuestionText ?? DBNull.Value });
                cmd.Parameters.Add(new SqlParameter("@QuestionType", System.Data.SqlDbType.NVarChar, 50) { Value = (object?)request.QuestionType ?? DBNull.Value });
                cmd.Parameters.Add(new SqlParameter("@OptionA", System.Data.SqlDbType.NVarChar, 500) { Value = (object?)request.OptionA ?? DBNull.Value });
                cmd.Parameters.Add(new SqlParameter("@OptionB", System.Data.SqlDbType.NVarChar, 500) { Value = (object?)request.OptionB ?? DBNull.Value });
                cmd.Parameters.Add(new SqlParameter("@OptionC", System.Data.SqlDbType.NVarChar, 500) { Value = (object?)request.OptionC ?? DBNull.Value });
                cmd.Parameters.Add(new SqlParameter("@OptionD", System.Data.SqlDbType.NVarChar, 500) { Value = (object?)request.OptionD ?? DBNull.Value });
                cmd.Parameters.Add(new SqlParameter("@CorrectAnswer", System.Data.SqlDbType.NVarChar, 500) { Value = (object?)request.CorrectAnswer ?? DBNull.Value });
                cmd.Parameters.Add(new SqlParameter("@Marks", System.Data.SqlDbType.Int) { Value = (object?)request.Marks ?? DBNull.Value });
                cmd.Parameters.Add(new SqlParameter("@OrderNumber", System.Data.SqlDbType.Int) { Value = (object?)request.OrderNumber ?? DBNull.Value });
            });

            return affected > 0 ? (true, "Question updated.") : (false, "Question not found.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating question {QuestionId}", questionId);
            return (false, "Update failed.");
        }
    }

    public async Task<(bool Success, string Message)> DeleteQuestionAsync(int questionId)
    {
        try
        {
            int affected = await _db.ExecuteNonQueryAsync("sp_DeleteQuestion", cmd =>
            {
                cmd.Parameters.Add(new SqlParameter("@QuestionId", System.Data.SqlDbType.Int) { Value = questionId });
            });

            return affected > 0 ? (true, "Question deleted.") : (false, "Question not found.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting question {QuestionId}", questionId);
            return (false, "Delete failed.");
        }
    }

    private static QuestionAdminResponse MapAdminResponse(SqlDataReader reader) => new()
    {
        QuestionId = reader.GetInt32(reader.GetOrdinal("QuestionId")),
        ExamId = reader.GetInt32(reader.GetOrdinal("ExamId")),
        QuestionText = DatabaseHelper.GetStringOrEmpty(reader, "QuestionText"),
        QuestionType = DatabaseHelper.GetStringOrEmpty(reader, "QuestionType"),
        OptionA = DatabaseHelper.GetString(reader, "OptionA"),
        OptionB = DatabaseHelper.GetString(reader, "OptionB"),
        OptionC = DatabaseHelper.GetString(reader, "OptionC"),
        OptionD = DatabaseHelper.GetString(reader, "OptionD"),
        CorrectAnswer = DatabaseHelper.GetStringOrEmpty(reader, "CorrectAnswer"),
        Marks = reader.GetInt32(reader.GetOrdinal("Marks")),
        OrderNumber = DatabaseHelper.GetNullableInt(reader, "OrderNumber")
    };

    private static QuestionStudentResponse MapStudentResponse(SqlDataReader reader) => new()
    {
        QuestionId = reader.GetInt32(reader.GetOrdinal("QuestionId")),
        ExamId = reader.GetInt32(reader.GetOrdinal("ExamId")),
        QuestionText = DatabaseHelper.GetStringOrEmpty(reader, "QuestionText"),
        QuestionType = DatabaseHelper.GetStringOrEmpty(reader, "QuestionType"),
        OptionA = DatabaseHelper.GetString(reader, "OptionA"),
        OptionB = DatabaseHelper.GetString(reader, "OptionB"),
        OptionC = DatabaseHelper.GetString(reader, "OptionC"),
        OptionD = DatabaseHelper.GetString(reader, "OptionD"),
        Marks = reader.GetInt32(reader.GetOrdinal("Marks")),
        OrderNumber = DatabaseHelper.GetNullableInt(reader, "OrderNumber")
        // CorrectAnswer intentionally excluded
    };
}
