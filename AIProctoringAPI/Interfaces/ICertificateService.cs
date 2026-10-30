using AIProctoringAPI.DTOs;

namespace AIProctoringAPI.Interfaces;

public interface ICertificateService
{
    Task<(bool Success, string Message, CertificateResponse? Certificate)> IssueCertificateAsync(IssueCertificateRequest request);
    Task<CertificateResponse?> GetCertificateByHashAsync(string hash);
    Task<List<CertificateResponse>> GetStudentCertificatesAsync(int studentId);
}
