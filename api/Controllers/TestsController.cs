using Microsoft.AspNetCore.Mvc;
using RestrictedNL.Models;
using RestrictedNL.Compiler;
using System.Diagnostics;

namespace RestrictedNL.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TestsController(ITestFileRepository testFileRepository) : ControllerBase
{
    private ITestFileRepository _testFileRepo = testFileRepository;

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
    public async Task<IActionResult> parse(string fileName)
    {
        //The parser must return success or error message

        // get the test suite / file
        // compile -> selenium
        // run the selenium code...
        // handle realtime updates

        var file = _testFileRepo.GetTestFile(fileName);

        if (file is null) return NotFound("File not found");

        var status = Parser.parse(file.Content, out string seleniumCode);

        if (!status) return BadRequest("Could not compile test file.");

        string tempFilePath = Path.GetTempFileName() + ".mjs";

        System.IO.File.WriteAllText(tempFilePath, seleniumCode);

        var startInfo = new ProcessStartInfo
        {
            FileName = OperatingSystem.IsWindows() ? "mocha.cmd" : "mocha", // use .cmd for Windows
            Arguments = $"{tempFilePath}",
            RedirectStandardOutput = true,
            RedirectStandardError = true,
            UseShellExecute = false,
            CreateNoWindow = false,
        };

        using var process = Process.Start(startInfo);

        if (process is null) return StatusCode(500, "Could not run test file.");

        await process.WaitForExitAsync();

        System.IO.File.Delete(tempFilePath);

        // get the selenium code
        // run the selenium code and update the user at each step
        // Save the test results in the db
        // filename | date | test-results

        return Ok("Tests ran succesfully");
    }

    //TODO

    // [HttpGet("{fileName}/tests")]
    // public ActionResult<List<Test>> GetTests(string fileName)
    // {
    //     List<Test> tests = [];

    //     return Ok(tests);
    // }


    // 1. translate compiled code into selenium
    // 2. run selenium and show tests results
    // 3. Error handling 
    // 4. (Step Z) Syntax highlighting
}