using System.ComponentModel.DataAnnotations;

namespace TestingPlatform.Models.User;

public class LoginModel
{
    [Required]
    [EmailAddress]
    public required string Email { get; set; }

    [Required]
    [MinLength(6)]
    public required string Password { get; set; }
}