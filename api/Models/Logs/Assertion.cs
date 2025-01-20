using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RestrictedNL.Models.Logs;

[Table("assertions")]
public record Assertion
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("run_id")]
    public Guid RunId { get; set; }

    [Column("test_name")]
    public required string TestName { get; set; }

    [Column("message")]
    public required string Message { get; set; }

    [Column("passed")]
    public required bool Passed { get; set; }
}