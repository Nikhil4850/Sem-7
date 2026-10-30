using System.ComponentModel.DataAnnotations;

namespace AIProctoringAPI.DTOs;

public class SaveSettingRequest
{
    [Required, StringLength(200)]
    public string Value { get; set; } = string.Empty;

    public string? Description { get; set; }
}

public class SettingResponse
{
    public string Key { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
