using RestrictedNL.Context;

namespace RestrictedNL.Models;

class CompiledTestRepository(TestContext context) : ICompiledTestRepository
{
    public CompiledTest? GetCompiledTest(string testName)
    {
        return context.CompiledTests.Where(test => test.Name == testName).FirstOrDefault();
    }

    public async Task UploadCompiledTest(string fileName, string content)
    {
        CompiledTest? compiledTest = GetCompiledTest(fileName);

        if (compiledTest is null)
        {
            string now = DateTime.Now.ToString();
            context.CompiledTests.Add(new CompiledTest
            {
                Name = fileName,
                Content = content,
                CreatedAt = now,
                UpdatedAt = now
            });
            await context.SaveChangesAsync();
        }
        else
        {
            context.CompiledTests.Attach(compiledTest);
            compiledTest.Content = content;
            compiledTest.UpdatedAt = DateTime.Now.ToString();
            await context.SaveChangesAsync();
        }
    }
}