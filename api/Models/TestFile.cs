using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RestrictedNL.Models;

[Table("test_files")]
public record TestFile
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Column("name")]
    public required string Name { get; set; }

    [ForeignKey("UserId")]
    [Column("user_id")]
    public required int UserId { get; set; }

    [Column("content")]
    public required string Content { get; set; }

    [Column("created_at")]
    public required DateTime CreatedAt { get; set; }

    [Column("updated_at")]
    public required DateTime UpdatedAt { get; set; }
}