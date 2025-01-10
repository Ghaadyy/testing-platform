using System.Security.Claims;

namespace RestrictedNL.Models.Token;

public interface ITokenRepository
{
    int? GetId(ClaimsPrincipal claim);
    ClaimsPrincipal? ParseToken(string token);
}
