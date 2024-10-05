using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RestrictedNL.Models;

[Table("Tests")]
public record Test
{
    [Key]
    [Column("name")]
    public required string Name { get; set; }

    [Column("description")]
    public required string Description { get; set; }

    [Column("url")]
    public required string Url { get; set; }

    [Column("status")]
    public required string Status { get; set; }
}