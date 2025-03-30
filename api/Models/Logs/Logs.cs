using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TestingPlatform.Models.Logs;

public record LogKey(Guid UserId, Guid RunId)
{
    public override string ToString() => $"Logs_{UserId}:{RunId}";
};

[Table("log_groups")]
public record LogGroup
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("test_name")]
    public required string TestName { get; set; }

    [Column("status")]
    public required LogStatus Status { get; set; }

    [Column("run_id")]
    public Guid RunId { get; set; }

    [NotMapped]
    public List<Assertion> Assertions = [];
};

public enum LogStatus
{
    LOADING = 0,
    PASSED = 1,
    FAILED = 2
}