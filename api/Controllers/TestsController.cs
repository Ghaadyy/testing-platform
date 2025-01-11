using System.Text;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RestrictedNL.Models;
using RestrictedNL.Models.Token;
using RestrictedNL.Services;

namespace RestrictedNL.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TestsController(
    ITestsRepository testsRepository,
    TestExecutionService testExecutionService,
    ITokenRepository tokenRepository
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
        if (HttpContext.WebSockets.IsWebSocketRequest)
        {
            using var socket = await HttpContext.WebSockets.AcceptWebSocketAsync();

            byte[] buff = new byte[1024 * 4];
            var result = await socket.ReceiveAsync(new(buff), CancellationToken.None);
            var rawToken = Encoding.UTF8.GetString(buff, 0, result.Count);
            var token = tokenRepository.ParseToken(rawToken);

            var id = tokenRepository.GetId(token!);
            if (id is null) return NotFound("Could not find user with the specified id.");

            await testExecutionService.RunTestAsync(socket, fileName, id.Value, rawToken);
            return new EmptyResult();
        }

        return BadRequest("This should be a WebSocket connection");
    }

    [HttpGet("{fileName}/runs")]
    public ActionResult<List<TestRun>> GetTestsRuns(string fileName)
    {
        var testRuns = testsRepository.GetTestRuns(fileName);
        if (testRuns is null) return NotFound("Tests runs not found");

        return Ok(testRuns);
    }

    [HttpGet("{runId}/compiled/run")]
    [AllowAnonymous]
    public async Task<IActionResult> RunCompiled(int runId)
    {
        if (HttpContext.WebSockets.IsWebSocketRequest)
        {
            using var socket = await HttpContext.WebSockets.AcceptWebSocketAsync();

            byte[] buff = new byte[1024 * 4];
            var result = await socket.ReceiveAsync(new(buff), CancellationToken.None);
            var rawToken = Encoding.UTF8.GetString(buff, 0, result.Count);
            var token = tokenRepository.ParseToken(rawToken);

            var id = tokenRepository.GetId(token!);
            if (id is null) return NotFound("Could not find user with the specified id.");

            await testExecutionService.RunCompiledTestAsync(socket, id.Value, runId, rawToken);
            return new EmptyResult();
        }

        return BadRequest("This should be a WebSocket connection");
    }
}