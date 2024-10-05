using RestrictedNL.Context;

namespace RestrictedNL.Models;

public class TestFileRepository(TestContext context) : ITestFileRepository
{
    private TestContext _ctx = context;

    public TestFile? GetTestFile(string fileName)
    {
        return _ctx.TestFiles.Where(t => t.Name == fileName).FirstOrDefault();
    }

    public async Task UploadTestFile(string fileName, string content)
    {
        _ctx.TestFiles.Add(new TestFile
        {
            Name = fileName,
            Content = content,
            CreatedAt = DateTime.Now.ToString(),
            UpdatedAt = DateTime.Now.ToString()
        });

        await _ctx.SaveChangesAsync();
    }

    public async Task UpdateTestFile(TestFile file, string content)
    {
        file.Content = content;
        file.UpdatedAt = DateTime.Now.ToString();
        await _ctx.SaveChangesAsync();
    }
}