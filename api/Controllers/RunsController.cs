using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RestrictedNL.Models.Test;
using RestrictedNL.Repository.Test;
using RestrictedNL.Services.Token;

namespace RestrictedNL.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class RunsController(
    ITestRepository testRepository,
    ITokenService tokenService
    ) : ControllerBase
{

    [HttpGet("{runId}/logs")]
    public ActionResult<List<TestRun>> GetRunLogs(Guid runId)
    {
        var userId = tokenService.GetId(User);
        if (userId == null)
        {
            return Unauthorized("User is not authorized");
        }

        var testRun = testRepository.GetTestRun(runId);
        if (testRun is null)
        {
            return NotFound("Could not find test run");
        }

        var logs = testRepository.GetLogs(runId);

        return Ok(logs);
    }
}