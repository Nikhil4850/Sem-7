using AIProctoringAPI.Data;
using AIProctoringAPI.DTOs;
using AIProctoringAPI.Interfaces;
using Microsoft.Data.SqlClient;

namespace AIProctoringAPI.Services;

public class IdentityService : IIdentityService
{
    private readonly DatabaseHelper _db;
    private readonly ILogger<IdentityService> _logger;

    public IdentityService(DatabaseHelper db, ILogger<IdentityService> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task<(bool Success, string Message)> SaveVerificationAsync(SaveIdentityVerificationRequest request)
    {
        try
        {
            await _db.ExecuteNonQueryAsync("sp_SaveIdentityVerification", cmd =>
            {
                cmd.Parameters.Add(new SqlParameter("@SessionId", System.Data.SqlDbType.Int) { Value = request.SessionId });
                cmd.Parameters.Add(new SqlParameter("@StudentId", System.Data.SqlDbType.Int) { Value = request.StudentId });
                // Store only a reference/hash, not raw biometric data
                cmd.Parameters.Add(new SqlParameter("@ImageData", System.Data.SqlDbType.NVarChar, -1) { Value = (object?)request.ImageData ?? DBNull.Value });
                cmd.Parameters.Add(new SqlParameter("@VerificationStatus", System.Data.SqlDbType.NVarChar, 50) { Value = (object?)request.VerificationStatus ?? DBNull.Value });
                cmd.Parameters.Add(new SqlParameter("@Notes", System.Data.SqlDbType.NVarChar, -1) { Value = (object?)request.Notes ?? DBNull.Value });
                cmd.Parameters.Add(new SqlParameter("@CreatedAt", System.Data.SqlDbType.DateTime2) { Value = DateTime.UtcNow });
            });

            return (true, "Verification saved.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error saving identity verification for session {SessionId}", request.SessionId);
            return (false, "Failed to save verification.");
        }
    }

    public async Task<IdentityVerificationResponse?> GetVerificationAsync(int sessionId)
    {
        return await _db.ExecuteSingleAsync("sp_GetIdentityVerification", cmd =>
        {
            cmd.Parameters.Add(new SqlParameter("@SessionId", System.Data.SqlDbType.Int) { Value = sessionId });
        }, reader => new IdentityVerificationResponse
        {
            VerificationId = reader.GetInt32(reader.GetOrdinal("VerificationId")),
            SessionId = reader.GetInt32(reader.GetOrdinal("SessionId")),
            StudentId = reader.GetInt32(reader.GetOrdinal("StudentId")),
            VerificationStatus = DatabaseHelper.GetString(reader, "VerificationStatus"),
            Notes = DatabaseHelper.GetString(reader, "Notes"),
            CreatedAt = reader.GetDateTime(reader.GetOrdinal("CreatedAt"))
            // ImageData intentionally not included in response
        });
    }
}
