using System.ComponentModel.DataAnnotations;

namespace AIProctoringAPI.DTOs;

public class StartSessionRequest
{
    [Required]
    public int ExamId { get; set; }
}

public class StartSessionResponse
{
    public string Message { get; set; } = string.Empty;
    public int SessionId { get; set; }
    public int ExamId { get; set; }
    public string ExamTitle { get; set; } = string.Empty;
    public int DurationMinutes { get; set; }
    public int TotalMarks { get; set; }
    public string Status { get; set; } = "active";
}

public class SubmitExamRequest
{
    /// <summary>Dictionary of QuestionId -> Answer given by the student.</summary>
    [Required]
    public Dictionary<int, string> Answers { get; set; } = new();
}

public class HeartbeatRequest
{
    public string? Status { get; set; } = "active";
}

public class SessionResponse
{
    public int SessionId { get; set; }
    public int ExamId { get; set; }
    public string ExamTitle { get; set; } = string.Empty;
    public int StudentId { get; set; }
    public string StudentUsername { get; set; } = string.Empty;
    public DateTime StartTime { get; set; }
    public DateTime? EndTime { get; set; }
    public string Status { get; set; } = string.Empty;
    public decimal? Score { get; set; }
    public DateTime? LastHeartbeat { get; set; }
}

public class SubmitExamResponse
{
    public int SessionId { get; set; }
    public decimal Score { get; set; }
    public int TotalMarks { get; set; }
    public DateTime SubmittedAt { get; set; }
    public string Message { get; set; } = string.Empty;
    public List<QuestionAdminResponse> Questions { get; set; } = new();
    public Dictionary<int, string> SubmittedAnswers { get; set; } = new();
}
