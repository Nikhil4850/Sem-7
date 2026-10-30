using System.Security.Claims;
using AIProctoringAPI.DTOs;
using AIProctoringAPI.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AIProctoringAPI.Controllers;

[ApiController]
[Route("api/questions")]
[Produces("application/json")]
[Authorize]
public class QuestionsController : ControllerBase
{
    private readonly IQuestionService _questions;

    public QuestionsController(IQuestionService questions) => _questions = questions;

    /// <summary>Add a question to an exam. Admin only.</summary>
    [HttpPost]
    [Authorize(Roles = "administrator")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Add([FromBody] AddQuestionRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var (success, message, questionId) = await _questions.AddQuestionAsync(request);
        if (!success)
            return BadRequest(new { message });

        return StatusCode(StatusCodes.Status201Created, new { message, questionId });
    }

    /// <summary>
    /// Get all questions, optionally filtered by examId.
    /// Admins get full data including correct answers.
    /// Students get questions without correct answers.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll([FromQuery] int? examId = null)
    {
        bool isAdmin = User.IsInRole("administrator");
        if (isAdmin)
        {
            var all = await _questions.GetAllQuestionsAsync();
            var filtered = examId.HasValue ? all.Where(q => q.ExamId == examId.Value).ToList() : all;
            return Ok(filtered);
        }

        var questions = await _questions.GetAllQuestionsAsync();
        var studentView = questions
            .Where(q => !examId.HasValue || q.ExamId == examId.Value)
            .Select(q => new QuestionStudentResponse
            {
                QuestionId   = q.QuestionId,
                ExamId       = q.ExamId,
                QuestionText = q.QuestionText,
                QuestionType = q.QuestionType,
                OptionA      = q.OptionA,
                OptionB      = q.OptionB,
                OptionC      = q.OptionC,
                OptionD      = q.OptionD,
                Marks        = q.Marks,
                OrderNumber  = q.OrderNumber
            });
        return Ok(studentView);
    }

    /// <summary>Get a specific question. Correct answer hidden from students.</summary>
    [HttpGet("{id:int}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(int id)
    {
        var question = await _questions.GetQuestionByIdAsync(id);
        if (question is null)
            return NotFound(new { message = $"Question {id} not found." });

        if (User.IsInRole("administrator"))
            return Ok(question);

        return Ok(new QuestionStudentResponse
        {
            QuestionId = question.QuestionId,
            ExamId = question.ExamId,
            QuestionText = question.QuestionText,
            QuestionType = question.QuestionType,
            OptionA = question.OptionA,
            OptionB = question.OptionB,
            OptionC = question.OptionC,
            OptionD = question.OptionD,
            Marks = question.Marks,
            OrderNumber = question.OrderNumber
        });
    }

    /// <summary>Update a question. Admin only.</summary>
    [HttpPut("{id:int}")]
    [Authorize(Roles = "administrator")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateQuestionRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var (success, message) = await _questions.UpdateQuestionAsync(id, request);
        if (!success)
            return message.Contains("not found") ? NotFound(new { message }) : BadRequest(new { message });

        return Ok(new { message });
    }

    /// <summary>Delete a question. Admin only.</summary>
    [HttpDelete("{id:int}")]
    [Authorize(Roles = "administrator")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(int id)
    {
        var (success, message) = await _questions.DeleteQuestionAsync(id);
        if (!success)
            return message.Contains("not found") ? NotFound(new { message }) : BadRequest(new { message });

        return Ok(new { message });
    }
}
