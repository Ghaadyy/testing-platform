using System.Diagnostics;
using System.Text;
using Microsoft.OpenApi.Extensions;

namespace RestrictedNL.Services.Compiler;

public enum CompilerTarget
{
    SELENIUM,
    JSON
}

public class CompilerService(
    IConfiguration configuration,
    IHttpContextAccessor accessor
    )
{
    public async Task<(string code, List<string> errors)> Parse(string code, CompilerTarget compilerTarget)
    {
        var target = compilerTarget.GetDisplayName().ToLower();

        var compInfo = new ProcessStartInfo
        {
            FileName = "rnlc",
            // this should be moved to an env var when the compiler supports it
            Arguments = $"--keep-xpath -t {target}",
            UseShellExecute = false,
            RedirectStandardInput = true,
            RedirectStandardOutput = true,
            RedirectStandardError = true,
        };

        using var compiler = Process.Start(compInfo);
        if (compiler is null) return ("", []);

        using (var writer = compiler.StandardInput)
        {
            await writer.WriteAsync(code);
            await writer.FlushAsync();
        }

        await compiler.WaitForExitAsync();

        using var reader = compiler.StandardOutput;
        var compiledCode = await reader.ReadToEndAsync();

        using var err = compiler.StandardError;
        var errors = new List<string>();

        string? error;

        while ((error = err.ReadLine()) != null)
            errors.Add(error);

        return (compiledCode, errors.ToList());
    }

    public string ConfigureSeeClick(string code)
    {
        string url = configuration["ConnectionStrings:SeeClick"]!;
        string token = accessor.HttpContext?.Request.Headers.Authorization.FirstOrDefault()?.Split(" ").Last()!;

        StringBuilder sb = new();

        sb.Append(Environment.NewLine);
        sb.Append(code);
        sb.Append(Environment.NewLine);

        sb.Append(@$"function getToken() {{
            return '{token}';
        }}
        
        function getServerURL() {{
            return '{url}';
        }}");

        return sb.ToString();
    }

    public string ConfigureSockets(string code, Guid processId)
    {
        StringBuilder sb = new();

        sb.Append(@"const { w3cwebsocket: WebSocket } = require('websocket');
        let socket;");

        sb.Append(Environment.NewLine);
        sb.Append(code);
        sb.Append(Environment.NewLine);

        sb.Append(@$"function sendAssert(socket, test) {{
            if (socket.readyState == socket.OPEN) {{
                socket.send(JSON.stringify(test));
            }}
        }} 

        function sleep(ms) {{
            return new Promise(resolve => setTimeout(resolve, ms));
        }}

        async function beforeHook() {{
            socket = new WebSocket('ws://host.docker.internal:5064/ws/selenium?processId={processId}');
            socket.onopen = async function () {{
                console.log('open');
            }};

            socket.onerror = function (err) {{
                console.log('Error here!!!');
                console.log(err.message);
            }};

            socket.onclose = function (event) {{
                console.log(event.reason);
            }};
        }}

        function afterHook() {{
            socket.close()
        }}

        async function afterEachAssertHook(message, passed, test) {{
            sendAssert(socket, {{
                testName: test,
                message,
                passed
            }});
        }}

        async function beforeEachHook() {{
            sendAssert(socket, {{
                testName: this.currentTest.title,
                status: 0
            }});
        }}
        
        async function afterEachHook() {{
            sendAssert(socket, {{
                testName: this.currentTest.title,
                status: this.currentTest.state === 'passed' ? 1 : 2
            }});

            await sleep(2000);
        }}");

        return sb.ToString();
    }
}