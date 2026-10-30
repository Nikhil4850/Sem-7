using System.ComponentModel.DataAnnotations;

namespace AIProctoringAPI.DTOs;

public class CreateExamRequest
{
    [Required, StringLength(500)]
    public string Title { get; set; } = string.Empty;

    public string? Description { get; set; }

    [Range(1, 600)]
    public int DurationMinutes { get; set; } = 60;

    [Range(0, int.MaxValue)]
    public int TotalMarks { get; set; }

    public DateTime? StartTime { get; set; }
    public DateTime? EndTime { get; set; }
    public bool IsActive { get; set; } = true;
}

public class UpdateExamRequest
{
    [StringLength(500)]
    public string? Title { get; set; }

    public string? Description { get; set; }

    [Range(1, 600)]
    public int? DurationMinutes { get; set; }

    [Range(0, int.MaxValue)]
    public int? TotalMarks { get; set; }

    public DateTime? StartTime { get; set; }
    public DateTime? EndTime { get; set; }
    public bool? IsActive { get; set; }
}

public class ExamResponse
{
    public int ExamId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int DurationMinutes { get; set; }
    public int TotalMarks { get; set; }
    public DateTime? StartTime { get; set; }
    public DateTime? EndTime { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public string? CreatedBy { get; set; }
}
