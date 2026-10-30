using System.ComponentModel.DataAnnotations;

namespace AIProctoringAPI.DTOs;

public class SaveIdentityVerificationRequest
{
    [Required]
    public int SessionId { get; set; }

    [Required]
    public int StudentId { get; set; }

    /// <summary>Base64-encoded image data or file path reference.</summary>
    public string? ImageData { get; set; }

    [StringLength(50)]
    public string? VerificationStatus { get; set; }

    public string? Notes { get; set; }
}

public class IdentityVerificationResponse
{
    public int VerificationId { get; set; }
    public int SessionId { get; set; }
    public int StudentId { get; set; }
    public string? VerificationStatus { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
    // ImageData intentionally omitted from response for security
}
