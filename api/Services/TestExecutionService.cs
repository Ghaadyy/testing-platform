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

    public async Task<IActionResult> RunTestAsync(WebSocket socket, string fileName, string userId)
    {
        _socketsRepository.AddSocket(userId, socket);

        var file = _testsRepository.GetTestFile(fileName);
        if (file is null)
        {
            await CloseConnection(socket, userId);
            return new NotFoundObjectResult("File not found");
        }

        var status = Parser.parse(file.Content, out string seleniumCode);
        if (!status)
        {
            await CloseConnection(socket, userId);
            return new BadRequestObjectResult("Could not compile test file.");
        }

        await SendMessage(socket, "Compiled successfully", true);

        return await HandleTestExecutionAsync(socket, fileName, userId, seleniumCode);
    }

    public async Task<IActionResult> RunCompiledTestAsync(WebSocket socket, string userId, int runId)
    {
        _socketsRepository.AddSocket(userId, socket);

        var testRun = _testsRepository.GetTestRun(runId);

        if (testRun is null) return new NotFoundObjectResult("File not found");
        await SendMessage(socket, "Loaded test successfully", true);

        string seleniumCode = testRun.CompiledCode;

        return await HandleTestExecutionAsync(socket, testRun.Name, userId, seleniumCode);
    }

    private async Task<IActionResult> HandleTestExecutionAsync(WebSocket socket, string testName, string userId, string seleniumCode)
    {
        string tempFilePath = Path.GetTempFileName() + ".js";

        File.WriteAllText(tempFilePath, Parser.wrapWithSockets(seleniumCode));
        var (Success, Duration) = await RunTestProcessAsync(tempFilePath);

        if (!Success)
        {
            await CloseConnection(socket, userId);
            return new StatusCodeResult(500); //, "Could not run test file."
        }

        await _testsRepository.UploadTestRun(new TestRun
        {
            Name = testName,
            Passed = true,
            RanAt = DateTime.Now.ToString(),
            Duration = Duration,
            CompiledCode = seleniumCode,
        });

        await SendMessage(socket, "Connection closed", true);
        await CloseConnection(socket, userId);

        return new EmptyResult();
    }

    private static async Task<(bool Success, long Duration)> RunTestProcessAsync(string tempFilePath)
    {
        Stopwatch stopwatch = new();
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