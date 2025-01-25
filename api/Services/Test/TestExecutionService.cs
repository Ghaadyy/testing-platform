using System.Diagnostics;
using RestrictedNL.Models.Logs;
using RestrictedNL.Models.Test;
using RestrictedNL.Services.Http;
using RestrictedNL.Services.Redis;
using RestrictedNL.Services.Compiler;

namespace RestrictedNL.Services.Test;

public class TestExecutionService(
    HttpService httpService,
    RedisProcessService processService,
    RedisLogService logService,
    CompilerService compilerService,
    RedisRunService runService
    )
{
    public async Task<List<LogGroup>> RunAsync(TestFile file)
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
        }

        _ = Task.Run(() => ExecuteAsync(file.Id, file.UserId, code, file.Content));

        return [group];
    }

    public void RunCompiledAsync(Guid userId, TestRun run)
    {
        _ = Task.Run(() => ExecuteAsync(run.FileId, userId, run.CompiledCode, run.RawCode));
    }

    private async Task ExecuteAsync(Guid fileId, Guid userId, string seleniumCode, string rawCode)
    {
        string path = Path.GetTempFileName() + ".js";

        Guid processId = Guid.NewGuid();
        string wrapped = compilerService.ConfigureSockets(seleniumCode, processId);
        wrapped = compilerService.ConfigureSeeClick(wrapped);

        File.WriteAllText(path, wrapped);

        //Save run to redis
        Guid runId = Guid.NewGuid();
        await runService.AddRun(userId, runId, fileId, seleniumCode, rawCode);

        var (Success, Duration) = await StartProcessAsync(processId, userId, runId, path);
        var key = new LogKey(userId, runId);

        //Send close message for user to gracefully stop
        await httpService.SendSseMessage(userId, runId, [], "close");

        //Upload run and logs to database
        await runService.Save(userId, runId, Success ? RunStatus.PASSED : RunStatus.FAILED, Duration);
        await runService.Remove(userId, runId);
        await logService.Save(key, runId);
        await logService.Remove(key);
    }

    private async Task<(bool Success, long Duration)> StartProcessAsync(Guid processId, Guid userId, Guid runId, string path)
    {
        //Add process to repo
        await processService.Add(processId, userId, runId);

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

        LogKey key = new(userId, runId);

        stopwatch.Start();
        using var process = Process.Start(dockerInfo);
        if (process is null)
        {
            File.Delete(path);
            await logService.AddLogGroup(key, new LogGroup
            {
                TestName = "Failed to start Selenium process.",
                Status = LogStatus.FINISHED,
            });
            await httpService.SendSseMessage(userId, runId, await logService.Get(key));
            return (false, 0);
        }
        await process.WaitForExitAsync();
        stopwatch.Stop();

        File.Delete(path);

        if (process.ExitCode != 0)
        {
            await logService.AddLogGroup(key, new LogGroup
            {
                TestName = $"Process terminated unexpectedly with exit code {process.ExitCode}",
                Status = LogStatus.FINISHED,
            });
            await httpService.SendSseMessage(userId, runId, await logService.Get(key));
        }

        return (process.ExitCode == 0, stopwatch.ElapsedMilliseconds);
    }
}