using Microsoft.AspNetCore.Mvc;
using RestrictedNL.Models;
using RestrictedNL.Services;

namespace RestrictedNL.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TestsController(ITestsRepository testsRepository, TestExecutionService testExecutionService) : ControllerBase
{
    private readonly ITestsRepository _testsRepository = testsRepository;
    private readonly TestExecutionService _testExecutionService = testExecutionService;
    private const string userId = "userId";

    [HttpGet]
    public ActionResult<List<TestFile>> GetTestFiles()
    {
        var files = _testsRepository.GetTestFiles();
        return Ok(files);
    }

    [HttpGet("{fileName}")]
    public ActionResult<TestFile> GetTestFile(string fileName)
    {
        var file = _testsRepository.GetTestFile(fileName);
        if (file is null) return NotFound();
        return Ok(file);
    }

    [HttpDelete("{fileName}")]
    public async Task<ActionResult<TestFile>> DeleteTestFile(string fileName)
    {
        var file = _testsRepository.GetTestFile(fileName);
        if (file is null) return NotFound();
        await _testsRepository.DeleteTestFile(file);
        return NoContent();
    }

    [HttpPost]
    public async Task<IActionResult> PostTestFile([FromBody] TestFileDTO fileDTO)
    {
        var file = _testsRepository.GetTestFile(fileDTO.FileName);
        if (file is null)
        {
            await _testsRepository.UploadTestFile(fileDTO.FileName, fileDTO.Content);
            return NoContent();
        }

        return BadRequest("File with this name already exists");
    }

    [HttpPut]
    public async Task<IActionResult> UpdateTestFile([FromBody] TestFileDTO fileDTO)
    {
        var file = _testsRepository.GetTestFile(fileDTO.FileName);

        if (file is null) return BadRequest("File with this name does not exist");

        await _testsRepository.UpdateTestFile(file, fileDTO.Content);
        return NoContent();
    }

    [HttpGet("{fileName}/run")]
    public async Task<IActionResult> Parse(string fileName)
    {
        if (HttpContext.WebSockets.IsWebSocketRequest)
        {
            using var socket = await HttpContext.WebSockets.AcceptWebSocketAsync();

            await _testExecutionService.RunTestAsync(socket, fileName, userId);
            return new EmptyResult();
        }

        return BadRequest("This should be a WebSocket connection");
    }

    [HttpGet("{fileName}/runs")]
    public ActionResult<List<TestRun>> GetTestsRuns(string fileName)
    {
        var testRuns = _testsRepository.GetTestRuns(fileName);

        if (testRuns is null) return NotFound("Tests runs not found");

        return Ok(testRuns);
    }

    [HttpGet("{runId}/compiled/run")]
    public async Task<IActionResult> RunCompiled(int runId)
    {
        if (HttpContext.WebSockets.IsWebSocketRequest)
        {
            using var socket = await HttpContext.WebSockets.AcceptWebSocketAsync();

            await _testExecutionService.RunCompiledTestAsync(socket, userId, runId);
            return new EmptyResult();
        }

        return BadRequest("This should be a WebSocket connection");
    }
}