using System.Diagnostics;
using System.Net.WebSockets;
using System.Text;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using RestrictedNL.Compiler;
using RestrictedNL.Middlewares;
using RestrictedNL.Models;

namespace RestrictedNL.Services;

public class TestExecutionService(
    SocketsRepository socketsRepository,
    ITestsRepository testsRepository,
    IConfiguration configuration
    )
{
    private readonly SocketsRepository _socketsRepository = socketsRepository;
    private readonly ITestsRepository _testsRepository = testsRepository;

    public async Task RunTestAsync(WebSocket socket, string fileName, int userId, string token)
    {
        _socketsRepository.AddSocket(userId, socket);

        var file = _testsRepository.GetTestFile(fileName, userId);
        if (file is null)
        {
            await CloseConnection(socket, userId);
            // await SendMessage(socket, "File not found.", false);
            // await SendMessage(socket, "Connection closed", true);
            return;
        }

        var (code, errors) = Parser.Parse(file.Content);
        if (errors.Length > 0)
        {
            // await SendMessage(socket, "Could not compile test file.", false);
            var testGroup = new TestLogGroupItem
            {
                Test = new LogMessage("Could not compile test file", LogType.AFTER_EACH_MESSAGE, null, false),
                Assertions = []
            };

            foreach (string err in errors)
            {
                testGroup.Assertions.Add(new LogMessage("Could not compile test file", LogType.AFTER_EACH_ASSERT_MESSAGE, err, false));
            }
            // await SendMessage(socket, "Connection closed", true);
            await SendMessage(socket, [testGroup]);
            await CloseConnection(socket, userId);
            return;
        }

        // await SendMessage(socket, "Compiled successfully", true);

        await HandleTestExecutionAsync(socket, fileName, userId, code, token);
    }

    public async Task RunCompiledTestAsync(WebSocket socket, int userId, int runId, string token)
    {
        _socketsRepository.AddSocket(userId, socket);

        var testRun = _testsRepository.GetTestRun(runId);

        if (testRun is null)
        {
            // await SendMessage(socket, "File not found.", false);
            await CloseConnection(socket, userId);
            return;
        }

        // await SendMessage(socket, "Loaded test successfully", true);
        string seleniumCode = testRun.CompiledCode;
        await HandleTestExecutionAsync(socket, testRun.Name, userId, seleniumCode, token);
    }

    private async Task HandleTestExecutionAsync(WebSocket socket, string testName, int userId, string seleniumCode, string token)
    {
        string tempFilePath = Path.GetTempFileName() + ".js";

        string wrappedSockets = Parser.wrapWithSockets(seleniumCode, userId, testName);
        string wrappedSeeClick = Parser.ConfigureSeeClick(
            wrappedSockets,
            token,
            configuration["ConnectionStrings:SeeClick"]!
        );

        File.WriteAllText(tempFilePath, wrappedSeeClick);
        var (Success, Duration) = await RunTestProcessAsync(tempFilePath);

        await _testsRepository.UploadTestRun(new TestRun
        {
            Name = testName,
            Passed = Success,
            RanAt = DateTime.UtcNow,
            Duration = Duration,
            CompiledCode = seleniumCode,
        });

        await CloseConnection(socket, userId);
    }

    private static async Task<(bool Success, long Duration)> RunTestProcessAsync(string tempFilePath)
    {
        Stopwatch stopwatch = new();

        // install npm dependencies
        var npmInstallInfo = new ProcessStartInfo
        {
            FileName = OperatingSystem.IsWindows() ? "npm.cmd" : "npm",
            Arguments = "install websocket selenium-webdriver",
            UseShellExecute = false,
            CreateNoWindow = true,
            WorkingDirectory = Path.GetDirectoryName(tempFilePath),
        };

        using var npmProc = Process.Start(npmInstallInfo);
        if (npmProc is null)
        {
            File.Delete(tempFilePath);
            return (false, 0);
        }
        await npmProc.WaitForExitAsync();

        var startInfo = new ProcessStartInfo
        {
            FileName = OperatingSystem.IsWindows() ? "mocha.cmd" : "mocha",
            Arguments = $"{tempFilePath}",
            UseShellExecute = false,
            CreateNoWindow = true,
        };

        stopwatch.Start();
        using var process = Process.Start(startInfo);
        if (process is null)
        {
            File.Delete(tempFilePath);
            stopwatch.Stop();
            return (false, stopwatch.ElapsedMilliseconds);
        }

        await process.WaitForExitAsync();
        stopwatch.Stop();

        File.Delete(tempFilePath);
        return (process.ExitCode == 0, stopwatch.ElapsedMilliseconds);
    }

    private async Task CloseConnection(WebSocket socket, int userId)
    {
        _socketsRepository.RemoveSocket(userId);
        await socket.CloseAsync(WebSocketCloseStatus.NormalClosure, "Closing", CancellationToken.None);
    }

    private static async Task SendMessage(WebSocket socket, List<TestLogGroupItem> message)
    {
        var response = JsonConvert.SerializeObject(message);
        await socket.SendAsync(new(Encoding.UTF8.GetBytes(response)), WebSocketMessageType.Text, true, CancellationToken.None);
    }
}