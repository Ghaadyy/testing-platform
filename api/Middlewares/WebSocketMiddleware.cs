using RestrictedNL.Models;
using System.Net.WebSockets;
using System.Text;
using Newtonsoft.Json;

namespace RestrictedNL.Middlewares;

class LogMessage
{
    public int UserId { get; set; }
    public string Message { get; set; } = "";
    public bool Passed { get; set; }
}

public class WebSocketMiddleware(RequestDelegate next)
{
    private static async Task HandleSelenium(HttpContext context)
    {
        var logger = context.RequestServices.GetRequiredService<ILogger<Program>>();
        var _socketsRepo = context.RequestServices.GetRequiredService<SocketsRepository>();

        if (context.WebSockets.IsWebSocketRequest)
        {
            using var webSocket = await context.WebSockets.AcceptWebSocketAsync();
            while (webSocket.State == WebSocketState.Open)
            {
                byte[] buff = new byte[1024 * 4];
                var result = await webSocket.ReceiveAsync(new(buff), CancellationToken.None);
                if (result.MessageType == WebSocketMessageType.Close)
                {
                    await webSocket.CloseAsync(WebSocketCloseStatus.NormalClosure, "Closing", CancellationToken.None);
                    logger.LogInformation("WebSocket connection closed.");
                    break;
                }

                var message = Encoding.UTF8.GetString(buff, 0, result.Count);
                var log = JsonConvert.DeserializeObject<LogMessage>(message);

                if (log is not null)
                {
                    await _socketsRepo.GetSocket(log.UserId).SendAsync(new(buff, 0, result.Count), WebSocketMessageType.Text, true, CancellationToken.None);
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