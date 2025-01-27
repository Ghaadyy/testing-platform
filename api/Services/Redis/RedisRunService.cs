using Microsoft.Extensions.Caching.Distributed;
using Newtonsoft.Json;
using RestrictedNL.Models.Test;
using RestrictedNL.Repository.Test;

namespace RestrictedNL.Services.Redis;

// The Redis cache contains data in the following format
// userId => List<TestRun>
public class RedisRunService(IDistributedCache cache, ITestRepository testRepository)
{
    private readonly IDistributedCache _cache = cache;

    private static string GetKey(Guid userId) => $"Run_{userId}";

    public async Task AddRun(Guid userId, Guid runId, Guid fileId, string compiledCode, string rawCode)
    {
        var testRuns = await Get(userId);

        testRuns.Add(new TestRun
        {
            Id = runId,
            FileId = fileId,
            Status = RunStatus.PENDING,
            RanAt = DateTime.UtcNow,
            Duration = 0,
            CompiledCode = compiledCode,
            RawCode = rawCode
        });

        var serializedRuns = JsonConvert.SerializeObject(testRuns);

        await _cache.SetStringAsync(GetKey(userId), serializedRuns);
    }

    public async Task<List<TestRun>> Get(Guid userId, Guid fileId)
    {
        string cacheKey = GetKey(userId);

        var cachedItem = await _cache.GetStringAsync(cacheKey);
        if (string.IsNullOrEmpty(cachedItem)) return [];
        var testRuns = (JsonConvert.DeserializeObject<List<TestRun>>(cachedItem) ?? [])
                        .FindAll(run => run.FileId == fileId);
        foreach (var run in testRuns)
        {
            run.Duration = (long)(DateTime.UtcNow - run.RanAt).TotalMilliseconds;
        }

        return testRuns;
    }

    public async Task<TestRun?> GetRun(Guid userId, Guid runId)
    {
        string cacheKey = GetKey(userId);

        var cachedItem = await _cache.GetStringAsync(cacheKey);
        if (string.IsNullOrEmpty(cachedItem)) return null;
        var run = (JsonConvert.DeserializeObject<List<TestRun>>(cachedItem) ?? [])
                        .Find(run => run.Id == runId);
        return run;
    }

    public async Task Save(Guid userId, Guid runId, RunStatus status, long duration)
    {
        var testRuns = await Get(userId);

        var run = testRuns.Find(run => run.Id == runId);

        if (run is null) return;

        run.Status = status;
        run.Duration = duration;

        await testRepository.UploadTestRun(run);
    }

    public async Task Remove(Guid userId, Guid runId)
    {
        var testRuns = await Get(userId);

        var run = testRuns.Find(run => run.Id == runId);

        if (run is null) return;

        bool status = testRuns.Remove(run);

        var serializedRuns = JsonConvert.SerializeObject(testRuns);

        await _cache.SetStringAsync(GetKey(userId), serializedRuns);
    }

    private async Task<List<TestRun>> Get(Guid userId)
    {
        string cacheKey = GetKey(userId);

        var cachedItem = await _cache.GetStringAsync(cacheKey);
        if (string.IsNullOrEmpty(cachedItem)) return [];
        var testRuns = JsonConvert.DeserializeObject<List<TestRun>>(cachedItem) ?? [];

        return testRuns;
    }
}