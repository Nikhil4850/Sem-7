using AIProctoringAPI.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;

namespace AIProctoringAPI.Controllers;

[ApiController]
[Route("api/profile")]
[Produces("application/json")]
[Authorize]
public class ProfileController : ControllerBase
{
    private readonly DatabaseHelper _db;

    public ProfileController(DatabaseHelper db) => _db = db;

    /// <summary>Get the authenticated user's full profile.</summary>
    [HttpGet]
    public async Task<IActionResult> GetProfile()
    {
        int userId = GetUserId();
        var profile = await _db.ExecuteSingleAsync("sp_GetMyProfile", cmd =>
        {
            cmd.Parameters.Add(new SqlParameter("@UserId", System.Data.SqlDbType.Int) { Value = userId });
        }, reader => new
        {
            UserId      = reader.GetInt32(reader.GetOrdinal("UserId")),
            Username    = DatabaseHelper.GetStringOrEmpty(reader, "Username"),
            Email       = DatabaseHelper.GetStringOrEmpty(reader, "Email"),
            FullName    = DatabaseHelper.GetString(reader, "FullName"),
            Role        = DatabaseHelper.GetStringOrEmpty(reader, "Role"),
            Department  = DatabaseHelper.GetString(reader, "Department"),
            YearOfStudy = DatabaseHelper.GetString(reader, "YearOfStudy"),
            Phone       = DatabaseHelper.GetString(reader, "Phone"),
            ProfilePhoto= DatabaseHelper.GetString(reader, "ProfilePhoto"),
            CreatedAt   = reader.GetDateTime(reader.GetOrdinal("CreatedAt"))
        });

        if (profile is null) return NotFound(new { message = "Profile not found." });
        return Ok(profile);
    }

    /// <summary>Update profile fields (name, email, department, year, phone).</summary>
    [HttpPut]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest request)
    {
        int userId = GetUserId();
        int affected = await _db.ExecuteNonQueryAsync("sp_UpdateProfile", cmd =>
        {
            cmd.Parameters.Add(new SqlParameter("@UserId",      System.Data.SqlDbType.Int)          { Value = userId });
            cmd.Parameters.Add(new SqlParameter("@FullName",    System.Data.SqlDbType.NVarChar, 200) { Value = (object?)request.FullName    ?? DBNull.Value });
            cmd.Parameters.Add(new SqlParameter("@Email",       System.Data.SqlDbType.NVarChar, 255) { Value = (object?)request.Email       ?? DBNull.Value });
            cmd.Parameters.Add(new SqlParameter("@Department",  System.Data.SqlDbType.NVarChar, 100) { Value = (object?)request.Department  ?? DBNull.Value });
            cmd.Parameters.Add(new SqlParameter("@YearOfStudy", System.Data.SqlDbType.NVarChar, 50)  { Value = (object?)request.YearOfStudy ?? DBNull.Value });
            cmd.Parameters.Add(new SqlParameter("@Phone",       System.Data.SqlDbType.NVarChar, 20)  { Value = (object?)request.Phone       ?? DBNull.Value });
        });

        return Ok(new { message = "Profile updated.", rowsAffected = affected });
    }

    /// <summary>Upload profile photo as Base64. Stored in DB as data URL.</summary>
    [HttpPost("photo")]
    [RequestSizeLimit(5 * 1024 * 1024)] // 5 MB
    public async Task<IActionResult> UploadPhoto([FromBody] UploadPhotoRequest request)
    {
        if (string.IsNullOrEmpty(request.PhotoBase64))
            return BadRequest(new { message = "No photo data provided." });

        // Validate it's a valid base64 image
        if (!request.PhotoBase64.StartsWith("data:image/"))
            return BadRequest(new { message = "Invalid image format. Must be a base64 data URL." });

        int userId = GetUserId();
        await _db.ExecuteNonQueryAsync("sp_UpdateProfilePhoto", cmd =>
        {
            cmd.Parameters.Add(new SqlParameter("@UserId",       System.Data.SqlDbType.Int)          { Value = userId });
            cmd.Parameters.Add(new SqlParameter("@ProfilePhoto", System.Data.SqlDbType.NVarChar, -1) { Value = request.PhotoBase64 });
        });

        return Ok(new { message = "Photo updated.", photoUrl = request.PhotoBase64 });
    }

    private int GetUserId()
    {
        var claim = User.FindFirst("userId")?.Value;
        return int.TryParse(claim, out int id) ? id : 0;
    }
}

public class UpdateProfileRequest
{
    public string? FullName    { get; set; }
    public string? Email       { get; set; }
    public string? Department  { get; set; }
    public string? YearOfStudy { get; set; }
    public string? Phone       { get; set; }
}

public class UploadPhotoRequest
{
    public string? PhotoBase64 { get; set; }
}

