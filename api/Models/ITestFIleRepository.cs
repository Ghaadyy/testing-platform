namespace RestrictedNL.Models;

public interface ITestFileRepository
{
    TestFile? GetTestFile(string fileName);
    Task UploadTestFile(string fileName, string content);
    Task UpdateTestFile(TestFile file, string content);
}