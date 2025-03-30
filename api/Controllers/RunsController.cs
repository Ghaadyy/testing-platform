using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using TestingPlatform.Models.Logs;
using TestingPlatform.Models.Test;
using TestingPlatform.Repository.Test;
using TestingPlatform.Services.Http;
using TestingPlatform.Services.Redis;
using TestingPlatform.Services.Test;
using TestingPlatform.Services.Token;

namespace TestingPlatform.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class RunsController(
    ITestRepository testRepository,
    ITokenService tokenService,
    TestExecutionService executionService,
    HttpService httpService,
    RedisLogService logService,
    RedisRunService runService
    ) : ControllerBase
{
    [HttpGet("{runId}")]
    public ActionResult<TestRun> GetRun(Guid runId)
    {
        var id = tokenService.GetId(User);
        if (id is null) return Unauthorized("User is not authorized");

        var run = testRepository.GetTestRun(runId);
        if (run is null) return NotFound("Could not find test run");

        return Ok(run);
    }


    [HttpGet("{runId}/logs")]
    public ActionResult<List<TestRun>> GetRunLogs(Guid runId)
    {
        var id = tokenService.GetId(User);
        if (id is null) return Unauthorized("User is not authorized");

        var run = testRepository.GetTestRun(runId);
        if (run is null) return NotFound("Could not find test run");

        var logs = testRepository.GetLogs(runId);
        return Ok(logs);
    }

    [HttpGet("{runId}/compiled/run")]
    public async Task<IActionResult> RunCompiled(Guid runId)
    {
        var id = tokenService.GetId(User);
        if (id is null) return Unauthorized("User is unauthorized");

        var run = testRepository.GetTestRun(runId);
        if (run is null) return NotFound("Run not found");

        var file = testRepository.GetTestFile(run.FileId, id.Value);
        if (file is null) return NotFound("Test file not found for this run");

        var newRun = await executionService.RunCompiledAsync(id.Value, run);

        return Ok(newRun);
    }

    [HttpGet("{runId}/connect")]
    public async Task<ActionResult> Connect(Guid runId)
    {
        var id = tokenService.GetId(User);
        if (id is null) return Unauthorized("User is unauthorized");

        var run = await runService.Get(id.Value, runId);
        if (run is null) return BadRequest("Invalid run id");

        var key = new LogKey(id.Value, runId);
        var logs = await logService.Get(key);

        SetSSEHeaders(Response);
        httpService.Add(id.Value, runId, Response);
        await httpService.SendSseMessage(id.Value, runId, logs);

        while (httpService.Get(id.Value, runId) == Response && !Response.HttpContext.RequestAborted.IsCancellationRequested)
            await Task.Delay(1000);

        return new EmptyResult();
    }

    private static void SetSSEHeaders(HttpResponse response)
    {
        response.ContentType = "text/event-stream";
        response.Headers.CacheControl = "no-cache";
        response.Headers.Connection = "keep-alive";
    }
}