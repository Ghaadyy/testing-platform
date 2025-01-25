using System.Collections.Concurrent;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
using RestrictedNL.Models.Logs;

namespace RestrictedNL.Services.Http;

public class HttpService
{
    private readonly ConcurrentDictionary<LogKey, HttpResponse> ActiveConnections = new();

    public void Add(Guid userId, Guid runId, HttpResponse response)
    {
        LogKey key = new(userId, runId);
        ActiveConnections[key] = response;
    }

    public HttpResponse? Get(Guid userId, Guid runId)
    {
        LogKey key = new(userId, runId);
        return ActiveConnections.GetValueOrDefault(key);
    }

    public void Remove(Guid userId, Guid runId)
    {
        LogKey key = new(userId, runId);
        ActiveConnections.TryRemove(key, out _);
    }

    public async Task SendSseMessage(Guid userId, Guid runId, List<LogGroup> message, string status = "healthy")
    {
        var response = Get(userId, runId);

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

            await response.Body.FlushAsync();
        }
        else
        {
            Console.WriteLine("Response is null");
        }
    }
}
