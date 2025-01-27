using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RestrictedNL.Services.Redis;
using RestrictedNL.Services.Test;
using RestrictedNL.Repository.Test;
using RestrictedNL.Services.Token;
using RestrictedNL.Models.Test;

namespace RestrictedNL.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TestsController(
    ITestRepository testRepository,
    TestExecutionService executionService,
    ITokenService tokenService,
    RedisRunService runService
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

        var (run, errors) = await executionService.RunAsync(file);

        if (errors.Count == 0) return Ok(run);
        else return BadRequest(errors);
    }

    [HttpGet("{fileId}/runs")]
    public async Task<ActionResult<List<TestRun>>> GetTestsRuns(Guid fileId)
    {
        var id = tokenService.GetId(User);
        if (id is null) return Unauthorized("User is not authorized");

        var file = testRepository.GetTestFile(fileId, id.Value);
        if (file is null) return NotFound("Could not find test file");

        var runs = testRepository.GetTestRuns(file.Id);
        runs.AddRange(await runService.Get(id.Value, fileId));

        return Ok(runs);
    }
}