namespace AIProctoringAPI.Interfaces;

public interface IJwtService
{
    string GenerateToken(int userId, string username, string email, string role);
}
