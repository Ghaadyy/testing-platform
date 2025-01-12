using RestrictedNL.Models;
using System.Net.WebSockets;
using System.Text;
using Newtonsoft.Json;
using System.Collections.Concurrent;

namespace RestrictedNL.Middlewares;

public record TestLogKey(int UserId, string FileName);

public record LogMessage(string Test, LogType Type, string? Message, bool? Passed);

public enum LogType
{
    BEFORE_EACH_MESSAGE = 0,
    AFTER_EACH_ASSERT_MESSAGE = 1,
    AFTER_EACH_MESSAGE = 2
}
public class TestLogGroupItem
{
    public required LogMessage Test;
    public required List<LogMessage> Assertions;
};

public class WebSocketMiddleware(RequestDelegate next)
{
    // this should be moved to a db like redis>>>>>>><<<<<<<<please. after tuesday
    private static readonly ConcurrentDictionary<TestLogKey, List<TestLogGroupItem>> TestLogGroup = new();

    private static async Task HandleSelenium(HttpContext context)
    {
        var logger = context.RequestServices.GetRequiredService<ILogger<Program>>();
        var _socketsRepo = context.RequestServices.GetRequiredService<SocketsRepository>();

        if (context.WebSockets.IsWebSocketRequest)
        {
            var fileName = context.Request.Query["fileName"].ToString();
            var userId = int.Parse(context.Request.Query["userId"].ToString());

            using var webSocket = await context.WebSockets.AcceptWebSocketAsync();
            while (webSocket.State == WebSocketState.Open)
            {
                byte[] buff = new byte[1024 * 4];
                var result = await webSocket.ReceiveAsync(new(buff), CancellationToken.None);
                if (result.MessageType == WebSocketMessageType.Close)
                {
                    await webSocket.CloseAsync(WebSocketCloseStatus.NormalClosure, "Closing", CancellationToken.None);
                    logger.LogInformation("WebSocket connection closed.");
                    var key = new TestLogKey(userId, fileName);
                    //Save in database before removing ?? But don't we need to save it under a run id?????????? how do we fetch the run id of this one????
                    TestLogGroup.TryRemove(key, out _);
                    break;
                }

                var message = Encoding.UTF8.GetString(buff, 0, result.Count);
                var log = JsonConvert.DeserializeObject<LogMessage>(message);

                if (log is not null)
                {
                    var logKey = new TestLogKey(userId, fileName);

                    if (log.Type != LogType.AFTER_EACH_ASSERT_MESSAGE)
                    {
                        var testBlocks = TestLogGroup.GetValueOrDefault(logKey, []);
                        var testBlock = testBlocks.FirstOrDefault(group => group.Test.Test == log.Test);
                        if (testBlock is not null)
                        {
                            testBlock.Test = log;
                        }
                        else
                        {
                            testBlocks.Add(new TestLogGroupItem
                            {
                                Test = log,
                                Assertions = []
                            });
                        }

                        TestLogGroup.AddOrUpdate(logKey, [new TestLogGroupItem
                        {
                            Test = log,
                            Assertions = []
                        }], (key, val) => testBlocks);
                    }
                    else
                    {
                        TestLogGroup[logKey].Find(group => group.Test.Test == log.Test)?.Assertions.Add(log);
                    }

                    var testGroups = Encoding.UTF8.GetBytes(JsonConvert.SerializeObject(TestLogGroup[logKey]));
                    await _socketsRepo.GetSocket(logKey.UserId).SendAsync(new(testGroups, 0, testGroups.Length), WebSocketMessageType.Text, true, CancellationToken.None);
                }
            }
        }
        else
        {
            context.Response.StatusCode = StatusCodes.Status400BadRequest;
            logger.LogInformation("The server got hacked");
        }
    }

    public async Task InvokeAsync(HttpContext context)
    {
        if (context.Request.Path == "/ws/selenium")
        {
            await HandleSelenium(context);
        }
        else
        {
            await next(context);
        }
    }
}