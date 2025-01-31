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
    CompilerService compilerService,
    IServiceProvider serviceProvider
    )
{
    public async Task<(TestRun? run, List<string> errors)> RunAsync(TestFile file)
    {
        using var scope = serviceProvider.CreateScope();
        var runService = scope.ServiceProvider.GetRequiredService<RedisRunService>();
        var logService = scope.ServiceProvider.GetRequiredService<RedisLogService>();

        var (code, errors) = await compilerService.Parse(file.Content, CompilerTarget.SELENIUM);
        if (errors.Count > 0) return (null, errors);

        Guid runId = Guid.NewGuid();
        await runService.AddRun(file.UserId, runId, file.Id, code, file.Content);

        RunBackgroundThread(scope, runId, file.UserId, code);

        var run = await runService.GetRun(file.UserId, runId);
        return (run, errors);
    }

    public async Task<TestRun> RunCompiledAsync(Guid userId, TestRun run)
    {
        using var scope = serviceProvider.CreateScope();
        var runService = scope.ServiceProvider.GetRequiredService<RedisRunService>();
        var logService = scope.ServiceProvider.GetRequiredService<RedisLogService>();

        Guid runId = Guid.NewGuid();
        await runService.AddRun(userId, runId, run.FileId, run.CompiledCode, run.RawCode);

        RunBackgroundThread(scope, runId, userId, run.CompiledCode);

        return (await runService.GetRun(userId, runId))!;
    }

    private async Task ExecuteAsync(Guid runId, Guid userId, string code, RedisRunService runService, RedisLogService logService)
    {
        Guid processId = Guid.NewGuid();
        code = compilerService.ConfigureSockets(code, processId);
        code = compilerService.ConfigureSeeClick(code);

        var (Success, Duration) = await StartProcessAsync(processId, userId, runId, code, logService);
        var key = new LogKey(userId, runId);

        //Send close message for user to gracefully stop
        await httpService.SendSseMessage(userId, runId, [], "close");
        httpService.Remove(userId, runId);

        //Upload run and logs to database
        await runService.Save(userId, runId, Success ? RunStatus.PASSED : RunStatus.FAILED, Duration);
        await runService.Remove(userId, runId);
        await logService.Save(key, runId);
        await logService.Remove(key);
    }

    private async Task<(bool Success, long Duration)> StartProcessAsync(Guid processId, Guid userId, Guid runId, string code, RedisLogService logService)
    {
        //Add process to repo
        await processService.Add(processId, userId, runId);

        Stopwatch stopwatch = new();

        // instantiate the container which 
        // will run the selenium script
        var dockerInfo = new ProcessStartInfo
        {
            FileName = "docker",
            Arguments = $@"run --rm -i test-environment bash -c ""cat > /app/script.js && mocha /app/script.js""",
            UseShellExecute = false,
            CreateNoWindow = true,
            RedirectStandardInput = true,
        };

        LogKey key = new(userId, runId);

        stopwatch.Start();
        using var process = Process.Start(dockerInfo);
        if (process is null)
        {
            await logService.AddLogGroup(key, new LogGroup
            {
                TestName = "Failed to start Selenium process.",
                Status = LogStatus.FAILED,
            });
            await httpService.SendSseMessage(userId, runId, await logService.Get(key));
            return (false, 0);
        }

        using (var stdin = process.StandardInput)
        {
            await stdin.WriteAsync(code);
            await stdin.FlushAsync();
        }

        await process.WaitForExitAsync();
        stopwatch.Stop();

        if (process.ExitCode != 0)
        {
            await logService.AddLogGroup(key, new LogGroup
            {
                TestName = $"Process terminated unexpectedly with exit code {process.ExitCode}",
                Status = LogStatus.FAILED,
            });
            await httpService.SendSseMessage(userId, runId, await logService.Get(key));
        }

        return (process.ExitCode == 0, stopwatch.ElapsedMilliseconds);
    }

    private void RunBackgroundThread(IServiceScope scope, Guid runId, Guid userId, string code)
    {
        var scopeFactory = scope.ServiceProvider.GetRequiredService<IServiceScopeFactory>();

        _ = Task.Factory.StartNew(async () =>
       {
           try
           {
               using var backgroundScope = scopeFactory.CreateScope();
               var runService = backgroundScope.ServiceProvider.GetRequiredService<RedisRunService>();
               var logService = backgroundScope.ServiceProvider.GetRequiredService<RedisLogService>();
               await ExecuteAsync(runId, userId, code, runService, logService);
           }
           catch (Exception e)
           {
               Console.WriteLine($"Error: {e.Message}");
           }
       }, TaskCreationOptions.LongRunning);
    }
}