namespace RestrictedNL.Repository.Test;

using RestrictedNL.Models.Logs;
using RestrictedNL.Models.Test;

public interface ITestRepository
{
    List<TestFile> GetTestFiles(Guid userId);
    TestFile? GetTestFile(Guid fileId, Guid userId);
    TestFile? GetTestFileByName(string fileName, Guid userId);
    Task DeleteTestFile(TestFile file);
    Task<TestFile> UploadTestFile(Guid userId, string fileName, string content);
    Task<TestFile> UpdateTestFile(TestFile file, string content);
    TestRun? GetTestRun(Guid runId);
    List<TestRun> GetTestRuns(Guid fileId);
    List<LogGroup> GetLogs(Guid runId);
    Task UploadTestRun(TestRun testRun);
}