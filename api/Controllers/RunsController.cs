using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RestrictedNL.Models;
using RestrictedNL.Models.Token;

namespace RestrictedNL.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class RunsController(
    ITestsRepository testsRepository,
    ITokenRepository tokenRepository
    ) : ControllerBase
{

    [HttpGet("{runId}/logs")]
    public ActionResult<List<TestRun>> GetRunLogs(Guid runId)
    {
        var userId = tokenRepository.GetId(User);
        if (userId == null)
        {
            return Unauthorized("User is not authorized");
        }

        var testRun = testsRepository.GetTestRun(runId);
        if (testRun is null)
        {
            return NotFound("Could not find test run");
        }

        var logs = testsRepository.GetLogs(runId);

        return Ok(logs);
    }
}