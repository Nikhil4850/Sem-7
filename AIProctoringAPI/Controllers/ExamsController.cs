using AIProctoringAPI.DTOs;
using AIProctoringAPI.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AIProctoringAPI.Controllers;

[ApiController]
[Route("api/exams")]
[Produces("application/json")]
[Authorize]
public class ExamsController : ControllerBase
{
    private readonly IExamService _exams;

    public ExamsController(IExamService exams) => _exams = exams;

    /// <summary>Create a new exam. Admin only.</summary>
    [HttpPost]
    [Authorize(Roles = "administrator,admin,teacher")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create([FromBody] CreateExamRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        int userId = GetUserId();
        var (success, message, examId) = await _exams.CreateExamAsync(request, userId);

        if (!success)
            return BadRequest(new { message });

        return StatusCode(StatusCodes.Status201Created, new { message, examId });
    }

    /// <summary>Get all exams.</summary>
    [HttpGet]
    [ProducesResponseType(typeof(List<ExamResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll() => Ok(await _exams.GetAllExamsAsync());

    /// <summary>Get a specific exam by ID.</summary>
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(ExamResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(int id)
    {
        var exam = await _exams.GetExamByIdAsync(id);
        return exam is null ? NotFound(new { message = $"Exam {id} not found." }) : Ok(exam);
    }

    /// <summary>Update an exam. Admin only.</summary>
    [HttpPut("{id:int}")]
    [Authorize(Roles = "administrator,admin,teacher")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateExamRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var (success, message) = await _exams.UpdateExamAsync(id, request);

        if (!success)
            return message.Contains("not found") ? NotFound(new { message }) : BadRequest(new { message });

        return Ok(new { message });
    }

    /// <summary>Delete an exam. Admin only.</summary>
    [HttpDelete("{id:int}")]
    [Authorize(Roles = "administrator,admin,teacher")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(int id)
    {
        var (success, message) = await _exams.DeleteExamAsync(id);
        if (!success)
            return message.Contains("not found") ? NotFound(new { message }) : BadRequest(new { message });

        return Ok(new { message });
    }

    private int GetUserId()
    {
        var claim = User.FindFirst("userId")?.Value;
        return int.TryParse(claim, out int id) ? id : 0;
    }
}

