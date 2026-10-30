using AIProctoringAPI.DTOs;

namespace AIProctoringAPI.Interfaces;

public interface IAuthService
{
    Task<(bool Success, string Message)> RegisterAsync(RegisterRequest request);
    Task<LoginResponse?> LoginAsync(LoginRequest request);
    Task<List<UserResponse>> GetAllUsersAsync();
    Task<UserResponse?> GetUserByUsernameAsync(string username);
    Task<(bool Success, string Message)> UpdateUserRoleAsync(string username, string role, string requestingUserRole);
}
