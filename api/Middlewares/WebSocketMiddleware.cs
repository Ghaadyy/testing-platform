using TestingPlatform.Models.Logs;
using System.Net.WebSockets;
using System.Text;
using Newtonsoft.Json;
using TestingPlatform.Services.Redis;
using Newtonsoft.Json.Linq;
using TestingPlatform.Services.Http;

namespace TestingPlatform.Middlewares;

public class WebSocketMiddleware(RequestDelegate next)
{
    private static async Task HandleSelenium(HttpContext context)
    {
        var logger = context.RequestServices.GetRequiredService<ILogger<Program>>();
        var httpService = context.RequestServices.GetRequiredService<HttpService>();
        var logService = context.RequestServices.GetRequiredService<RedisLogService>();
        var processService = context.RequestServices.GetRequiredService<RedisProcessService>();

        if (context.WebSockets.IsWebSocketRequest)
        {
            var processId = Guid.Parse(context.Request.Query["processId"].ToString());
            var key = await processService.Get(processId);
            if (key is null)
            {
                logger.LogInformation("Process missing from repo");
                return;
            }

            // Accept WebSocket connection from selenium
            using var webSocket = await context.WebSockets.AcceptWebSocketAsync();
            while (webSocket.State == WebSocketState.Open)
            {
                byte[] buff = new byte[1024 * 4];
                var result = await webSocket.ReceiveAsync(new(buff), CancellationToken.None);
                if (result.MessageType == WebSocketMessageType.Close)
                {
                    logger.LogInformation("WebSocket connection closing...");
                    await processService.Remove(processId);

                    await webSocket.CloseAsync(WebSocketCloseStatus.NormalClosure, "Closing", CancellationToken.None);
                    logger.LogInformation("WebSocket connection closed.");
                    break;
                }

                // Process the message from selenium
                var message = Encoding.UTF8.GetString(buff, 0, result.Count);
                Console.WriteLine($"Received message = {message}");
                var obj = JsonConvert.DeserializeObject<JObject>(message);

                if (obj is not null)
                {
                    if (obj["message"] is null)
                    {
                        logger.LogInformation("Is LogGroup");
                        await logService.AddLogGroup(key, obj.ToObject<LogGroup>()!);
                    }
                    else if (obj["message"] is not null)
                    {
                        logger.LogInformation("Is Assertion");
                        await logService.AddAssertion(key, obj.ToObject<Assertion>()!);
                    }
                    else
                    {
                        logger.LogInformation("Message did not match any expected types");
                    }

                    await httpService.SendSseMessage(key.UserId, key.RunId, await logService.Get(key));
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