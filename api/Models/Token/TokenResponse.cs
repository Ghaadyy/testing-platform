using RestrictedNL.Models.User;

namespace RestrictedNL.Models.Token;

public record TokenReponse(string Token, User.User User);