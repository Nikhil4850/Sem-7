using AIProctoringAPI.Data;
using AIProctoringAPI.DTOs;
using AIProctoringAPI.Interfaces;
using Microsoft.Data.SqlClient;

namespace AIProctoringAPI.Services;

public class SettingsService : ISettingsService
{
    private readonly DatabaseHelper _db;
    private readonly ILogger<SettingsService> _logger;

    public SettingsService(DatabaseHelper db, ILogger<SettingsService> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task<SettingResponse?> GetSettingAsync(string key)
    {
        return await _db.ExecuteSingleAsync("sp_GetSetting", cmd =>
        {
            cmd.Parameters.Add(new SqlParameter("@Key", System.Data.SqlDbType.NVarChar, 200) { Value = key });
        }, MapSettingResponse);
    }

    public async Task<(bool Success, string Message)> SaveSettingAsync(string key, SaveSettingRequest request)
    {
        try
        {
            await _db.ExecuteNonQueryAsync("sp_SaveSetting", cmd =>
            {
                cmd.Parameters.Add(new SqlParameter("@Key", System.Data.SqlDbType.NVarChar, 200) { Value = key });
                cmd.Parameters.Add(new SqlParameter("@Value", System.Data.SqlDbType.NVarChar, 200) { Value = request.Value });
                cmd.Parameters.Add(new SqlParameter("@Description", System.Data.SqlDbType.NVarChar, 500) { Value = (object?)request.Description ?? DBNull.Value });
                cmd.Parameters.Add(new SqlParameter("@UpdatedAt", System.Data.SqlDbType.DateTime2) { Value = DateTime.UtcNow });
            });

            return (true, "Setting saved.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error saving setting '{Key}'", key);
            return (false, "Failed to save setting.");
        }
    }

    public async Task<List<SettingResponse>> GetAllSettingsAsync()
    {
        return await _db.ExecuteReaderAsync("sp_GetAllSettings",
            cmd => { },
            MapSettingResponse);
    }

    public async Task<(bool Success, string Message)> DeleteSettingAsync(string key)
    {
        try
        {
            int affected = await _db.ExecuteNonQueryAsync("sp_DeleteSetting", cmd =>
            {
                cmd.Parameters.Add(new SqlParameter("@Key", System.Data.SqlDbType.NVarChar, 200) { Value = key });
            });

            return affected > 0 ? (true, "Setting deleted.") : (false, "Setting not found.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting setting '{Key}'", key);
            return (false, "Delete failed.");
        }
    }

    private static SettingResponse MapSettingResponse(SqlDataReader reader) => new()
    {
        Key = DatabaseHelper.GetStringOrEmpty(reader, "Key"),
        Value = DatabaseHelper.GetStringOrEmpty(reader, "Value"),
        Description = DatabaseHelper.GetString(reader, "Description"),
        UpdatedAt = DatabaseHelper.GetNullableDateTime(reader, "UpdatedAt")
    };
}
