using AIProctoringAPI.DTOs;
using AIProctoringAPI.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AIProctoringAPI.Controllers;

[ApiController]
[Route("api/proctoring")]
[Produces("application/json")]
[Authorize]
public class ProctoringController : ControllerBase
{
    private readonly IProctoringService _proctoring;

    public ProctoringController(IProctoringService proctoring) => _proctoring = proctoring;

    /// <summary>Record a proctoring event log.</summary>
    [HttpPost("logs")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> AddLog([FromBody] AddLogRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        int userId = GetUserId();
        var (success, message, logId) = await _proctoring.AddLogAsync(request, userId);

        if (!success)
            return BadRequest(new { message });

        return StatusCode(StatusCodes.Status201Created, new { message, logId });
    }

    /// <summary>Get all proctoring logs for a session.</summary>
    [HttpGet("sessions/{sessionId:int}/logs")]
    [ProducesResponseType(typeof(List<LogResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetSessionLogs(int sessionId) =>
        Ok(await _proctoring.GetSessionLogsAsync(sessionId));

    /// <summary>Get all proctoring logs for a user.</summary>
    [HttpGet("users/{userId:int}/logs")]
    [ProducesResponseType(typeof(List<LogResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetUserLogs(int userId)
    {
        // Students can only view their own logs
        if (!User.IsInRole("administrator") && !User.IsInRole("admin") && !User.IsInRole("teacher") && userId != GetUserId())
            return Forbid();

        return Ok(await _proctoring.GetUserLogsAsync(userId));
    }

    /// <summary>Get all proctoring logs. Admin/Teacher only.</summary>
    [HttpGet("logs")]
    [Authorize(Roles = "administrator,admin,teacher")]
    [ProducesResponseType(typeof(List<LogResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll() =>
        Ok(await _proctoring.GetAllLogsAsync());

    /// <summary>Save a proctoring verdict. Admin/Teacher only.</summary>
    [HttpPost("verdicts")]
    [Authorize(Roles = "administrator,admin,teacher")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> SaveVerdict([FromBody] SaveVerdictRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var (success, message, verdictId) = await _proctoring.SaveVerdictAsync(request);
        if (!success)
            return BadRequest(new { message });

        return StatusCode(StatusCodes.Status201Created, new { message, verdictId });
    }

    /// <summary>Get all verdicts for a session.</summary>
    [HttpGet("sessions/{sessionId:int}/verdicts")]
    [ProducesResponseType(typeof(List<VerdictResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetVerdicts(int sessionId) =>
        Ok(await _proctoring.GetSessionVerdictsAsync(sessionId));

    private int GetUserId()
    {
        var claim = User.FindFirst("userId")?.Value;
        return int.TryParse(claim, out int id) ? id : 0;
    }
}

