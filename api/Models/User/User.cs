using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RestrictedNL.Models.User;

[Table("users")]
public class User
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Column("first_name")]
    [MinLength(3)]
    [Required]
    public required string FirstName { get; set; }

    [Column("last_name")]
    [MinLength(3)]
    [Required]
    public required string LastName { get; set; }

    [Column("email")]
    [EmailAddress]
    [Required]
    public required string Email { get; set; }

    [Column("user_name")]
    [MinLength(3)]
    [Required]
    public required string UserName { get; set; }

    [Column("dob")]
    public DateOnly? BirthDate { get; set; }

    [Column("password")]
    [MinLength(6)]
    [Required]
    public required string Password { get; set; }
}