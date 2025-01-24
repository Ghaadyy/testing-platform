using System.Diagnostics;
using RestrictedNL.Compiler;
using RestrictedNL.Models.Logs;
using RestrictedNL.Models.Test;
using RestrictedNL.Services.Http;
using RestrictedNL.Repository.Test;
using RestrictedNL.Services.Redis;

namespace RestrictedNL.Services.Test;

public class TestExecutionService(
    ITestRepository testRepository,
    HttpService httpService,
    IConfiguration configuration,
    RedisProcessService processService,
    RedisLogService logService
    )
{
    public async Task RunTestAsync(TestFile testFile, string token)
    {
        var (code, errors) = await Parser.Parse(testFile.Content);
        var group = new LogGroup
        {
            TestName = "Compiled succesfully",
            Status = LogStatus.FINISHED,
        };

        if (errors.Count > 0)
        {
            group.TestName = errors.Last();
            errors.RemoveAt(errors.Count - 1);

            foreach (string err in errors)
                group.Assertions.Add(new Assertion
                {
                    TestName = group.TestName,
                    Message = err,
                    Passed = false
                });

            await httpService.SendSseMessage(testFile.UserId, testFile.Id, [group]);
            return;
        }

        await httpService.SendSseMessage(testFile.UserId, testFile.Id, [group]);

        await HandleTestExecutionAsync(testFile.Id, testFile.UserId, code, testFile.Content, token);
    }

    public async Task RunCompiledTestAsync(Guid userId, TestRun testRun, string rawCode, string token)
    {
        string seleniumCode = testRun.CompiledCode;
        await HandleTestExecutionAsync(testRun.FileId, userId, seleniumCode, rawCode, token);
    }

    private async Task HandleTestExecutionAsync(Guid fileId, Guid userId, string seleniumCode, string rawCode, string token)
    {
        string tempFilePath = Path.GetTempFileName() + ".js";

        Guid processId = Guid.NewGuid();
        string wrappedSockets = Parser.WrapWithSockets(seleniumCode, processId);
        string wrappedSeeClick = Parser.ConfigureSeeClick(
            wrappedSockets,
            token,
            configuration["ConnectionStrings:SeeClick"]!
        );

        File.WriteAllText(tempFilePath, wrappedSeeClick);

        var (Success, Duration) = await RunTestProcessAsync(processId, userId, fileId, tempFilePath);
        var key = new LogKey(userId, fileId);
        //Send close message for user to gracefully stop
        await httpService.SendSseMessage(userId, fileId, [], "close");

        Guid runId = Guid.NewGuid();
        await testRepository.UploadTestRun(new TestRun
        {
            Id = runId,
            FileId = fileId,
            Passed = Success,
            RanAt = DateTime.UtcNow,
            Duration = Duration,
            CompiledCode = seleniumCode,
            RawCode = rawCode
        });

        await logService.Save(key, runId);
        await logService.Remove(key);
    }

    private async Task<(bool Success, long Duration)> RunTestProcessAsync(Guid processId, Guid userId, Guid fileId, string tempFilePath)
    {
        //Add process to repo
        await processService.Add(processId, userId, fileId);

        Stopwatch stopwatch = new();

        // instantiate the container which 
        // will run the selenium script
        var dockerInfo = new ProcessStartInfo
        {
            FileName = "docker",
            Arguments = $"run --rm -v \"{tempFilePath}:/app/script.js\" test-environment mocha /app/script.js",
            UseShellExecute = false,
            CreateNoWindow = true,
        };

        using var process = Process.Start(dockerInfo);
        if (process is null)
        {
            File.Delete(tempFilePath);
            await httpService.SendSseMessage(userId, fileId, [new LogGroup
            {
                TestName = "Failed to start Selenium process.",
                Status = LogStatus.FINISHED,
            }]);
            return (false, 0);
        }
        await process.WaitForExitAsync();

        File.Delete(tempFilePath);

        if (process.ExitCode != 0)
        {
            await httpService.SendSseMessage(userId, fileId, [new LogGroup
            {
                TestName = $"Process terminated unexpectedly with exit code {process.ExitCode}",
                Status = LogStatus.FINISHED
            }]);
        }

        return (process.ExitCode == 0, stopwatch.ElapsedMilliseconds);
    }
}