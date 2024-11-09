using Microsoft.AspNetCore.Mvc;
using RestrictedNL.Models;
using RestrictedNL.Compiler;
using System.Diagnostics;

namespace RestrictedNL.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TestsController(
    ITestFileRepository testFileRepository,
    ICompiledTestRepository compiledTestRepository,
    ITestRunRepository testRunRepository) : ControllerBase
{
    private ITestFileRepository _testFileRepo = testFileRepository;
    private ICompiledTestRepository _compiledTestRepository = compiledTestRepository;
    private ITestRunRepository _testRunRepository = testRunRepository;

    [HttpGet("{fileName}")]
    public ActionResult<TestFile> GetTestFile(string fileName)
    {
        var file = _testFileRepo.GetTestFile(fileName);
        if (file is null) return NotFound();
        return Ok(file);
    }

    [HttpPost]
    public IActionResult PostTestFile([FromBody] TestFileDTO fileDTO)
    {
        var file = _testFileRepo.GetTestFile(fileDTO.FileName);
        if (file is null)
        {
            _testFileRepo.UploadTestFile(fileDTO.FileName, fileDTO.Content);
            return NoContent();
        }

        return BadRequest("File with this name already exists");
    }

    [HttpPut]
    public IActionResult UpdateTestFile([FromBody] TestFileDTO fileDTO)
    {
        var file = _testFileRepo.GetTestFile(fileDTO.FileName);

        if (file is null) return BadRequest("File with this name does not exist");

        _testFileRepo.UpdateTestFile(file, fileDTO.Content);
        return NoContent();
    }

    [HttpPost("{fileName}/run")]
    public async Task<IActionResult> Parse(string fileName)
    {
        var file = _testFileRepo.GetTestFile(fileName);

        if (file is null) return NotFound("File not found");

        var status = Parser.parse(file.Content, out string seleniumCode);

        if (!status) return BadRequest("Could not compile test file.");

        await _compiledTestRepository.UploadCompiledTest(fileName, seleniumCode);

        string tempFilePath = Path.GetTempFileName() + ".js";

        System.IO.File.WriteAllText(tempFilePath, Parser.wrapWithSockets(seleniumCode));

        Stopwatch stopwatch = new();

        var startInfo = new ProcessStartInfo
        {
            FileName = OperatingSystem.IsWindows() ? "mocha.cmd" : "mocha", // use .cmd for Windows
            Arguments = $"{tempFilePath}",
            UseShellExecute = false,
            CreateNoWindow = true,
        };

        stopwatch.Start();
        using var process = Process.Start(startInfo);

        if (process is null) return StatusCode(500, "Could not run test file.");

        await process.WaitForExitAsync();
        stopwatch.Stop();

        System.IO.File.Delete(tempFilePath);

        await _testRunRepository.UploadTestRun(new TestRun
        {
            Name = fileName,
            Passed = true,
            RanAt = DateTime.Now.ToString(),
            Duration = stopwatch.ElapsedMilliseconds,
            CompiledCode = seleniumCode,
        });

        return Ok("Tests ran succesfully");
    }

    [HttpGet("{fileName}/runs")]
    public ActionResult<List<TestRun>> GetTestsRuns(string fileName)
    {
        var testRuns = _testRunRepository.GetTestRuns(fileName);

        if (testRuns is null) return NotFound("Tests runs not found");

        return Ok(testRuns);
    }

    [HttpPost("{runId}/compiled/run")]
    public async Task<IActionResult> RunCompiled(int runId)
    {
        var testRun = _testRunRepository.GetTestRun(runId);

        if (testRun is null) return NotFound("File not found");

        string seleniumCode = testRun.CompiledCode;

        string tempFilePath = Path.GetTempFileName() + ".js";

        System.IO.File.WriteAllText(tempFilePath, Parser.wrapWithSockets(seleniumCode));

        Stopwatch stopwatch = new();

        var startInfo = new ProcessStartInfo
        {
            FileName = OperatingSystem.IsWindows() ? "mocha.cmd" : "mocha", // use .cmd for Windows
            Arguments = $"{tempFilePath}",
            UseShellExecute = false,
            CreateNoWindow = false,
        };

        stopwatch.Start();
        using var process = Process.Start(startInfo);

        if (process is null) return StatusCode(500, "Could not run test file.");

        await process.WaitForExitAsync();
        stopwatch.Stop();

        System.IO.File.Delete(tempFilePath);

        await _testRunRepository.UploadTestRun(new TestRun
        {
            Name = testRun.Name,
            Passed = true,
            RanAt = DateTime.Now.ToString(),
            Duration = stopwatch.ElapsedMilliseconds,
            CompiledCode = seleniumCode,
        });

        return Ok("Tests ran succesfully");
    }
}