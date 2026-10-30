using AIProctoringAPI.DTOs;
using AIProctoringAPI.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AIProctoringAPI.Controllers;

[ApiController]
[Route("api/identity-verification")]
[Produces("application/json")]
[Authorize]
public class IdentityController : ControllerBase
{
    private readonly IIdentityService _identity;

    public IdentityController(IIdentityService identity) => _identity = identity;

    /// <summary>Submit an identity verification record for a session.</summary>
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Save([FromBody] SaveIdentityVerificationRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        // Ensure the student is submitting for themselves
        int requestingUserId = GetUserId();
        if (!User.IsInRole("administrator") && request.StudentId != requestingUserId)
            return Forbid();

        var (success, message) = await _identity.SaveVerificationAsync(request);
        if (!success)
            return BadRequest(new { message });

        return StatusCode(StatusCodes.Status201Created, new { message });
    }

    /// <summary>Get identity verification record for a session. Admin or the owning student.</summary>
    [HttpGet("{sessionId:int}")]
    [ProducesResponseType(typeof(IdentityVerificationResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> Get(int sessionId)
    {
        var record = await _identity.GetVerificationAsync(sessionId);
        if (record is null)
            return NotFound(new { message = $"No verification record for session {sessionId}." });

        // Students can only see their own records
        if (!User.IsInRole("administrator") && record.StudentId != GetUserId())
            return Forbid();

        return Ok(record);
    }

    private int GetUserId()
    {
        var claim = User.FindFirst("userId")?.Value;
        return int.TryParse(claim, out int id) ? id : 0;
    }
}

