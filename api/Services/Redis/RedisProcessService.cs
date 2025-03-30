using Microsoft.Extensions.Caching.Distributed;
using Newtonsoft.Json;
using TestingPlatform.Models.Logs;

namespace TestingPlatform.Services.Redis;

public class RedisProcessService(IDistributedCache cache)
{
    private readonly IDistributedCache _cache = cache;
    private static string GetKey(Guid processId) => $"Process_{processId}";

    public async Task Add(Guid processId, Guid userId, Guid runId)
    {
        string cacheKey = GetKey(processId);

        var seralizedLogKey = JsonConvert.SerializeObject(new LogKey(userId, runId));

        await _cache.SetStringAsync(cacheKey, seralizedLogKey);
    }

    public async Task<LogKey?> Get(Guid processId)
    {
        string cacheKey = GetKey(processId);

        var cachedItem = await _cache.GetStringAsync(cacheKey);

        if (string.IsNullOrEmpty(cachedItem)) return null;

        return JsonConvert.DeserializeObject<LogKey>(cachedItem);
    }

    public async Task Remove(Guid processId)
    {
        string cacheKey = GetKey(processId);
        await _cache.RemoveAsync(cacheKey);
    }
}
