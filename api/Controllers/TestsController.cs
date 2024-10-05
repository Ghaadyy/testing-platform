using Microsoft.AspNetCore.Mvc;
using RestrictedNL.Models;

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

    //TODO

    // [HttpPost("{fileName}/run")]
    // public IActionResult RunTestSuite(string fileName)
    // {
    //     // get the test suite / file
    //     // compile -> selenium
    //     // run the selenium code...
    //     // handle realtime updates
    //     // return Ok()

    //     return Ok();
    // }

    // [HttpGet("{fileName}/tests")]
    // public ActionResult<List<Test>> GetTests(string fileName)
    // {
    //     List<Test> tests = [];

    //     return Ok(tests);
    // }
}