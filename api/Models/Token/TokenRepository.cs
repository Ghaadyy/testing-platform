using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;

namespace RestrictedNL.Models.Token;

public class TokenRepository(IConfiguration configuration) : ITokenRepository
{
    public int? GetId(ClaimsPrincipal claim)
    {
        var nameIdentifier = claim.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (nameIdentifier is not null && int.TryParse(nameIdentifier, out int userId))
        {
            return userId;
        }

        return null;
    }

    public ClaimsPrincipal? ParseToken(string token)
    {
        var tokenHandler = new JwtSecurityTokenHandler();

        try
        {
            // Configure the validation parameters
            var validationParameters = new TokenValidationParameters
            {
                ValidateIssuer = false,
                ValidateAudience = false,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(configuration["JWT:Secret"]!))
            };

            // Validate the token and extract claims
            var principal = tokenHandler.ValidateToken(token, validationParameters, out SecurityToken validatedToken);

            // Ensure the token is a valid JWT
            if (validatedToken is JwtSecurityToken jwtToken)
            {
                return principal; // The ClaimsPrincipal contains user claims
            }

            return null; // Invalid token format
        }
        catch (Exception ex)
        {
            // Handle validation errors (e.g., expired token, invalid signature)
            Console.WriteLine($"Token validation failed: {ex.Message}");
            return null;
        }
    }
}
