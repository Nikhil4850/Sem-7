using AIProctoringAPI.Data;
using AIProctoringAPI.DTOs;
using AIProctoringAPI.Interfaces;
using Microsoft.Data.SqlClient;

namespace AIProctoringAPI.Services;

public class CertificateService : ICertificateService
{
    private readonly DatabaseHelper _db;
    private readonly ILogger<CertificateService> _logger;

    public CertificateService(DatabaseHelper db, ILogger<CertificateService> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task<(bool Success, string Message, CertificateResponse? Certificate)> IssueCertificateAsync(
        IssueCertificateRequest request)
    {
        try
        {
            // Generate a tamper-evident hash from student + exam + issued timestamp
            string rawHash = $"{request.StudentId}:{request.ExamId}:{DateTime.UtcNow:O}:{Guid.NewGuid()}";
            string certificateHash = Convert.ToHexString(
                System.Security.Cryptography.SHA256.HashData(
                    System.Text.Encoding.UTF8.GetBytes(rawHash)));

            var result = await _db.ExecuteScalarAsync("sp_IssueCertificate", cmd =>
            {
                cmd.Parameters.Add(new SqlParameter("@StudentId", System.Data.SqlDbType.Int) { Value = request.StudentId });
                cmd.Parameters.Add(new SqlParameter("@ExamId", System.Data.SqlDbType.Int) { Value = request.ExamId });
                cmd.Parameters.Add(new SqlParameter("@SessionId", System.Data.SqlDbType.Int) { Value = (object?)request.SessionId ?? DBNull.Value });
                cmd.Parameters.Add(new SqlParameter("@CertificateHash", System.Data.SqlDbType.NVarChar, 128) { Value = certificateHash });
                cmd.Parameters.Add(new SqlParameter("@IssuedAt", System.Data.SqlDbType.DateTime2) { Value = DateTime.UtcNow });
            });

            if (result is null)
                return (false, "Certificate could not be issued.", null);

            var certificate = await GetCertificateByHashAsync(certificateHash);
            return (true, "Certificate issued.", certificate);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error issuing certificate for student {StudentId}", request.StudentId);
            return (false, "Certificate issuance failed.", null);
        }
    }

    public async Task<CertificateResponse?> GetCertificateByHashAsync(string hash)
    {
        return await _db.ExecuteSingleAsync("sp_GetCertificateByHash", cmd =>
        {
            cmd.Parameters.Add(new SqlParameter("@CertificateHash", System.Data.SqlDbType.NVarChar, 128) { Value = hash });
        }, MapCertificateResponse);
    }

    public async Task<List<CertificateResponse>> GetStudentCertificatesAsync(int studentId)
    {
        return await _db.ExecuteReaderAsync("sp_GetStudentCertificates", cmd =>
        {
            cmd.Parameters.Add(new SqlParameter("@StudentId", System.Data.SqlDbType.Int) { Value = studentId });
        }, MapCertificateResponse);
    }

    private static CertificateResponse MapCertificateResponse(SqlDataReader reader) => new()
    {
        CertificateId = reader.GetInt32(reader.GetOrdinal("CertificateId")),
        StudentId = reader.GetInt32(reader.GetOrdinal("StudentId")),
        StudentName = DatabaseHelper.GetStringOrEmpty(reader, "StudentName"),
        ExamId = reader.GetInt32(reader.GetOrdinal("ExamId")),
        ExamTitle = DatabaseHelper.GetStringOrEmpty(reader, "ExamTitle"),
        CertificateHash = DatabaseHelper.GetStringOrEmpty(reader, "CertificateHash"),
        Score = DatabaseHelper.GetNullableDecimal(reader, "Score"),
        IssuedAt = reader.GetDateTime(reader.GetOrdinal("IssuedAt"))
    };
}
