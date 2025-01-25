using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using RestrictedNL.Services.Redis;
using RestrictedNL.Models.Logs;
using RestrictedNL.Services.Test;
using RestrictedNL.Repository.Test;
using RestrictedNL.Services.Token;
using RestrictedNL.Models.Test;
using RestrictedNL.Services.Http;

namespace RestrictedNL.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TestsController(
    ITestRepository testRepository,
    TestExecutionService executionService,
    ITokenService tokenService,
    HttpService httpService,
    RedisLogService logService
    ) : ControllerBase
{
    [HttpGet]
    public ActionResult<List<TestFile>> GetTestFiles()
    {
        var id = tokenService.GetId(User);
        if (id is null) return NotFound("Could not find user with the specified id.");

        var files = testRepository.GetTestFiles(id.Value);
        return Ok(files);
    }

    [HttpGet("{fileId}")]
    public ActionResult<TestFile> GetTestFile(Guid fileId)
    {
        var id = tokenService.GetId(User);
        if (id is null) return NotFound("Could not find user with the specified id.");

        var file = testRepository.GetTestFile(fileId, id.Value);
        if (file is null) return NotFound();

        return Ok(file);
    }

    [HttpDelete("{fileId}")]
    public async Task<ActionResult<TestFile>> DeleteTestFile(Guid fileId)
    {
        var id = tokenService.GetId(User);
        if (id is null) return NotFound("Could not find user with the specified id.");

        var file = testRepository.GetTestFile(fileId, id.Value);
        if (file is null) return NotFound();

        await testRepository.DeleteTestFile(file);
        return NoContent();
    }

    [HttpPost]
    public async Task<ActionResult<TestFile>> PostTestFile([FromBody] TestFileDTO fileDTO)
    {
        var id = tokenService.GetId(User);
        if (id is null) return NotFound("Could not find user with the specified id.");

        var file = testRepository.GetTestFileByName(fileDTO.FileName, id.Value);
        if (file is not null) return BadRequest("File with this name already exists");

        var createdFile = await testRepository.UploadTestFile(id.Value, fileDTO.FileName, fileDTO.Content);
        return Ok(createdFile);
    }

    [HttpPut("{fileId}")]
    public async Task<ActionResult<TestFile>> UpdateTestFile(Guid fileId, [FromBody] TestFileDTO fileDTO)
    {
        var id = tokenService.GetId(User);
        if (id is null) return NotFound("Could not find user with the specified id.");

        var file = testRepository.GetTestFile(fileId, id.Value);
        if (file is null) return BadRequest("File with this name does not exist");

        var updatedFile = await testRepository.UpdateTestFile(file, fileDTO.Content);
        return Ok(updatedFile);
    }

    [HttpGet("{fileId}/run")]
    public async Task<IActionResult> Run(Guid fileId)
    {
        var id = tokenService.GetId(User);
        if (id is null) return Unauthorized();

        var file = testRepository.GetTestFile(fileId, id.Value);
        if (file is null) return NotFound("Could not find test file");

        var key = new LogKey(id.Value, file.Id);
        var logs = await logService.Get(key);
        if (!logs.IsNullOrEmpty()) return BadRequest("There is a test already running.");

        SetSSEHeaders(Response);

        httpService.Add(id.Value, file.Id, Response);

        await executionService.RunAsync(file);

        httpService.Remove(id.Value, file.Id);

        return new EmptyResult();
    }

    [HttpGet("{fileId}/runs")]
    public ActionResult<List<TestRun>> GetTestsRuns(Guid fileId)
    {
        var id = tokenService.GetId(User);
        if (id == null) return Unauthorized("User is not authorized");

        var file = testRepository.GetTestFile(fileId, id.Value);
        if (file is null) return NotFound("Could not find test file");

        var runs = testRepository.GetTestRuns(file.Id);
        if (runs is null) return NotFound("Tests runs not found");

        return Ok(runs);
    }

    [HttpGet("{fileId}/reconnect")]
    public async Task<ActionResult> Reconnect(Guid fileId)
    {
        var id = tokenService.GetId(User);
        if (id is null) return Unauthorized("User is unauthorized");

        var file = testRepository.GetTestFile(fileId, id.Value);
        if (file is null) return NotFound("Could not find test file");

        var key = new LogKey(id.Value, file.Id);
        var logs = await logService.Get(key);
        if (logs.IsNullOrEmpty()) return BadRequest("No running test to reconnect.");

        SetSSEHeaders(Response);
        httpService.Add(id.Value, file.Id, Response);
        await httpService.SendSseMessage(id.Value, file.Id, logs);

        try
        {
            while (httpService.Get(id.Value, file.Id) is not null)
                await Task.Delay(1000);
        }
        finally
        {
            httpService.Remove(id.Value, file.Id);
        }

        return new EmptyResult();
    }

    [HttpPost("{fileId}/cleanup")]
    public ActionResult CleanupSSE(Guid fileId)
    {
        var id = tokenService.GetId(User);
        if (id == null) return Unauthorized("User is not authorized");

        var file = testRepository.GetTestFile(fileId, id.Value);
        if (file is null) return NotFound("Could not find test file");

        httpService.Remove(id.Value, file.Id);

        return NoContent();
    }

    private static void SetSSEHeaders(HttpResponse response)
    {
        response.ContentType = "text/event-stream";
        response.Headers.CacheControl = "no-cache";
        response.Headers.Connection = "keep-alive";
    }
}