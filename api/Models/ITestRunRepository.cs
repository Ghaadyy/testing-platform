namespace RestrictedNL.Models;

public interface ITestRunRepository
{
    TestRun? GetTestRun(int runId);
    List<TestRun> GetTestRuns(string fileName);
    Task UploadTestRun(TestRun testRun);
}