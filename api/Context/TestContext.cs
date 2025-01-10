using Microsoft.EntityFrameworkCore;
using RestrictedNL.Models;
using RestrictedNL.Models.User;

namespace RestrictedNL.Context;

#pragma warning disable CS8618 // Non-nullable field must contain a non-null value when exiting constructor. Consider adding the 'required' modifier or declaring as nullable.
public class TestContext(DbContextOptions options) : DbContext(options)
{
    public DbSet<TestFile> TestFiles { get; set; }
    public DbSet<TestRun> TestRuns { get; set; }
    public DbSet<User> Users { get; set; }
}