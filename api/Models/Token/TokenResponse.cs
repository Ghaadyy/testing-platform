namespace TestingPlatform.Models.Token;

using TestingPlatform.Models.User;

public record TokenReponse(string Token, User User);