
using RestrictedNL.Context;

namespace RestrictedNL.Models;

public class TestsRepository(TestContext context) : ITestsRepository
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

    public TestRun? GetTestRun(int runId)
        => context.TestRuns.Where(test => test.Id == runId).FirstOrDefault();

    public List<TestRun> GetTestRuns(string fileName)
        => context.TestRuns.Where(test => test.Name == fileName).ToList();

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

    public async Task UploadTestRun(TestRun testRun)
    {
        context.TestRuns.Add(testRun);
        await context.SaveChangesAsync();
    }
}