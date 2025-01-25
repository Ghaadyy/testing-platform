using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using RestrictedNL.Models.Logs;
using RestrictedNL.Models.Test;
using RestrictedNL.Repository.Test;
using RestrictedNL.Services.Http;
using RestrictedNL.Services.Redis;
using RestrictedNL.Services.Test;
using RestrictedNL.Services.Token;

namespace RestrictedNL.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class RunsController(
    ITestRepository testRepository,
    ITokenService tokenService,
    RedisLogService logService,
    HttpService httpService,
    TestExecutionService executionService
    ) : ControllerBase
{

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

        var key = new LogKey(id.Value, file.Id);

        var logs = await logService.Get(key);
        if (!logs.IsNullOrEmpty()) return BadRequest("There is a test already running.");

        SetSSEHeaders(Response);

        httpService.Add(id.Value, run.FileId, Response);

        await executionService.RunCompiledAsync(id.Value, run);

        httpService.Remove(id.Value, run.FileId);

        return new EmptyResult();
    }

    private static void SetSSEHeaders(HttpResponse response)
    {
        response.ContentType = "text/event-stream";
        response.Headers.CacheControl = "no-cache";
        response.Headers.Connection = "keep-alive";
    }
}