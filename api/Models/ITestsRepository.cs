using RestrictedNL.Models.Logs;

namespace RestrictedNL.Models;

public interface ITestsRepository
{
    List<TestFile> GetTestFiles(int userId);
    TestFile? GetTestFile(string fileName, int userId);
    Task DeleteTestFile(TestFile file);
    Task UploadTestFile(int userId, string fileName, string content);
    Task UpdateTestFile(TestFile file, string content);
    TestRun? GetTestRun(Guid runId);
    List<TestRun> GetTestRuns(int fileId);
    List<LogGroup> GetLogs(Guid runId);
    Task UploadTestRun(TestRun testRun);
}