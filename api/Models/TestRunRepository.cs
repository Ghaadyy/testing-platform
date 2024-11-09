using RestrictedNL.Context;

namespace RestrictedNL.Models;

class TestRunRepository(TestContext context) : ITestRunRepository
{
    public TestRun? GetTestRun(int runId)
    {
        return context.TestRuns.Where(test => test.Id == runId).FirstOrDefault();
    }

    public List<TestRun> GetTestRuns(string fileName)
    {
        return context.TestRuns.Where(test => test.Name == fileName).ToList();
    }

    public async Task UploadTestRun(TestRun testRun)
    {
        context.TestRuns.Add(testRun);
        await context.SaveChangesAsync();
    }
}