namespace RestrictedNL.Models;

public interface ITestsRepository
{
    List<TestFile> GetTestFiles();
    TestFile? GetTestFile(string fileName);
    Task DeleteTestFile(TestFile file);
    Task UploadTestFile(string fileName, string content);
    Task UpdateTestFile(TestFile file, string content);
    TestRun? GetTestRun(int runId);
    List<TestRun> GetTestRuns(string fileName);
    Task UploadTestRun(TestRun testRun);
}