using AIProctoringAPI.Data;
using Microsoft.AspNetCore.Mvc;

namespace AIProctoringAPI.Controllers;

[ApiController]
[Route("api/health")]
[Produces("application/json")]
public class HealthController : ControllerBase
{
    private readonly DatabaseHelper _db;

    public HealthController(DatabaseHelper db) => _db = db;

    /// <summary>Check API and database health.</summary>
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status503ServiceUnavailable)]
    public async Task<IActionResult> Check()
    {
        bool dbOk = await _db.TestConnectionAsync();

        var response = new
        {
            api = "healthy",
            database = dbOk ? "connected" : "unreachable",
            timestamp = DateTime.UtcNow
        };

        return dbOk ? Ok(response) : StatusCode(StatusCodes.Status503ServiceUnavailable, response);
    }
}
