namespace RestrictedNL.Models;

public interface ICompiledTestRepository
{
    CompiledTest? GetCompiledTest(string testName);
    Task UploadCompiledTest(string fileName, string content);
}