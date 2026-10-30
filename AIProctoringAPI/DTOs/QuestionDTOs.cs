using System.ComponentModel.DataAnnotations;

namespace AIProctoringAPI.DTOs;

public class AddQuestionRequest
{
    [Required]
    public int ExamId { get; set; }

    [Required, StringLength(2000)]
    public string QuestionText { get; set; } = string.Empty;

    [Required, StringLength(50)]
    public string QuestionType { get; set; } = "MCQ"; // MCQ, TrueFalse, ShortAnswer

    public string? OptionA { get; set; }
    public string? OptionB { get; set; }
    public string? OptionC { get; set; }
    public string? OptionD { get; set; }

    [Required]
    public string CorrectAnswer { get; set; } = string.Empty;

    [Range(0, 1000)]
    public int Marks { get; set; } = 1;

    public int? OrderNumber { get; set; }
}

public class UpdateQuestionRequest
{
    [StringLength(2000)]
    public string? QuestionText { get; set; }

    [StringLength(50)]
    public string? QuestionType { get; set; }

    public string? OptionA { get; set; }
    public string? OptionB { get; set; }
    public string? OptionC { get; set; }
    public string? OptionD { get; set; }
    public string? CorrectAnswer { get; set; }

    [Range(0, 1000)]
    public int? Marks { get; set; }

    public int? OrderNumber { get; set; }
}

/// <summary>Safe response for students — no correct answer.</summary>
public class QuestionStudentResponse
{
    public int QuestionId { get; set; }
    public int ExamId { get; set; }
    public string QuestionText { get; set; } = string.Empty;
    public string QuestionType { get; set; } = string.Empty;
    public string? OptionA { get; set; }
    public string? OptionB { get; set; }
    public string? OptionC { get; set; }
    public string? OptionD { get; set; }
    public int Marks { get; set; }
    public int? OrderNumber { get; set; }
}

/// <summary>Full response for admins — includes correct answer.</summary>
public class QuestionAdminResponse : QuestionStudentResponse
{
    public string CorrectAnswer { get; set; } = string.Empty;
}
