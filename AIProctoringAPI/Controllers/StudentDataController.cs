using AIProctoringAPI.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;

namespace AIProctoringAPI.Controllers;

[ApiController]
[Route("api/admin")]
[Produces("application/json")]
[Authorize(Roles = "administrator,admin,teacher")]
public class StudentDataController : ControllerBase
{
    private readonly DatabaseHelper _db;

    public StudentDataController(DatabaseHelper db) => _db = db;

    /// <summary>Get all exam sessions with student info and violation counts.</summary>
    [HttpGet("sessions")]
    public async Task<IActionResult> GetAllSessions()
    {
        var sessions = await _db.ExecuteReaderAsync("sp_GetAllSessionsWithViolations",
            cmd => { },
            reader => new
            {
                SessionId       = reader.GetInt32(reader.GetOrdinal("SessionId")),
                ExamId          = reader.GetInt32(reader.GetOrdinal("ExamId")),
                ExamTitle       = DatabaseHelper.GetStringOrEmpty(reader, "ExamTitle"),
                StudentId       = reader.GetInt32(reader.GetOrdinal("StudentId")),
                StudentUsername = DatabaseHelper.GetStringOrEmpty(reader, "StudentUsername"),
                StudentName     = DatabaseHelper.GetString(reader, "StudentName"),
                StartTime       = DatabaseHelper.GetNullableDateTime(reader, "StartTime"),
                EndTime         = DatabaseHelper.GetNullableDateTime(reader, "EndTime"),
                Status          = DatabaseHelper.GetStringOrEmpty(reader, "Status"),
                Score           = DatabaseHelper.GetNullableDecimal(reader, "Score"),
                TotalMarks      = DatabaseHelper.GetNullableInt(reader, "TotalMarks"),
                LastHeartbeat   = DatabaseHelper.GetNullableDateTime(reader, "LastHeartbeat"),
                ViolationCount  = reader.GetInt32(reader.GetOrdinal("ViolationCount")),
                Verdict         = DatabaseHelper.GetString(reader, "Verdict"),
            });
        return Ok(sessions);
    }

    /// <summary>Get full profile of a specific student including sessions and violations.</summary>
    [HttpGet("students/{studentId:int}")]
    public async Task<IActionResult> GetStudentProfile(int studentId)
    {
        await using var conn = await _db.CreateConnectionAsync();

        await using var cmd = new SqlCommand("sp_GetStudentFullProfile", conn)
        {
            CommandType = System.Data.CommandType.StoredProcedure
        };
        cmd.Parameters.Add(new SqlParameter("@StudentId", System.Data.SqlDbType.Int) { Value = studentId });

        await using var reader = await cmd.ExecuteReaderAsync();

        // Result set 1: student info
        object? studentInfo = null;
        if (await reader.ReadAsync())
        {
            studentInfo = new
            {
                UserId       = reader.GetInt32(reader.GetOrdinal("UserId")),
                Username     = DatabaseHelper.GetStringOrEmpty(reader, "Username"),
                Email        = DatabaseHelper.GetStringOrEmpty(reader, "Email"),
                FullName     = DatabaseHelper.GetString(reader, "FullName"),
                Department   = DatabaseHelper.GetString(reader, "Department"),
                YearOfStudy  = DatabaseHelper.GetString(reader, "YearOfStudy"),
                Phone        = DatabaseHelper.GetString(reader, "Phone"),
                ProfilePhoto = DatabaseHelper.GetString(reader, "ProfilePhoto"),
                CreatedAt    = reader.GetDateTime(reader.GetOrdinal("CreatedAt")),
            };
        }

        if (studentInfo is null)
            return NotFound(new { message = $"Student {studentId} not found." });

        // Result set 2: sessions
        var sessions = new List<object>();
        if (await reader.NextResultAsync())
        {
            while (await reader.ReadAsync())
            {
                sessions.Add(new
                {
                    SessionId  = reader.GetInt32(reader.GetOrdinal("SessionId")),
                    ExamId     = reader.GetInt32(reader.GetOrdinal("ExamId")),
                    ExamTitle  = DatabaseHelper.GetStringOrEmpty(reader, "ExamTitle"),
                    StartTime  = DatabaseHelper.GetNullableDateTime(reader, "StartTime"),
                    EndTime    = DatabaseHelper.GetNullableDateTime(reader, "EndTime"),
                    Status     = DatabaseHelper.GetStringOrEmpty(reader, "Status"),
                    Score      = DatabaseHelper.GetNullableDecimal(reader, "Score"),
                    TotalMarks = DatabaseHelper.GetNullableInt(reader, "TotalMarks"),
                });
            }
        }

        // Result set 3: violation summary
        var violations = new List<object>();
        if (await reader.NextResultAsync())
        {
            while (await reader.ReadAsync())
            {
                violations.Add(new
                {
                    EventType = DatabaseHelper.GetStringOrEmpty(reader, "EventType"),
                    Count     = reader.GetInt32(reader.GetOrdinal("Count")),
                });
            }
        }

        return Ok(new { Student = studentInfo, Sessions = sessions, Violations = violations });
    }
}

