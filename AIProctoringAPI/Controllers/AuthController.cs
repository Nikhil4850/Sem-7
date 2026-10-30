using System.Security.Claims;
using AIProctoringAPI.DTOs;
using AIProctoringAPI.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AIProctoringAPI.Controllers;

[ApiController]
[Route("api/auth")]
[Produces("application/json")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _auth;

    public AuthController(IAuthService auth) => _auth = auth;

    /// <summary>Register a new user account.</summary>
    [HttpPost("register")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var (success, message) = await _auth.RegisterAsync(request);

        if (!success)
        {
            if (message.Contains("already exists"))
                return Conflict(new { message });
            return BadRequest(new { message });
        }

        return StatusCode(StatusCodes.Status201Created, new { message });
    }

    /// <summary>Log in and receive a JWT token.</summary>
    [HttpPost("login")]
    [ProducesResponseType(typeof(LoginResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var result = await _auth.LoginAsync(request);
        if (result is null)
            return Unauthorized(new { message = "Invalid username or password." });

        return Ok(result);
    }
}

[ApiController]
[Route("api/users")]
[Produces("application/json")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly IAuthService _auth;

    public UsersController(IAuthService auth) => _auth = auth;

    /// <summary>Get all registered users. Admin only.</summary>
    [HttpGet]
    [Authorize(Roles = "administrator,admin")]
    [ProducesResponseType(typeof(List<UserResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll() => Ok(await _auth.GetAllUsersAsync());

    /// <summary>Get a user by username. Admin only.</summary>
    [HttpGet("{username}")]
    [Authorize(Roles = "administrator,admin")]
    [ProducesResponseType(typeof(UserResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetByUsername(string username)
    {
        var user = await _auth.GetUserByUsernameAsync(username);
        return user is null ? NotFound(new { message = $"User '{username}' not found." }) : Ok(user);
    }

    /// <summary>Update a user's role. Admin only.</summary>
    [HttpPut("{username}/role")]
    [Authorize(Roles = "administrator,admin")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateRole(string username, [FromBody] UpdateRoleRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var requestingRole = User.FindFirst(ClaimTypes.Role)?.Value
                          ?? User.FindFirst("role")?.Value
                          ?? string.Empty;
        var (success, message) = await _auth.UpdateUserRoleAsync(username, request.Role, requestingRole);

        if (!success)
        {
            if (message.Contains("not found"))
                return NotFound(new { message });
            return BadRequest(new { message });
        }

        return Ok(new { message });
    }
}

