using AIProctoringAPI.Data;
using AIProctoringAPI.DTOs;
using AIProctoringAPI.Interfaces;
using Microsoft.Data.SqlClient;

namespace AIProctoringAPI.Services;

public class SessionService : ISessionService
{
    private readonly DatabaseHelper _db;
    private readonly ILogger<SessionService> _logger;

    public SessionService(DatabaseHelper db, ILogger<SessionService> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task<(bool Success, string Message, int? SessionId)> StartSessionAsync(int examId, int studentId)
    {
        try
        {
            var result = await _db.ExecuteScalarAsync("sp_StartExamSession", cmd =>
            {
                cmd.Parameters.Add(new SqlParameter("@ExamId", System.Data.SqlDbType.Int) { Value = examId });
                cmd.Parameters.Add(new SqlParameter("@StudentId", System.Data.SqlDbType.Int) { Value = studentId });
                cmd.Parameters.Add(new SqlParameter("@StartTime", System.Data.SqlDbType.DateTime2) { Value = DateTime.UtcNow });
            });

            if (result is null)
                return (false, "Failed to start session.", null);

            int sessionId = Convert.ToInt32(result);
            return (true, "Session started.", sessionId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error starting session for student {StudentId}, exam {ExamId}", studentId, examId);
            return (false, ex.Message.Contains("already exists") ? "An active session already exists." : "Failed to start session.", null);
        }
    }

    public async Task<SessionResponse?> GetSessionAsync(int sessionId)
    {
        return await _db.ExecuteSingleAsync("sp_GetExamSession", cmd =>
        {
            cmd.Parameters.Add(new SqlParameter("@SessionId", System.Data.SqlDbType.Int) { Value = sessionId });
        }, MapSessionResponse);
    }

    public async Task<List<SessionResponse>> GetStudentSessionsAsync(int studentId)
    {
        return await _db.ExecuteReaderAsync("sp_GetStudentSessions", cmd =>
        {
            cmd.Parameters.Add(new SqlParameter("@StudentId", System.Data.SqlDbType.Int) { Value = studentId });
        }, MapSessionResponse);
    }

    public async Task<List<SessionResponse>> GetActiveSessionsAsync()
    {
        return await _db.ExecuteReaderAsync("sp_GetActiveSessions",
            cmd => { },
            MapSessionResponse);
    }

    public async Task<(bool Success, string Message)> UpdateHeartbeatAsync(int sessionId, int studentId)
    {
        try
        {
            int affected = await _db.ExecuteNonQueryAsync("sp_UpdateSessionHeartbeat", cmd =>
            {
                cmd.Parameters.Add(new SqlParameter("@SessionId", System.Data.SqlDbType.Int) { Value = sessionId });
                cmd.Parameters.Add(new SqlParameter("@StudentId", System.Data.SqlDbType.Int) { Value = studentId });
                cmd.Parameters.Add(new SqlParameter("@HeartbeatTime", System.Data.SqlDbType.DateTime2) { Value = DateTime.UtcNow });
            });

            return affected > 0
                ? (true, "Heartbeat recorded.")
                : (false, "Session not found or not owned by this student.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating heartbeat for session {SessionId}", sessionId);
            return (false, "Heartbeat update failed.");
        }
    }

    public async Task<(bool Success, string Message, SubmitExamResponse? Result)> SubmitExamAsync(
        int sessionId, int studentId, SubmitExamRequest request)
    {
        try
        {
            var session = await GetSessionAsync(sessionId);
            if (session is null)
                return (false, "Session not found.", null);
            if (session.StudentId != studentId)
                return (false, "You do not own this session.", null);
            if (!session.Status.Equals("active", StringComparison.OrdinalIgnoreCase))
                return (false, "Session is not active. It may have already been submitted.", null);

            string answersJson = System.Text.Json.JsonSerializer.Serialize(request.Answers);

            SubmitExamResponse? submitResult = null;
            var questions = new List<QuestionAdminResponse>();

            await using var connection = await _db.CreateConnectionAsync();
            await using var cmd = new SqlCommand("sp_SubmitExam", connection)
            {
                CommandType = System.Data.CommandType.StoredProcedure
            };
            cmd.Parameters.Add(new SqlParameter("@SessionId",   System.Data.SqlDbType.Int)         { Value = sessionId });
            cmd.Parameters.Add(new SqlParameter("@StudentId",   System.Data.SqlDbType.Int)         { Value = studentId });
            cmd.Parameters.Add(new SqlParameter("@AnswersJson", System.Data.SqlDbType.NVarChar, -1) { Value = answersJson });
            cmd.Parameters.Add(new SqlParameter("@SubmitTime",  System.Data.SqlDbType.DateTime2)   { Value = DateTime.UtcNow });

            await using var reader = await cmd.ExecuteReaderAsync();

            // First result set: score summary
            if (await reader.ReadAsync())
            {
                submitResult = new SubmitExamResponse
                {
                    SessionId   = reader.GetInt32(reader.GetOrdinal("SessionId")),
                    Score       = reader.GetDecimal(reader.GetOrdinal("Score")),
                    TotalMarks  = reader.GetInt32(reader.GetOrdinal("TotalMarks")),
                    SubmittedAt = reader.GetDateTime(reader.GetOrdinal("SubmittedAt")),
                    Message     = "Your exam has been submitted and graded."
                };
            }

            // Second result set: questions with correct answers
            if (await reader.NextResultAsync())
            {
                while (await reader.ReadAsync())
                {
                    questions.Add(new QuestionAdminResponse
                    {
                        QuestionId    = reader.GetInt32(reader.GetOrdinal("QuestionId")),
                        ExamId        = reader.GetInt32(reader.GetOrdinal("ExamId")),
                        QuestionText  = DatabaseHelper.GetStringOrEmpty(reader, "QuestionText"),
                        QuestionType  = DatabaseHelper.GetStringOrEmpty(reader, "QuestionType"),
                        OptionA       = DatabaseHelper.GetString(reader, "OptionA"),
                        OptionB       = DatabaseHelper.GetString(reader, "OptionB"),
                        OptionC       = DatabaseHelper.GetString(reader, "OptionC"),
                        OptionD       = DatabaseHelper.GetString(reader, "OptionD"),
                        CorrectAnswer = DatabaseHelper.GetStringOrEmpty(reader, "CorrectAnswer"),
                        Marks         = reader.GetInt32(reader.GetOrdinal("Marks")),
                        OrderNumber   = DatabaseHelper.GetNullableInt(reader, "OrderNumber")
                    });
                }
            }

            if (submitResult is null)
                return (false, "Submission failed.", null);

            // Attach questions and submitted answers to response
            submitResult.Questions = questions;
            submitResult.SubmittedAnswers = request.Answers;

            return (true, "Exam submitted successfully.", submitResult);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error submitting exam for session {SessionId}", sessionId);
            return (false, "Submission failed.", null);
        }
    }

    private static SessionResponse MapSessionResponse(SqlDataReader reader) => new()
    {
        SessionId = reader.GetInt32(reader.GetOrdinal("SessionId")),
        ExamId = reader.GetInt32(reader.GetOrdinal("ExamId")),
        ExamTitle = DatabaseHelper.GetStringOrEmpty(reader, "ExamTitle"),
        StudentId = reader.GetInt32(reader.GetOrdinal("StudentId")),
        StudentUsername = DatabaseHelper.GetStringOrEmpty(reader, "StudentUsername"),
        StartTime = reader.GetDateTime(reader.GetOrdinal("StartTime")),
        EndTime = DatabaseHelper.GetNullableDateTime(reader, "EndTime"),
        Status = DatabaseHelper.GetStringOrEmpty(reader, "Status"),
        Score = DatabaseHelper.GetNullableDecimal(reader, "Score"),
        LastHeartbeat = DatabaseHelper.GetNullableDateTime(reader, "LastHeartbeat")
    };
}
