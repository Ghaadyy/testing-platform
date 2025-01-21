namespace RestrictedNL.Repository.Test;

using RestrictedNL.Context;
using RestrictedNL.Models.Logs;
using RestrictedNL.Models.Test;

public class TestRepository(TestContext context) : ITestRepository
{
    public List<TestFile> GetTestFiles(int userId) =>
        [.. context.TestFiles.Where(f => f.UserId == userId)];

    public TestFile? GetTestFile(string fileName, int userId)
        => context.TestFiles.Where(t => t.Name == fileName && t.UserId == userId).FirstOrDefault();

    public async Task DeleteTestFile(TestFile file)
    {
        context.TestFiles.Remove(file);
        await context.SaveChangesAsync();
    }

    public TestRun? GetTestRun(Guid runId)
        => context.TestRuns.Where(test => test.Id == runId).FirstOrDefault();

    public List<TestRun> GetTestRuns(int fileId)
        => context.TestRuns.Where(test => test.FileId == fileId).ToList();

    public async Task UpdateTestFile(TestFile file, string content)
    {
        context.TestFiles.Attach(file);
        file.Content = content;
        file.UpdatedAt = DateTime.UtcNow;
        await context.SaveChangesAsync();
    }

    public async Task UploadTestFile(int userId, string fileName, string content)
    {
        context.TestFiles.Add(new TestFile
        {
            Name = fileName,
            Content = content,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            UserId = userId
        });

        await context.SaveChangesAsync();
    }

    public List<LogGroup> GetLogs(Guid runId)
    {
        var groups = context.LogGroups.Where(g => g.RunId == runId).ToList();

        foreach (var group in groups)
        {
            var assertions = context.Assertions
            .Where(a => a.RunId == runId && a.TestName == group.TestName)
            .ToList();

            group.Assertions = assertions;
        }

        return groups;
    }

    public async Task UploadTestRun(TestRun testRun)
    {
        context.TestRuns.Add(testRun);
        await context.SaveChangesAsync();
    }
}