using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using RestrictedNL.Models.User;

namespace RestrictedNL.Services.Token;

public class TokenService(IConfiguration configuration) : ITokenService
{
    public Guid? GetId(ClaimsPrincipal claim)
    {
        var nameIdentifier = claim.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (nameIdentifier is not null && Guid.TryParse(nameIdentifier, out Guid userId))
        {
            return userId;
        }

        return null;
    }

    public string GenerateToken(User user)
    {
        List<Claim> claims = [
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString())
        ];

        var jwtToken = new JwtSecurityToken(
            claims: claims,
            notBefore: DateTime.UtcNow,
            expires: DateTime.UtcNow.AddHours(1),
            signingCredentials: new SigningCredentials(
                new SymmetricSecurityKey(
                   Encoding.UTF8.GetBytes(configuration["JWT:Secret"]!)
                ),
                "HS256")
            );

        return new JwtSecurityTokenHandler().WriteToken(jwtToken);
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
