using AIProctoringAPI.DTOs;
using AIProctoringAPI.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AIProctoringAPI.Controllers;

[ApiController]
[Route("api/certificates")]
[Produces("application/json")]
[Authorize]
public class CertificatesController : ControllerBase
{
    private readonly ICertificateService _certificates;

    public CertificatesController(ICertificateService certificates) => _certificates = certificates;

    /// <summary>Issue a certificate. Admin only.</summary>
    [HttpPost("issue")]
    [Authorize(Roles = "administrator")]
    [ProducesResponseType(typeof(CertificateResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Issue([FromBody] IssueCertificateRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var (success, message, certificate) = await _certificates.IssueCertificateAsync(request);
        if (!success)
            return BadRequest(new { message });

        return StatusCode(StatusCodes.Status201Created, certificate);
    }

    /// <summary>Verify a certificate by hash. Public endpoint.</summary>
    [HttpGet("verify/{hash}")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(CertificateResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Verify(string hash)
    {
        if (string.IsNullOrWhiteSpace(hash) || hash.Length > 128)
            return BadRequest(new { message = "Invalid hash." });

        var cert = await _certificates.GetCertificateByHashAsync(hash);
        return cert is null ? NotFound(new { message = "Certificate not found or invalid hash." }) : Ok(cert);
    }

    /// <summary>Get all certificates for a student.</summary>
    [HttpGet("student/{studentId:int}")]
    [ProducesResponseType(typeof(List<CertificateResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetStudentCertificates(int studentId)
    {
        // Students can only see their own certificates
        if (!User.IsInRole("administrator") && studentId != GetUserId())
            return Forbid();

        return Ok(await _certificates.GetStudentCertificatesAsync(studentId));
    }

    private int GetUserId()
    {
        var claim = User.FindFirst("userId")?.Value;
        return int.TryParse(claim, out int id) ? id : 0;
    }
}
