using System.Diagnostics;
using RestrictedNL.Models.Logs;
using RestrictedNL.Models.Test;
using RestrictedNL.Services.Http;
using RestrictedNL.Repository.Test;
using RestrictedNL.Services.Redis;
using RestrictedNL.Services.Compiler;

namespace RestrictedNL.Services.Test;

public class TestExecutionService(
    ITestRepository testRepository,
    HttpService httpService,
    RedisProcessService processService,
    RedisLogService logService,
    CompilerService compilerService
    )
{
    public async Task RunAsync(TestFile file)
    {
        var (code, errors) = await compilerService.Parse(file.Content);
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

            await httpService.SendSseMessage(file.UserId, file.Id, [group]);
            return;
        }

        await httpService.SendSseMessage(file.UserId, file.Id, [group]);

        await ExecuteAsync(file.Id, file.UserId, code, file.Content);
    }

    public async Task RunCompiledAsync(Guid userId, TestRun run)
    {
        await ExecuteAsync(run.FileId, userId, run.CompiledCode, run.RawCode);
    }

    private async Task ExecuteAsync(Guid fileId, Guid userId, string seleniumCode, string rawCode)
    {
        string path = Path.GetTempFileName() + ".js";

        Guid processId = Guid.NewGuid();
        string wrapped = compilerService.ConfigureSockets(seleniumCode, processId);
        wrapped = compilerService.ConfigureSeeClick(wrapped);

        File.WriteAllText(path, wrapped);

        var (Success, Duration) = await StartProcessAsync(processId, userId, fileId, path);
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

    private async Task<(bool Success, long Duration)> StartProcessAsync(Guid processId, Guid userId, Guid fileId, string path)
    {
        //Add process to repo
        await processService.Add(processId, userId, fileId);

        Stopwatch stopwatch = new();

        // instantiate the container which 
        // will run the selenium script
        var dockerInfo = new ProcessStartInfo
        {
            FileName = "docker",
            Arguments = $"run --rm -v \"{path}:/app/script.js\" test-environment mocha /app/script.js",
            UseShellExecute = false,
            CreateNoWindow = true,
        };

        stopwatch.Start();
        using var process = Process.Start(dockerInfo);
        if (process is null)
        {
            File.Delete(path);
            await httpService.SendSseMessage(userId, fileId, [new LogGroup
            {
                TestName = "Failed to start Selenium process.",
                Status = LogStatus.FINISHED,
            }]);
            return (false, 0);
        }
        await process.WaitForExitAsync();
        stopwatch.Stop();

        File.Delete(path);

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