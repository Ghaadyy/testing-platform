using System.Collections.Concurrent;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
using RestrictedNL.Models.Logs;

namespace RestrictedNL.Services.Http;

public class HttpService
{
    private readonly ConcurrentDictionary<LogKey, HttpResponse> ActiveConnections = new();

    public void Add(Guid userId, Guid fileId, HttpResponse response)
    {
        LogKey key = new(userId, fileId);
        ActiveConnections[key] = response;
    }

    public HttpResponse? Get(Guid userId, Guid fileId)
    {
        LogKey key = new(userId, fileId);
        return ActiveConnections.GetValueOrDefault(key);
    }

    public void Remove(Guid userId, Guid fileId)
    {
        LogKey key = new(userId, fileId);
        ActiveConnections.TryRemove(key, out _);
    }

    public async Task SendSseMessage(Guid userId, Guid fileId, List<LogGroup> message, string status = "healthy")
    {
        var response = Get(userId, fileId);

        if (response != null)
        {
            var sseObject = JsonConvert.SerializeObject(new
            {
                message,
                status
            }, new JsonSerializerSettings
            {
                ContractResolver = new CamelCasePropertyNamesContractResolver()
            });

            await response.WriteAsync(sseObject);

            Console.WriteLine(sseObject);

            await response.Body.FlushAsync();
        }
        else
        {
            Console.WriteLine("Response is null");
        }
    }
}
