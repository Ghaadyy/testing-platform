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

    [HttpGet("{fileName}")]
    public ActionResult<TestFile> GetTestFile(string fileName)
    {
        var id = tokenService.GetId(User);
        if (id is null) return NotFound("Could not find user with the specified id.");

        var file = testRepository.GetTestFile(fileName, id.Value);
        if (file is null) return NotFound();

        return Ok(file);
    }

    [HttpDelete("{fileName}")]
    public async Task<ActionResult<TestFile>> DeleteTestFile(string fileName)
    {
        var id = tokenService.GetId(User);
        if (id is null) return NotFound("Could not find user with the specified id.");

        var file = testRepository.GetTestFile(fileName, id.Value);
        if (file is null) return NotFound();

        await testRepository.DeleteTestFile(file);
        return NoContent();
    }

    [HttpPost]
    public async Task<IActionResult> PostTestFile([FromBody] TestFileDTO fileDTO)
    {
        var id = tokenService.GetId(User);
        if (id is null) return NotFound("Could not find user with the specified id.");

        var file = testRepository.GetTestFile(fileDTO.FileName, id.Value);
        if (file is null)
        {
            await testRepository.UploadTestFile(id.Value, fileDTO.FileName, fileDTO.Content);
            return NoContent();
        }

        return BadRequest("File with this name already exists");
    }

    [HttpPut]
    public async Task<IActionResult> UpdateTestFile([FromBody] TestFileDTO fileDTO)
    {
        var id = tokenService.GetId(User);
        if (id is null) return NotFound("Could not find user with the specified id.");

        var file = testRepository.GetTestFile(fileDTO.FileName, id.Value);
        if (file is null) return BadRequest("File with this name does not exist");

        await testRepository.UpdateTestFile(file, fileDTO.Content);
        return NoContent();
    }

    [HttpGet("{fileName}/run")]
    [AllowAnonymous]
    public async Task<IActionResult> Parse(string fileName)
    {
        var rawToken = Request.Query["token"].FirstOrDefault()?.Split(" ").Last();
        if (string.IsNullOrEmpty(rawToken))
        {
            return Unauthorized("Token is missing or invalid");
        }

        var token = tokenService.ParseToken(rawToken);
        if (token is null) return Unauthorized();

        var userId = tokenService.GetId(token);
        if (userId == null)
        {
            return Unauthorized("User is not authorized");
        }

        var testFile = testRepository.GetTestFile(fileName, (int)userId);
        if (testFile is null)
        {
            Console.WriteLine("Test file not found");
            return NotFound("Could not find test file");
        }

        SetSEEHeaders(Response);

        httpService.Add((int)userId, testFile.Id.ToString(), Response);

        await executionService.RunTestAsync(testFile, rawToken);

        httpService.Remove((int)userId, testFile.Id.ToString());

        return new EmptyResult();
    }

    [HttpGet("{fileName}/runs")]
    public ActionResult<List<TestRun>> GetTestsRuns(string fileName)
    {
        var userId = tokenService.GetId(User);
        if (userId == null)
        {
            return Unauthorized("User is not authorized");
        }

        var testFile = testRepository.GetTestFile(fileName, (int)userId);
        if (testFile is null)
        {
            Console.WriteLine("Test file not found");
            return NotFound("Could not find test file");
        }

        var testRuns = testRepository.GetTestRuns(testFile.Id);
        if (testRuns is null) return NotFound("Tests runs not found");

        return Ok(testRuns);
    }

    [HttpGet("{fileName}/reconnect")]
    [AllowAnonymous]
    public async Task<ActionResult> Reconnect(string fileName)
    {
        var rawToken = Request.Query["token"].FirstOrDefault()?.Split(" ").Last();
        if (string.IsNullOrEmpty(rawToken))
        {
            return Unauthorized("Token is missing or invalid");
        }

        var token = tokenService.ParseToken(rawToken);
        if (token is null) return Unauthorized();

        var userId = tokenService.GetId(token);
        if (userId == null)
        {
            return Unauthorized("User is not authorized");
        }

        var testFile = testRepository.GetTestFile(fileName, (int)userId);
        if (testFile is null)
        {
            Console.WriteLine("Test file not found");
            return NotFound("Could not find test file");
        }

        var testLogKey = new LogKey((int)userId, testFile.Id.ToString());
        var logs = await logService.Get(testLogKey);
        if (logs.IsNullOrEmpty())
        {
            Console.WriteLine($"No running test to reconnect for test file '{fileName}' and user {userId}");
            return BadRequest("No running test to reconnect.");
        }
        else
        {
            SetSEEHeaders(Response);
            httpService.Add((int)userId, testFile.Id.ToString(), Response);
            await httpService.SendSseMessage((int)userId, testFile.Id.ToString(), logs);
            Console.WriteLine($"Reconnected to test file '{fileName}' for user {userId}");

            try
            {
                while (httpService.Get((int)userId, testFile.Id.ToString()) is not null)
                {
                    await Task.Delay(1000);
                }
            }
            finally
            {
                httpService.Remove((int)userId, testFile.Id.ToString());
                Console.WriteLine($"Connection closed for test file '{fileName}' and user {userId}");
            }
        }

        return new EmptyResult();
    }

    [HttpPost("{fileName}/cleanup")]
    public ActionResult CleanupSSE(string fileName)
    {
        var userId = tokenService.GetId(User);
        if (userId == null)
        {
            return Unauthorized("User is not authorized");
        }

        var testFile = testRepository.GetTestFile(fileName, (int)userId);
        if (testFile is null)
        {
            Console.WriteLine("Test file not found");
            return NotFound("Could not find test file");
        }

        httpService.Remove((int)userId, testFile.Id.ToString());

        return NoContent();
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

        var testFile = testRepository.GetTestFile(testRun.FileId.ToString(), (int)userId);

        if (testFile is null)
        {
            return NotFound("Test file not found for this run");
        }

        SetSEEHeaders(Response);

        httpService.Add((int)userId, testRun.FileId.ToString(), Response);

        await executionService.RunCompiledTestAsync((int)userId, testRun, testFile.Content, rawToken);

        httpService.Remove((int)userId, testRun.FileId.ToString());

        return new EmptyResult();
    }

    private static void SetSEEHeaders(HttpResponse response)
    {
        response.ContentType = "text/event-stream";
        response.Headers.CacheControl = "no-cache";
        response.Headers.Connection = "keep-alive";
    }
}