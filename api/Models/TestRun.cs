using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RestrictedNL.Models;

[Table("test_runs")]
public record TestRun
{
    [Key]
    [Column("id")]
    public required Guid Id { get; set; }

    [ForeignKey("fileId")]
    [Column("file_id")]
    public required int FileId { get; set; }

    [Column("ran_at")]
    public required DateTime RanAt { get; set; }

    [Column("compiled_code")]
    public required string CompiledCode { get; set; }

    [Column("duration")]
    public required long Duration { get; set; }

    [Column("passed")]
    public required bool Passed { get; set; }
}