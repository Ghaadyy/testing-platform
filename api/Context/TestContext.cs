using Microsoft.EntityFrameworkCore;
using RestrictedNL.Models;

namespace RestrictedNL.Context;

public class TestContext(DbContextOptions options) : DbContext(options)
{
    public DbSet<TestFile> TestFiles { get; set; }
    public DbSet<Test> Tests { get; set; }
}