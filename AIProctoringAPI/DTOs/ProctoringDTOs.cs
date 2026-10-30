using System.ComponentModel.DataAnnotations;

namespace AIProctoringAPI.DTOs;

public class AddLogRequest
{
    [Required]
    public int SessionId { get; set; }

    [Required, StringLength(100)]
    public string EventType { get; set; } = string.Empty;

    public string? EventDetails { get; set; }

    /// <summary>
    /// Server-side timestamp is used; client value is ignored.
    /// </summary>
    public DateTime? Timestamp { get; set; }
}

public class LogResponse
{
    public int LogId { get; set; }
    public int SessionId { get; set; }
    public int UserId { get; set; }
    public string EventType { get; set; } = string.Empty;
    public string? EventDetails { get; set; }
    public DateTime Timestamp { get; set; }
}

public class SaveVerdictRequest
{
    [Required]
    public int SessionId { get; set; }

    [Required, StringLength(100)]
    public string Verdict { get; set; } = string.Empty;

    [Range(0.0, 1.0)]
    public decimal? Confidence { get; set; }

    public string? Details { get; set; }
}

public class VerdictResponse
{
    public int VerdictId { get; set; }
    public int SessionId { get; set; }
    public string Verdict { get; set; } = string.Empty;
    public decimal? Confidence { get; set; }
    public string? Details { get; set; }
    public DateTime CreatedAt { get; set; }
}
