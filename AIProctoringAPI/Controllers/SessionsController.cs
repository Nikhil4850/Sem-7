using AIProctoringAPI.DTOs;
using AIProctoringAPI.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AIProctoringAPI.Controllers;

[ApiController]
[Route("api/sessions")]
[Produces("application/json")]
[Authorize]
public class SessionsController : ControllerBase
{
    private readonly ISessionService _sessions;
    private readonly IExamService _exams;

    public SessionsController(ISessionService sessions, IExamService exams)
    {
        _sessions = sessions;
        _exams = exams;
    }

    /// <summary>Start a new exam session for the authenticated student.</summary>
    [HttpPost("start")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Start([FromBody] StartSessionRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        int studentId = GetUserId();
        if (studentId == 0)
            return Unauthorized(new { message = "Invalid token — userId claim missing." });

        var (success, message, sessionId) = await _sessions.StartSessionAsync(request.ExamId, studentId);

        if (!success || sessionId is null)
            return BadRequest(new { message = message ?? "Failed to start session." });

        var exam = await _exams.GetExamByIdAsync(request.ExamId);

        return StatusCode(StatusCodes.Status201Created, new StartSessionResponse
        {
            Message         = message ?? "Session started.",
            SessionId       = sessionId.Value,
            ExamId          = request.ExamId,
            ExamTitle       = exam?.Title ?? "",
            DurationMinutes = exam?.DurationMinutes ?? 60,
            TotalMarks      = exam?.TotalMarks ?? 0,
            Status          = "active"
        });
    }

    /// <summary>Get a session by ID. Students can only see their own sessions.</summary>
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(SessionResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(int id)
    {
        var session = await _sessions.GetSessionAsync(id);
        if (session is null)
            return NotFound(new { message = $"Session {id} not found." });

        // Students can only access their own sessions
        if (!User.IsInRole("administrator") && session.StudentId != GetUserId())
            return Forbid();

        return Ok(session);
    }

    /// <summary>Get all sessions for a specific student.</summary>
    [HttpGet("student/{studentId:int}")]
    [ProducesResponseType(typeof(List<SessionResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetStudentSessions(int studentId)
    {
        // Students can only see their own sessions; admins can see any
        if (!User.IsInRole("administrator") && studentId != GetUserId())
            return Forbid();

        return Ok(await _sessions.GetStudentSessionsAsync(studentId));
    }

    /// <summary>Get all sessions for the currently authenticated student.</summary>
    [HttpGet("my")]
    [ProducesResponseType(typeof(List<SessionResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMySessions()
    {
        int studentId = GetUserId();
        return Ok(await _sessions.GetStudentSessionsAsync(studentId));
    }

    /// <summary>Get all active sessions. Admin only.</summary>
    [HttpGet("active")]
    [Authorize(Roles = "administrator,admin,teacher")]
    [ProducesResponseType(typeof(List<SessionResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetActive() =>
        Ok(await _sessions.GetActiveSessionsAsync());

    /// <summary>Send a heartbeat for an active session.</summary>
    [HttpPost("{id:int}/heartbeat")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Heartbeat(int id, [FromBody] HeartbeatRequest request)
    {
        int studentId = GetUserId();
        var (success, message) = await _sessions.UpdateHeartbeatAsync(id, studentId);

        if (!success)
            return message.Contains("not found") || message.Contains("not owned")
                ? NotFound(new { message })
                : BadRequest(new { message });

        return Ok(new { message, timestamp = DateTime.UtcNow });
    }

    /// <summary>Submit an exam session.</summary>
    [HttpPost("{id:int}/submit")]
    [ProducesResponseType(typeof(SubmitExamResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> Submit(int id, [FromBody] SubmitExamRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        int studentId = GetUserId();
        var (success, message, result) = await _sessions.SubmitExamAsync(id, studentId, request);

        if (!success)
        {
            if (message.Contains("not own") || message.Contains("forbidden"))
                return Forbid();
            return BadRequest(new { message });
        }

        return Ok(result);
    }

    private int GetUserId()
    {
        var claim = User.FindFirst("userId")?.Value;
        return int.TryParse(claim, out int id) ? id : 0;
    }
}

