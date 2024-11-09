using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RestrictedNL.Models;

[Table("compiled_tests")]
public record CompiledTest
{
    [Key]
    [Column("name")]
    public required string Name { get; set; }

    [Column("content")]
    public required string Content { get; set; }

    [Column("created_at")]
    public required string CreatedAt { get; set; }

    [Column("updated_at")]
    public required string UpdatedAt { get; set; }
}