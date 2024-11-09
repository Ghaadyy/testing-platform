
using RestrictedNL.Context;

namespace RestrictedNL.Models;

public class TestsRepository(TestContext context) : ITestsRepository
{
    public TestFile? GetTestFile(string fileName)
        => context.TestFiles.Where(t => t.Name == fileName).FirstOrDefault();

    public TestRun? GetTestRun(int runId)
        => context.TestRuns.Where(test => test.Id == runId).FirstOrDefault();

    public List<TestRun> GetTestRuns(string fileName)
        => context.TestRuns.Where(test => test.Name == fileName).ToList();

    public async Task UpdateTestFile(TestFile file, string content)
    {
        context.TestFiles.Attach(file);
        file.Content = content;
        file.UpdatedAt = DateTime.Now.ToString();
        await context.SaveChangesAsync();
    }

    public async Task UploadTestFile(string fileName, string content)
    {
        context.TestFiles.Add(new TestFile
        {
            Name = fileName,
            Content = content,
            CreatedAt = DateTime.Now.ToString(),
            UpdatedAt = DateTime.Now.ToString()
        });

        await context.SaveChangesAsync();
    }

    public async Task UploadTestRun(TestRun testRun)
    {
        context.TestRuns.Add(testRun);
        await context.SaveChangesAsync();
    }
}