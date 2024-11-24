namespace RestrictedNL.Models;

public interface ITestsRepository
{
    TestFile? GetTestFile(string fileName);
    Task UploadTestFile(string fileName, string content);
    Task UpdateTestFile(TestFile file, string content);
    TestRun? GetTestRun(int runId);
    List<TestRun> GetTestRuns(string fileName);
    Task UploadTestRun(TestRun testRun);
}