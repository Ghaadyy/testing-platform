namespace RestrictedNL.Models.Token;

using RestrictedNL.Models.User;

public record TokenReponse(string Token, User User);