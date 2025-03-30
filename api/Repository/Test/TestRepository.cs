namespace TestingPlatform.Repository.Test;

using TestingPlatform.Context;
using TestingPlatform.Models.Logs;
using TestingPlatform.Models.Test;

public class TestRepository(TestContext context) : ITestRepository
{
    public List<TestFile> GetTestFiles(Guid userId) =>
        [.. context.TestFiles.Where(f => f.UserId == userId)];

    public TestFile? GetTestFile(Guid fileId, Guid userId)
        => context.TestFiles.Where(t => t.Id == fileId && t.UserId == userId).FirstOrDefault();

    public TestFile? GetTestFileByName(string fileName, Guid userId)
        => context.TestFiles.Where(t => t.Name == fileName && t.UserId == userId).FirstOrDefault();

    public async Task DeleteTestFile(TestFile file)
    {
        context.TestFiles.Remove(file);
        await context.SaveChangesAsync();
    }

    public TestRun? GetTestRun(Guid runId)
        => context.TestRuns.Where(test => test.Id == runId).FirstOrDefault();

    public List<TestRun> GetTestRuns(Guid fileId)
        => context.TestRuns.Where(test => test.FileId == fileId).ToList();

    public async Task<TestFile> UpdateTestFile(TestFile file, string content)
    {
        context.TestFiles.Attach(file);
        file.Content = content;
        file.UpdatedAt = DateTime.UtcNow;
        await context.SaveChangesAsync();
        return file;
    }

    public async Task<TestFile> UploadTestFile(Guid userId, string fileName, string content)
    {
        var file = new TestFile
        {
            Name = fileName,
            Content = content,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            UserId = userId
        };

        context.TestFiles.Add(file);

        await context.SaveChangesAsync();

        return file;
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