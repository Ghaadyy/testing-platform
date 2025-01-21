using System.Security.Claims;
using RestrictedNL.Models.User;

namespace RestrictedNL.Services.Token;

public interface ITokenService
{
    Guid? GetId(ClaimsPrincipal claim);
    string GenerateToken(User user);
    ClaimsPrincipal? ParseToken(string token);
}
