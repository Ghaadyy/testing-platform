using System.Diagnostics;
using System.Net.WebSockets;
using System.Text;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using RestrictedNL.Compiler;
using RestrictedNL.Models;

namespace RestrictedNL.Services;

public class TestExecutionService(SocketsRepository socketsRepository, ITestsRepository testsRepository)
{
    private readonly SocketsRepository _socketsRepository = socketsRepository;
    private readonly ITestsRepository _testsRepository = testsRepository;

    public async Task RunTestAsync(WebSocket socket, string fileName, string userId)
    {
        _socketsRepository.AddSocket(userId, socket);

        var file = _testsRepository.GetTestFile(fileName);
        if (file is null)
        {
            await CloseConnection(socket, userId);
            await SendMessage(socket, "File not found.", false);
            await SendMessage(socket, "Connection closed", true);
            return;
        }

        var (code, errors) = Parser.Parse(file.Content);
        if (errors.Length > 0)
        {
            await SendMessage(socket, "Could not compile test file.", false);
            foreach(string err in errors) {
                await SendMessage(socket, err, false);
            }
            await SendMessage(socket, "Connection closed", true);
            await CloseConnection(socket, userId);
            return;
        }

        await SendMessage(socket, "Compiled successfully", true);

        await HandleTestExecutionAsync(socket, fileName, userId, code);
    }

    public async Task RunCompiledTestAsync(WebSocket socket, string userId, int runId)
    {
        _socketsRepository.AddSocket(userId, socket);

        var testRun = _testsRepository.GetTestRun(runId);

        if (testRun is null) {
            await SendMessage(socket, "File not found.", false);
            await CloseConnection(socket, userId);
            return;
        }

        await SendMessage(socket, "Loaded test successfully", true);
        string seleniumCode = testRun.CompiledCode;
        await HandleTestExecutionAsync(socket, testRun.Name, userId, seleniumCode);
    }

    private async Task HandleTestExecutionAsync(WebSocket socket, string testName, string userId, string seleniumCode)
    {
        string tempFilePath = Path.GetTempFileName() + ".js";

        File.WriteAllText(tempFilePath, Parser.wrapWithSockets(seleniumCode));
        var (Success, Duration) = await RunTestProcessAsync(tempFilePath);

        if (!Success)
        {
            await SendMessage(socket, "Could not run test files", false);
            await SendMessage(socket, "Connection closed", true);
            await CloseConnection(socket, userId);
            return;
        }

        await _testsRepository.UploadTestRun(new TestRun
        {
            Name = testName,
            Passed = true,
            RanAt = DateTime.UtcNow,
            Duration = Duration,
            CompiledCode = seleniumCode,
        });

        await SendMessage(socket, "Connection closed", true);
        await CloseConnection(socket, userId);
    }

    private static async Task<(bool Success, long Duration)> RunTestProcessAsync(string tempFilePath)
    {
        Stopwatch stopwatch = new();

        // install npm dependencies
        var npmInstallInfo = new ProcessStartInfo {
            FileName = "npm",
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
        return (true, stopwatch.ElapsedMilliseconds);
    }

    private async Task CloseConnection(WebSocket socket, string userId)
    {
        _socketsRepository.RemoveSocket(userId);
        await socket.CloseAsync(WebSocketCloseStatus.NormalClosure, "Closing", CancellationToken.None);
    }

    private static async Task SendMessage(WebSocket socket, string message, bool passed)
    {
        var response = JsonConvert.SerializeObject(new { message, passed });
        await socket.SendAsync(new ArraySegment<byte>(Encoding.UTF8.GetBytes(response)), WebSocketMessageType.Text, true, CancellationToken.None);
    }
}