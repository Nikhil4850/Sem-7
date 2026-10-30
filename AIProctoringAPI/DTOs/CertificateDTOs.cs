using System.ComponentModel.DataAnnotations;

namespace AIProctoringAPI.DTOs;

public class IssueCertificateRequest
{
    [Required]
    public int StudentId { get; set; }

    [Required]
    public int ExamId { get; set; }

    public int? SessionId { get; set; }
}

public class CertificateResponse
{
    public int CertificateId { get; set; }
    public int StudentId { get; set; }
    public string StudentName { get; set; } = string.Empty;
    public int ExamId { get; set; }
    public string ExamTitle { get; set; } = string.Empty;
    public string CertificateHash { get; set; } = string.Empty;
    public decimal? Score { get; set; }
    public DateTime IssuedAt { get; set; }
}
