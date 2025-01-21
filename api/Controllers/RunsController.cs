using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
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
        var userId = tokenService.GetId(User);
        if (userId == null)
        {
            return Unauthorized("User is not authorized");
        }

        var testRun = testRepository.GetTestRun(runId);
        if (testRun is null)
        {
            return NotFound("Could not find test run");
        }

        var logs = testRepository.GetLogs(runId);

        return Ok(logs);
    }

    [HttpGet("{runId}/compiled/run")]
    [AllowAnonymous]
    public async Task<IActionResult> RunCompiled(Guid runId)
    {
        var rawToken = Request.Query["token"].FirstOrDefault()?.Split(" ").Last();
        if (string.IsNullOrEmpty(rawToken))
        {
            return Unauthorized("Token is missing or invalid");
        }

        var token = tokenService.ParseToken(rawToken);
        if (token is null)
        {
            return Unauthorized();
        }

        var userId = tokenService.GetId(token);
        if (userId == null)
        {
            return Unauthorized("User is not authorized");
        }

        var testRun = testRepository.GetTestRun(runId);

        if (testRun is null)
        {
            return NotFound("Run not found");
        }

        var testFile = testRepository.GetTestFile(testRun.FileId, userId.Value);

        if (testFile is null)
        {
            return NotFound("Test file not found for this run");
        }

        var testLogKey = new LogKey(userId.Value, testFile.Id);
        var logs = await logService.Get(testLogKey);
        if (logs is not null && logs.Count != 0)
        {
            return BadRequest("There is a test already running.");
        }

        SetSEEHeaders(Response);

        httpService.Add(userId.Value, testRun.FileId, Response);

        await executionService.RunCompiledTestAsync(userId.Value, testRun, testFile.Content, rawToken);

        httpService.Remove(userId.Value, testRun.FileId);

        return new EmptyResult();
    }

    private static void SetSEEHeaders(HttpResponse response)
    {
        response.ContentType = "text/event-stream";
        response.Headers.CacheControl = "no-cache";
        response.Headers.Connection = "keep-alive";
    }
}