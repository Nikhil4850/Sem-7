using AIProctoringAPI.Data;
using AIProctoringAPI.DTOs;
using AIProctoringAPI.Interfaces;
using Microsoft.Data.SqlClient;

namespace AIProctoringAPI.Services;

public class ExamService : IExamService
{
    private readonly DatabaseHelper _db;
    private readonly ILogger<ExamService> _logger;

    public ExamService(DatabaseHelper db, ILogger<ExamService> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task<(bool Success, string Message, int? ExamId)> CreateExamAsync(CreateExamRequest request, int createdByUserId)
    {
        try
        {
            var result = await _db.ExecuteScalarAsync("sp_CreateExam", cmd =>
            {
                cmd.Parameters.Add(new SqlParameter("@Title", System.Data.SqlDbType.NVarChar, 500) { Value = request.Title });
                cmd.Parameters.Add(new SqlParameter("@Description", System.Data.SqlDbType.NVarChar, -1) { Value = (object?)request.Description ?? DBNull.Value });
                cmd.Parameters.Add(new SqlParameter("@DurationMinutes", System.Data.SqlDbType.Int) { Value = request.DurationMinutes });
                cmd.Parameters.Add(new SqlParameter("@TotalMarks", System.Data.SqlDbType.Int) { Value = request.TotalMarks });
                cmd.Parameters.Add(new SqlParameter("@StartTime", System.Data.SqlDbType.DateTime2) { Value = (object?)request.StartTime ?? DBNull.Value });
                cmd.Parameters.Add(new SqlParameter("@EndTime", System.Data.SqlDbType.DateTime2) { Value = (object?)request.EndTime ?? DBNull.Value });
                cmd.Parameters.Add(new SqlParameter("@IsActive", System.Data.SqlDbType.Bit) { Value = request.IsActive });
                cmd.Parameters.Add(new SqlParameter("@CreatedBy", System.Data.SqlDbType.Int) { Value = createdByUserId });
            });

            int? examId = result is null ? null : Convert.ToInt32(result);
            return (true, "Exam created successfully.", examId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating exam '{Title}'", request.Title);
            return (false, "Failed to create exam.", null);
        }
    }

    public async Task<List<ExamResponse>> GetAllExamsAsync()
    {
        return await _db.ExecuteReaderAsync("sp_GetAllExams",
            cmd => { },
            MapExamResponse);
    }

    public async Task<ExamResponse?> GetExamByIdAsync(int examId)
    {
        return await _db.ExecuteSingleAsync("sp_GetExamById", cmd =>
        {
            cmd.Parameters.Add(new SqlParameter("@ExamId", System.Data.SqlDbType.Int) { Value = examId });
        }, MapExamResponse);
    }

    public async Task<(bool Success, string Message)> UpdateExamAsync(int examId, UpdateExamRequest request)
    {
        try
        {
            int affected = await _db.ExecuteNonQueryAsync("sp_UpdateExam", cmd =>
            {
                cmd.Parameters.Add(new SqlParameter("@ExamId", System.Data.SqlDbType.Int) { Value = examId });
                cmd.Parameters.Add(new SqlParameter("@Title", System.Data.SqlDbType.NVarChar, 500) { Value = (object?)request.Title ?? DBNull.Value });
                cmd.Parameters.Add(new SqlParameter("@Description", System.Data.SqlDbType.NVarChar, -1) { Value = (object?)request.Description ?? DBNull.Value });
                cmd.Parameters.Add(new SqlParameter("@DurationMinutes", System.Data.SqlDbType.Int) { Value = (object?)request.DurationMinutes ?? DBNull.Value });
                cmd.Parameters.Add(new SqlParameter("@TotalMarks", System.Data.SqlDbType.Int) { Value = (object?)request.TotalMarks ?? DBNull.Value });
                cmd.Parameters.Add(new SqlParameter("@StartTime", System.Data.SqlDbType.DateTime2) { Value = (object?)request.StartTime ?? DBNull.Value });
                cmd.Parameters.Add(new SqlParameter("@EndTime", System.Data.SqlDbType.DateTime2) { Value = (object?)request.EndTime ?? DBNull.Value });
                cmd.Parameters.Add(new SqlParameter("@IsActive", System.Data.SqlDbType.Bit) { Value = (object?)request.IsActive ?? DBNull.Value });
            });

            return affected > 0 ? (true, "Exam updated.") : (false, "Exam not found.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating exam {ExamId}", examId);
            return (false, "Update failed.");
        }
    }

    public async Task<(bool Success, string Message)> DeleteExamAsync(int examId)
    {
        try
        {
            var result = await _db.ExecuteScalarAsync("sp_DeleteExam", cmd =>
            {
                cmd.Parameters.Add(new SqlParameter("@ExamId", System.Data.SqlDbType.Int) { Value = examId });
            });

            int rows = result is null ? 0 : Convert.ToInt32(result);
            return rows > 0 ? (true, "Exam deleted.") : (false, "Exam not found.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting exam {ExamId}", examId);
            return (false, "Delete failed.");
        }
    }

    private static ExamResponse MapExamResponse(SqlDataReader reader) => new()
    {
        ExamId = reader.GetInt32(reader.GetOrdinal("ExamId")),
        Title = DatabaseHelper.GetStringOrEmpty(reader, "Title"),
        Description = DatabaseHelper.GetString(reader, "Description"),
        DurationMinutes = reader.GetInt32(reader.GetOrdinal("DurationMinutes")),
        TotalMarks = reader.GetInt32(reader.GetOrdinal("TotalMarks")),
        StartTime = DatabaseHelper.GetNullableDateTime(reader, "StartTime"),
        EndTime = DatabaseHelper.GetNullableDateTime(reader, "EndTime"),
        IsActive = reader.GetBoolean(reader.GetOrdinal("IsActive")),
        CreatedAt = reader.GetDateTime(reader.GetOrdinal("CreatedAt")),
        CreatedBy = DatabaseHelper.GetString(reader, "CreatedBy")
    };
}
