using Microsoft.Extensions.Caching.Distributed;
using Newtonsoft.Json;
using RestrictedNL.Models.Logs;

namespace RestrictedNL.Services.Redis;

public class RedisProcessService(IDistributedCache cache)
{
    private readonly IDistributedCache _cache = cache;
    private static string GetKey(Guid processId) => $"Process_{processId}";

    public async Task Add(Guid processId, Guid userId, Guid fileId)
    {
        string cacheKey = GetKey(processId);

        var seralizedLogKey = JsonConvert.SerializeObject(new LogKey(userId, fileId));

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
