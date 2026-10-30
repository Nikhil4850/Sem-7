using AIProctoringAPI.DTOs;

namespace AIProctoringAPI.Interfaces;

public interface IIdentityService
{
    Task<(bool Success, string Message)> SaveVerificationAsync(SaveIdentityVerificationRequest request);
    Task<IdentityVerificationResponse?> GetVerificationAsync(int sessionId);
}
