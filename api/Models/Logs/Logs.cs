using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RestrictedNL.Models.Logs;

public record LogKey(int UserId, string FileId)
{
    public override string ToString() => $"Logs_{UserId}:{FileId}";
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
    FINISHED = 1
}