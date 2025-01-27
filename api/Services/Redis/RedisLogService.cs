using Microsoft.Extensions.Caching.Distributed;
using Newtonsoft.Json;
using RestrictedNL.Context;
using RestrictedNL.Models.Logs;

namespace RestrictedNL.Services.Redis;

// The Redis cache contains data in the following format
// LogKey => List<LogGroup>
public class RedisLogService(IDistributedCache cache, TestContext context)
{
    private readonly IDistributedCache _cache = cache;

    public async Task AddLogGroup(LogKey key, LogGroup group)
    {
        var groups = await Get(key);
        var g = groups.FirstOrDefault(g => g.TestName == group.TestName);

        if (g is null) groups.Add(group);
        else g.Status = group.Status;

        var serializedGroups = JsonConvert.SerializeObject(groups);
        await _cache.SetStringAsync(key.ToString(), serializedGroups);
    }

    public async Task AddAssertion(LogKey key, Assertion assertion)
    {
        var groups = await Get(key);
        var group = groups.FirstOrDefault(g => g.TestName == assertion.TestName);
        if (group is null) return;

        group.Assertions.Add(assertion);
        await _cache.SetStringAsync(key.ToString(), JsonConvert.SerializeObject(groups));
    }

    public async Task<List<LogGroup>> Get(LogKey key)
    {
        var cachedItem = await _cache.GetStringAsync(key?.ToString() ?? "");
        if (string.IsNullOrEmpty(cachedItem)) return [];
        var deseralizedLogs = JsonConvert.DeserializeObject<List<LogGroup>>(cachedItem);
        return deseralizedLogs ?? [];
    }

    public async Task Save(LogKey key, Guid runId)
    {
        var groups = (await Get(key)).Select(group =>
        {
            group.RunId = runId;
            return group;
        });

        var assertions = groups.Select(g => g.Assertions.Select(a =>
        {
            a.RunId = runId;
            return a;
        }));

        await context.LogGroups.AddRangeAsync(groups);
        foreach (var asserts in assertions)
            await context.Assertions.AddRangeAsync(asserts);

        await context.SaveChangesAsync();
    }

    public async Task Remove(LogKey key) => await _cache.RemoveAsync(key.ToString());
}