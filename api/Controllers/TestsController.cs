using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using RestrictedNL.Models;
using RestrictedNL.Models.Redis;
using RestrictedNL.Models.Token;
using RestrictedNL.Models.Logs;
using RestrictedNL.Services;

namespace RestrictedNL.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TestsController(
    ITestsRepository testsRepository,
    TestExecutionService testExecutionService,
    ITokenRepository tokenRepository,
    HttpRepository httpRepository,
    RedisLogsRepository logsRepository
    ) : ControllerBase
{
    [HttpGet]
    public ActionResult<List<TestFile>> GetTestFiles()
    {
        var id = tokenRepository.GetId(User);
        if (id is null) return NotFound("Could not find user with the specified id.");

        var files = testsRepository.GetTestFiles(id.Value);
        return Ok(files);
    }

    [HttpGet("{fileName}")]
    public ActionResult<TestFile> GetTestFile(string fileName)
    {
        var id = tokenRepository.GetId(User);
        if (id is null) return NotFound("Could not find user with the specified id.");

        var file = testsRepository.GetTestFile(fileName, id.Value);
        if (file is null) return NotFound();

        return Ok(file);
    }

    [HttpDelete("{fileName}")]
    public async Task<ActionResult<TestFile>> DeleteTestFile(string fileName)
    {
        var id = tokenRepository.GetId(User);
        if (id is null) return NotFound("Could not find user with the specified id.");

        var file = testsRepository.GetTestFile(fileName, id.Value);
        if (file is null) return NotFound();

        await testsRepository.DeleteTestFile(file);
        return NoContent();
    }

    [HttpPost]
    public async Task<IActionResult> PostTestFile([FromBody] TestFileDTO fileDTO)
    {
        var id = tokenRepository.GetId(User);
        if (id is null) return NotFound("Could not find user with the specified id.");

        var file = testsRepository.GetTestFile(fileDTO.FileName, id.Value);
        if (file is null)
        {
            await testsRepository.UploadTestFile(id.Value, fileDTO.FileName, fileDTO.Content);
            return NoContent();
        }

        return BadRequest("File with this name already exists");
    }

    [HttpPut]
    public async Task<IActionResult> UpdateTestFile([FromBody] TestFileDTO fileDTO)
    {
        var id = tokenRepository.GetId(User);
        if (id is null) return NotFound("Could not find user with the specified id.");

        var file = testsRepository.GetTestFile(fileDTO.FileName, id.Value);
        if (file is null) return BadRequest("File with this name does not exist");

        await testsRepository.UpdateTestFile(file, fileDTO.Content);
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

        var token = tokenRepository.ParseToken(rawToken);
        if (token is null) return Unauthorized();

        var userId = tokenRepository.GetId(token);
        if (userId == null)
        {
            return Unauthorized("User is not authorized");
        }

        var testFile = testsRepository.GetTestFile(fileName, (int)userId);
        if (testFile is null)
        {
            Console.WriteLine("Test file not found");
            return NotFound("Could not find test file");
        }

        SetSEEHeaders(Response);

        httpRepository.Add((int)userId, testFile.Id.ToString(), Response);

        await testExecutionService.RunTestAsync(testFile, rawToken);

        httpRepository.Remove((int)userId, testFile.Id.ToString());

        return new EmptyResult();
    }

    [HttpGet("{fileName}/runs")]
    public ActionResult<List<TestRun>> GetTestsRuns(string fileName)
    {
        var userId = tokenRepository.GetId(User);
        if (userId == null)
        {
            return Unauthorized("User is not authorized");
        }

        var testFile = testsRepository.GetTestFile(fileName, (int)userId);
        if (testFile is null)
        {
            Console.WriteLine("Test file not found");
            return NotFound("Could not find test file");
        }

        var testRuns = testsRepository.GetTestRuns(testFile.Id);
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

        var token = tokenRepository.ParseToken(rawToken);
        if (token is null) return Unauthorized();

        var userId = tokenRepository.GetId(token);
        if (userId == null)
        {
            return Unauthorized("User is not authorized");
        }

        var testFile = testsRepository.GetTestFile(fileName, (int)userId);
        if (testFile is null)
        {
            Console.WriteLine("Test file not found");
            return NotFound("Could not find test file");
        }

        var testLogKey = new LogKey((int)userId, testFile.Id.ToString());
        var logs = await logsRepository.Get(testLogKey);
        if (logs.IsNullOrEmpty())
        {
            Console.WriteLine($"No running test to reconnect for test file '{fileName}' and user {userId}");
            return BadRequest("No running test to reconnect.");
        }
        else
        {
            SetSEEHeaders(Response);
            httpRepository.Add((int)userId, testFile.Id.ToString(), Response);
            await httpRepository.SendSseMessage((int)userId, testFile.Id.ToString(), logs);
            Console.WriteLine($"Reconnected to test file '{fileName}' for user {userId}");

            try
            {
                while (httpRepository.Get((int)userId, testFile.Id.ToString()) is not null)
                {
                    await Task.Delay(1000);
                }
            }
            finally
            {
                httpRepository.Remove((int)userId, testFile.Id.ToString());
                Console.WriteLine($"Connection closed for test file '{fileName}' and user {userId}");
            }
        }

        return new EmptyResult();
    }

    [HttpPost("{fileName}/cleanup")]
    public ActionResult CleanupSSE(string fileName)
    {
        var userId = tokenRepository.GetId(User);
        if (userId == null)
        {
            return Unauthorized("User is not authorized");
        }

        var testFile = testsRepository.GetTestFile(fileName, (int)userId);
        if (testFile is null)
        {
            Console.WriteLine("Test file not found");
            return NotFound("Could not find test file");
        }

        httpRepository.Remove((int)userId, testFile.Id.ToString());

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

        var token = tokenRepository.ParseToken(rawToken);
        if (token is null)
        {
            return Unauthorized();
        }

        var userId = tokenRepository.GetId(token);
        if (userId == null)
        {
            return Unauthorized("User is not authorized");
        }

        var testRun = testsRepository.GetTestRun(runId);

        if (testRun is null)
        {
            return NotFound("Run not found");
        }

        SetSEEHeaders(Response);

        httpRepository.Add((int)userId, testRun.FileId.ToString(), Response);

        await testExecutionService.RunCompiledTestAsync((int)userId, testRun, rawToken);

        httpRepository.Remove((int)userId, testRun.FileId.ToString());

        return new EmptyResult();
    }

    private static void SetSEEHeaders(HttpResponse response)
    {
        response.ContentType = "text/event-stream";
        response.Headers.CacheControl = "no-cache";
        response.Headers.Connection = "keep-alive";
    }
}