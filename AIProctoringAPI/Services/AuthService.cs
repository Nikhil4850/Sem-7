using AIProctoringAPI.Data;
using AIProctoringAPI.DTOs;
using AIProctoringAPI.Interfaces;
using Microsoft.Data.SqlClient;

namespace AIProctoringAPI.Services;

public class AuthService : IAuthService
{
    private readonly DatabaseHelper _db;
    private readonly IJwtService _jwt;
    private readonly IConfiguration _config;
    private readonly ILogger<AuthService> _logger;

    // Roles permitted to be assigned by an administrator
    private static readonly HashSet<string> AllowedRoles = new(StringComparer.OrdinalIgnoreCase)
        { "student", "administrator" };

    public AuthService(DatabaseHelper db, IJwtService jwt, IConfiguration config, ILogger<AuthService> logger)
    {
        _db = db;
        _jwt = jwt;
        _config = config;
        _logger = logger;
    }

    public async Task<(bool Success, string Message)> RegisterAsync(RegisterRequest request)
    {
        // Hash the password before sending to database
        string passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password, workFactor: 12);

        try
        {
            await _db.ExecuteNonQueryAsync("sp_RegisterUser", cmd =>
            {
                cmd.Parameters.Add(new SqlParameter("@Username", System.Data.SqlDbType.NVarChar, 100) { Value = request.Username });
                cmd.Parameters.Add(new SqlParameter("@Email", System.Data.SqlDbType.NVarChar, 255) { Value = request.Email });
                cmd.Parameters.Add(new SqlParameter("@PasswordHash", System.Data.SqlDbType.NVarChar, 500) { Value = passwordHash });
                cmd.Parameters.Add(new SqlParameter("@FullName", System.Data.SqlDbType.NVarChar, 200) { Value = (object?)request.FullName ?? DBNull.Value });
            });
            return (true, "User registered successfully.");
        }
        catch (SqlException ex) when (ex.Number == 2627 || ex.Number == 2601)
        {
            return (false, "Username or email already exists.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error registering user {Username}", request.Username);
            return (false, "Registration failed due to a server error.");
        }
    }

    public async Task<LoginResponse?> LoginAsync(LoginRequest request)
    {
        try
        {
            // sp_GetUserForLogin returns the user row including PasswordHash for verification
            var row = await _db.ExecuteSingleAsync("sp_GetUserForLogin", cmd =>
            {
                cmd.Parameters.Add(new SqlParameter("@Username", System.Data.SqlDbType.NVarChar, 100) { Value = request.Username });
            },
            reader => new
            {
                UserId = reader.GetInt32(reader.GetOrdinal("UserId")),
                Username = DatabaseHelper.GetStringOrEmpty(reader, "Username"),
                Email = DatabaseHelper.GetStringOrEmpty(reader, "Email"),
                PasswordHash = DatabaseHelper.GetStringOrEmpty(reader, "PasswordHash"),
                Role = DatabaseHelper.GetStringOrEmpty(reader, "Role"),
                FullName = DatabaseHelper.GetString(reader, "FullName")
            });

            if (row is null)
                return null;

            // Verify password — hash never leaves this method
            if (!BCrypt.Net.BCrypt.Verify(request.Password, row.PasswordHash))
                return null;

            var expirationMinutes = _config.GetValue<int>("JwtSettings:ExpirationMinutes", 60);
            var token = _jwt.GenerateToken(row.UserId, row.Username, row.Email, row.Role);

            return new LoginResponse
            {
                Token = token,
                UserId = row.UserId,
                Username = row.Username,
                Email = row.Email,
                Role = row.Role,
                ExpiresAt = DateTime.UtcNow.AddMinutes(expirationMinutes)
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Login error for user {Username}", request.Username);
            return null;
        }
    }

    public async Task<List<UserResponse>> GetAllUsersAsync()
    {
        return await _db.ExecuteReaderAsync("sp_GetAllUsers",
            cmd => { /* no parameters */ },
            MapUserResponse);
    }

    public async Task<UserResponse?> GetUserByUsernameAsync(string username)
    {
        return await _db.ExecuteSingleAsync("sp_GetUserByUsername", cmd =>
        {
            cmd.Parameters.Add(new SqlParameter("@Username", System.Data.SqlDbType.NVarChar, 100) { Value = username });
        }, MapUserResponse);
    }

    public async Task<(bool Success, string Message)> UpdateUserRoleAsync(string username, string role, string requestingUserRole)
    {
        // Only administrators can assign roles; students cannot elevate themselves
        if (!requestingUserRole.Equals("administrator", StringComparison.OrdinalIgnoreCase))
            return (false, "Only administrators can change roles.");

        if (!AllowedRoles.Contains(role))
            return (false, $"Invalid role '{role}'. Allowed values: student, administrator.");

        try
        {
            int affected = await _db.ExecuteNonQueryAsync("sp_UpdateUserRole", cmd =>
            {
                cmd.Parameters.Add(new SqlParameter("@Username", System.Data.SqlDbType.NVarChar, 100) { Value = username });
                cmd.Parameters.Add(new SqlParameter("@Role", System.Data.SqlDbType.NVarChar, 50) { Value = role });
            });

            return affected > 0
                ? (true, "Role updated successfully.")
                : (false, "User not found.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating role for {Username}", username);
            return (false, "Role update failed.");
        }
    }

    private static UserResponse MapUserResponse(SqlDataReader reader) => new()
    {
        UserId = reader.GetInt32(reader.GetOrdinal("UserId")),
        Username = DatabaseHelper.GetStringOrEmpty(reader, "Username"),
        Email = DatabaseHelper.GetStringOrEmpty(reader, "Email"),
        FullName = DatabaseHelper.GetString(reader, "FullName"),
        Role = DatabaseHelper.GetStringOrEmpty(reader, "Role"),
        CreatedAt = reader.GetDateTime(reader.GetOrdinal("CreatedAt"))
    };
}
