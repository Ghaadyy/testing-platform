using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RestrictedNL.Models.Test;

[Table("test_runs")]
public record TestRun
{
    [Key]
    [Column("id")]
    public required Guid Id { get; set; }

    [ForeignKey("fileId")]
    [Column("file_id")]
    public required Guid FileId { get; set; }

    [Column("ran_at")]
    public required DateTime RanAt { get; set; }

    [Column("compiled_code")]
    public required string CompiledCode { get; set; }

    [Column("raw_code")]
    public required string RawCode { get; set; }

    [Column("duration")]
    public required long Duration { get; set; }

    [Column("status")]
    public required RunStatus Status { get; set; }
}

public enum RunStatus
{
    PASSED = 0,
    PENDING = 1,
    FAILED = 2
}