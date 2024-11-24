using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RestrictedNL.Models;

[Table("test_runs")]
public record TestRun
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Column("name")]
    public required string Name { get; set; }

    [Column("ran_at")]
    public required DateTime RanAt { get; set; }

    [Column("compiled_code")]
    public required string CompiledCode { get; set; }

    [Column("duration")]
    public required long Duration { get; set; }

    [Column("passed")]
    public required bool Passed { get; set; }
}