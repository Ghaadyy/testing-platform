using System.Security.Claims;
using TestingPlatform.Models.User;

namespace TestingPlatform.Services.Token;

public interface ITokenService
{
    Guid? GetId(ClaimsPrincipal claim);
    string GenerateToken(User user);
    ClaimsPrincipal? ParseToken(string token);
}
