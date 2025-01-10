using System.Runtime.InteropServices;
using System.Text;

namespace RestrictedNL.Compiler;

public static class Parser
{
    private const string _dllImportPath = @"librestricted_nl_lib";

    [DllImport(_dllImportPath, CharSet = CharSet.Ansi, CallingConvention = CallingConvention.Cdecl)]
    private static extern bool parse(string path, out string code, out IntPtr errors, out int errorCount);

    public static (string code, string[] errors) Parse(string path)
    {
        parse(path, out string code, out IntPtr errors, out int errorCount);

        List<string> errs = [];

        for (int i = 0; i < errorCount; ++i)
        {
            IntPtr errorPtr = Marshal.ReadIntPtr(errors, i * IntPtr.Size);
            string? error = Marshal.PtrToStringAnsi(errorPtr);
            if (error is not null) errs.Add(error);
        }

        return (code, errs.ToArray());
    }

    public static string wrapWithSockets(string code, int userId)
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

        async function beforeTestHook() {{
            socket = new WebSocket('ws://localhost:5064/ws/selenium');
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

        function afterTestHook() {{
            socket.close()
        }}
        
        function afterEachTestHook() {{
            sendAssert(socket, {{
                userId: {userId},
                message: this.currentTest.title,
                passed: this.currentTest.state === 'passed',
            }});
        }}");

        return sb.ToString();
    }
}