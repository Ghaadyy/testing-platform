using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RestrictedNL.Models.Test;

public record TestFileDTO
{
    public required string FileName;
    public required string Content;
}

[Table("test_files")]
public record TestFile
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("name")]
    public required string Name { get; set; }

    [ForeignKey("UserId")]
    [Column("user_id")]
    public required Guid UserId { get; set; }

    [Column("content")]
    public required string Content { get; set; }

    [Column("created_at")]
    public required DateTime CreatedAt { get; set; }

    [Column("updated_at")]
    public required DateTime UpdatedAt { get; set; }
}