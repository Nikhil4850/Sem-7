using AIProctoringAPI.DTOs;

namespace AIProctoringAPI.Interfaces;

public interface ISettingsService
{
    Task<SettingResponse?> GetSettingAsync(string key);
    Task<(bool Success, string Message)> SaveSettingAsync(string key, SaveSettingRequest request);
    Task<List<SettingResponse>> GetAllSettingsAsync();
    Task<(bool Success, string Message)> DeleteSettingAsync(string key);
}
