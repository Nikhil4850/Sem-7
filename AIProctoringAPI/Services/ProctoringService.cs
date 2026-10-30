using AIProctoringAPI.Data;
using AIProctoringAPI.DTOs;
using AIProctoringAPI.Interfaces;
using Microsoft.Data.SqlClient;

namespace AIProctoringAPI.Services;

public class ProctoringService : IProctoringService
{
    private readonly DatabaseHelper _db;
    private readonly ILogger<ProctoringService> _logger;

    // Allowed event types — client-supplied types are validated against this list
    private static readonly HashSet<string> AllowedEventTypes = new(StringComparer.OrdinalIgnoreCase)
    {
        "face_missing", "multiple_faces", "suspicious_movement",
        "tab_switch", "gaze_away", "eye_closed", "phone_detected", "unknown_person"
    };

    public ProctoringService(DatabaseHelper db, ILogger<ProctoringService> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task<(bool Success, string Message, int? LogId)> AddLogAsync(AddLogRequest request, int userId)
    {
        if (!AllowedEventTypes.Contains(request.EventType))
            return (false, $"Unknown event type '{request.EventType}'.", null);

        try
        {
            var result = await _db.ExecuteScalarAsync("sp_AddSessionLog", cmd =>
            {
                cmd.Parameters.Add(new SqlParameter("@SessionId", System.Data.SqlDbType.Int) { Value = request.SessionId });
                cmd.Parameters.Add(new SqlParameter("@UserId", System.Data.SqlDbType.Int) { Value = userId });
                cmd.Parameters.Add(new SqlParameter("@EventType", System.Data.SqlDbType.NVarChar, 100) { Value = request.EventType });
                cmd.Parameters.Add(new SqlParameter("@EventDetails", System.Data.SqlDbType.NVarChar, -1) { Value = (object?)request.EventDetails ?? DBNull.Value });
                // Always use server-side timestamp — never trust the client
                cmd.Parameters.Add(new SqlParameter("@Timestamp", System.Data.SqlDbType.DateTime2) { Value = DateTime.UtcNow });
            });

            return (true, "Log recorded.", result is null ? null : Convert.ToInt32(result));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error adding proctoring log for session {SessionId}", request.SessionId);
            return (false, "Failed to record log.", null);
        }
    }

    public async Task<List<LogResponse>> GetSessionLogsAsync(int sessionId)
    {
        return await _db.ExecuteReaderAsync("sp_GetSessionLogs", cmd =>
        {
            cmd.Parameters.Add(new SqlParameter("@SessionId", System.Data.SqlDbType.Int) { Value = sessionId });
        }, MapLogResponse);
    }

    public async Task<List<LogResponse>> GetUserLogsAsync(int userId)
    {
        return await _db.ExecuteReaderAsync("sp_GetUserLogs", cmd =>
        {
            cmd.Parameters.Add(new SqlParameter("@UserId", System.Data.SqlDbType.Int) { Value = userId });
        }, MapLogResponse);
    }

    public async Task<List<LogResponse>> GetAllLogsAsync()
    {
        return await _db.ExecuteReaderAsync("sp_GetAllSessionLogs",
            cmd => { },
            MapLogResponse);
    }

    public async Task<(bool Success, string Message, int? VerdictId)> SaveVerdictAsync(SaveVerdictRequest request)
    {
        try
        {
            var result = await _db.ExecuteScalarAsync("sp_SaveProctorVerdict", cmd =>
            {
                cmd.Parameters.Add(new SqlParameter("@SessionId", System.Data.SqlDbType.Int) { Value = request.SessionId });
                cmd.Parameters.Add(new SqlParameter("@Verdict", System.Data.SqlDbType.NVarChar, 100) { Value = request.Verdict });
                cmd.Parameters.Add(new SqlParameter("@Confidence", System.Data.SqlDbType.Decimal) { Value = (object?)request.Confidence ?? DBNull.Value, Precision = 5, Scale = 4 });
                cmd.Parameters.Add(new SqlParameter("@Details", System.Data.SqlDbType.NVarChar, -1) { Value = (object?)request.Details ?? DBNull.Value });
                cmd.Parameters.Add(new SqlParameter("@CreatedAt", System.Data.SqlDbType.DateTime2) { Value = DateTime.UtcNow });
            });

            return (true, "Verdict saved.", result is null ? null : Convert.ToInt32(result));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error saving verdict for session {SessionId}", request.SessionId);
            return (false, "Failed to save verdict.", null);
        }
    }

    public async Task<List<VerdictResponse>> GetSessionVerdictsAsync(int sessionId)
    {
        return await _db.ExecuteReaderAsync("sp_GetProctorVerdicts", cmd =>
        {
            cmd.Parameters.Add(new SqlParameter("@SessionId", System.Data.SqlDbType.Int) { Value = sessionId });
        }, reader => new VerdictResponse
        {
            VerdictId = reader.GetInt32(reader.GetOrdinal("VerdictId")),
            SessionId = reader.GetInt32(reader.GetOrdinal("SessionId")),
            Verdict = DatabaseHelper.GetStringOrEmpty(reader, "Verdict"),
            Confidence = DatabaseHelper.GetNullableDecimal(reader, "Confidence"),
            Details = DatabaseHelper.GetString(reader, "Details"),
            CreatedAt = reader.GetDateTime(reader.GetOrdinal("CreatedAt"))
        });
    }

    private static LogResponse MapLogResponse(SqlDataReader reader) => new()
    {
        LogId = reader.GetInt32(reader.GetOrdinal("LogId")),
        SessionId = reader.GetInt32(reader.GetOrdinal("SessionId")),
        UserId = reader.GetInt32(reader.GetOrdinal("UserId")),
        EventType = DatabaseHelper.GetStringOrEmpty(reader, "EventType"),
        EventDetails = DatabaseHelper.GetString(reader, "EventDetails"),
        Timestamp = reader.GetDateTime(reader.GetOrdinal("Timestamp"))
    };
}
