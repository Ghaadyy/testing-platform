using RestrictedNL.Models;
using System.Net.WebSockets;
using System.Text;

namespace RestrictedNL.Middlewares;

public class WebSocketMiddleware(RequestDelegate next)
{
    private readonly RequestDelegate _next = next;

    private async Task HandleUser(HttpContext context, string userId)
    {
        var logger = context.RequestServices.GetRequiredService<ILogger<Program>>();
        var _socketsRepo = context.RequestServices.GetRequiredService<SocketsRepository>();
        if (context.WebSockets.IsWebSocketRequest)
        {
            using var webSocket = await context.WebSockets.AcceptWebSocketAsync();
            _socketsRepo.AddSocket(userId, webSocket);

            while (webSocket.State == WebSocketState.Open)
            {
                byte[] buff = new byte[1024 * 4];
                var result = await webSocket.ReceiveAsync(new ArraySegment<byte>(buff), CancellationToken.None);
                if (result.MessageType == WebSocketMessageType.Close)
                {
                    await webSocket.CloseAsync(WebSocketCloseStatus.NormalClosure, "Closing", CancellationToken.None);
                    _socketsRepo.RemoveSocket(userId);
                    logger.LogInformation("WebSocket connection closed.");
                    break;
                }
            }
        }
        else
        {
            context.Response.StatusCode = StatusCodes.Status400BadRequest;
            logger.LogInformation("The server got hacked");
        }
    }

    private async Task HandleSelenium(HttpContext context)
    {
        var logger = context.RequestServices.GetRequiredService<ILogger<Program>>();
        var _socketsRepo = context.RequestServices.GetRequiredService<SocketsRepository>();

        if (context.WebSockets.IsWebSocketRequest)
        {
            using var webSocket = await context.WebSockets.AcceptWebSocketAsync();
            while (webSocket.State == WebSocketState.Open)
            {
                byte[] buff = new byte[1024 * 4];
                var result = await webSocket.ReceiveAsync(new ArraySegment<byte>(buff), CancellationToken.None);
                if (result.MessageType == WebSocketMessageType.Close)
                {
                    await webSocket.CloseAsync(WebSocketCloseStatus.NormalClosure, "Closing", CancellationToken.None);
                    logger.LogInformation("WebSocket connection closed.");
                    break;
                }

                var message = Encoding.UTF8.GetString(buff, 0, result.Count);
                logger.LogInformation(message);

                // message.userId = user id from selenium

                await _socketsRepo.GetSocket("userId").SendAsync(new ArraySegment<byte>(buff, 0, result.Count), WebSocketMessageType.Text, true, CancellationToken.None);
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
        if (context.Request.Path == "/ws/user")
        {
            // context.Request.RouteValues.TryGetValue("userId", out object? value);
            // if (value is null)
            // {
            //     // TODO
            //     return;
            // }

            await HandleUser(context, "userId");
        }
        else if (context.Request.Path == "/ws/selenium")
        {
            await HandleSelenium(context);
        }
        else
        {
            await _next(context);
        }
    }
}