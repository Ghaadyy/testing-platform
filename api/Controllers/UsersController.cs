using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.JsonPatch;
using RestrictedNL.Models.Token;
using RestrictedNL.Models.User;
using RestrictedNL.Services.Token;
using RestrictedNL.Repository.User;

namespace RestrictedNL.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UsersController(
    ITokenService tokenService,
    IUserRepository userRepository
    ) : ControllerBase
{
    [HttpGet]
    public ActionResult<IEnumerable<User>> Get()
    {
        var users = userRepository.GetUsers();
        return Ok(users);
    }

    [HttpGet("{userId}")]
    public ActionResult<User> Get(Guid userId)
    {
        var user = userRepository.GetUserById(userId);
        if (user is null) return NotFound("User not found");
        return Ok(user);
    }

    [HttpGet("me")]
    public ActionResult<User> GetUserInfo()
    {
        var id = tokenService.GetId(User);
        if (id is null) return BadRequest("User ID missing from token");

        User? user = userRepository.GetUserById(id.Value);
        if (user is null) return NotFound("User not found");

        return Ok(user);
    }

    [HttpPost("login")]
    [AllowAnonymous]
    public ActionResult<TokenReponse> Login([FromBody] LoginModel model)
    {
        var user = userRepository.GetByEmail(model.Email);
        if (user is null) return NotFound("Invalid email.");

        if (!BCrypt.Net.BCrypt.Verify(model.Password, user.Password))
            return NotFound("Invalid password.");

        var token = tokenService.GenerateToken(user);

        return Ok(new TokenReponse(token, user));
    }

    [HttpPost("signup")]
    [AllowAnonymous]
    public async Task<ActionResult<TokenReponse>> SignUp([FromBody] SignUpModel model)
    {
        if (!userRepository.IsValidUserName(model.UserName))
            return BadRequest("User with the same username already exists");

        if (!userRepository.IsValidEmail(model.Email))
            return BadRequest("User with the same email already exists");

        var hashedPassword = BCrypt.Net.BCrypt.HashPassword(model.Password);

        var user = new User
        {
            FirstName = model.FirstName,
            LastName = model.LastName,
            Email = model.Email,
            UserName = model.UserName,
            Password = hashedPassword,
        };

        await userRepository.AddUser(user);

        var token = tokenService.GenerateToken(user);

        return Ok(new TokenReponse(token, user));
    }

    [HttpPatch]
    public async Task<ActionResult<User>> Update([FromBody] JsonPatchDocument<User> patchDoc)
    {
        var id = tokenService.GetId(User);
        if (id is null) return BadRequest("User ID missing from token");

        User? user = userRepository.GetUserById(id.Value);
        if (user is null) return NotFound("Invalid user id.");

        patchDoc.ApplyTo(user);

        // Validate the user, because when passing JsonPatchDocument,
        // the underlying user object was not properly validated
        TryValidateModel(user);

        if (!ModelState.IsValid)
            return BadRequest("Invalid parameters");

        await userRepository.UpdateUser(user, patchDoc);

        return Ok(user);
    }

    public async Task<ActionResult<User>> Delete()
    {
        var id = tokenService.GetId(User);
        if (id is null) return BadRequest("User ID missing from token");

        User? user = userRepository.GetUserById(id.Value);
        if (user is null) return NotFound("Invalid user id.");

        await userRepository.DeleteUser(user);

        return Ok(user);
    }
}