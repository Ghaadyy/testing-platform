using System.Collections.Concurrent;
using Newtonsoft.Json;
using RestrictedNL.Models.Redis;
using RestrictedNL.Models.Logs;

namespace RestrictedNL.Models;

public class HttpRepository
{
    private readonly ConcurrentDictionary<LogKey, HttpResponse> ActiveConnections = new();

    public void Add(int userId, string fileName, HttpResponse response)
    {
        LogKey key = new(userId, fileName);
        ActiveConnections[key] = response;
    }

    public HttpResponse? Get(int userId, string fileName)
    {
        LogKey key = new(userId, fileName);

        if (ActiveConnections.TryGetValue(key, out var response))
        {
            return response;
        }

        return null;
    }

    public void Remove(int userId, string fileName)
    {
        LogKey key = new(userId, fileName);
        ActiveConnections.TryRemove(key, out _);
    }

    public async Task SendSseMessage(int userId, string fileId, List<LogGroup> message, string status = "healthy")
    {
        var response = Get(userId, fileId);

        if (response != null)
        {
            var sseObject = JsonConvert.SerializeObject(new
            {
                message,
                status
            });

            var data = $"data: {sseObject}\n\n";

            await response.WriteAsync(data);

            Console.WriteLine(data);

            await response.Body.FlushAsync();
        }
        else
        {
            Console.WriteLine("Response is null");
        }
    }
}
