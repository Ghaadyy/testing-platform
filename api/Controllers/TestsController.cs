using Microsoft.AspNetCore.Mvc;
using RestrictedNL.Models;

namespace RestrictedNL.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TestsController(ITestFileRepository repository) : ControllerBase
{
    private ITestFileRepository _repo = repository;

    [HttpGet("{fileName}")]
    public ActionResult<TestFile> GetTestFile(string fileName)
    {
        // Get the file and return the content
        var file = _repo.GetTestFile(fileName);
        if (file is null) return NotFound();
        return Ok(file);
    }

    [HttpPost("{fileName}")]
    public IActionResult PostTestFile(string fileName, [FromQuery] string content)
    {
        var file = _repo.GetTestFile(fileName);
        if (file is null)
        {
            _repo.UploadTestFile(fileName, content);
            return NoContent();
        }

        return BadRequest("File with this name already exists");
    }

    [HttpPut("{fileName}")]
    public IActionResult UpdateTestFile(string fileName, [FromQuery] string content)
    {
        var file = _repo.GetTestFile(fileName);

        if (file is null) return BadRequest("File with this name does not exist");

        _repo.UpdateTestFile(file, content);
        return NoContent();
    }

    [HttpPost("{fileName}/run")]
    public IActionResult RunTestSuite(string fileName)
    {
        // get the test suite / file
        // compile -> selenium
        // run the selenium code...
        // handle realtime updates
        // return Ok()

        return Ok();
    }

    [HttpGet("{fileName}/tests")]
    public ActionResult<List<Test>> GetTests(string fileName)
    {
        List<Test> tests = [];

        return Ok(tests);
    }
}