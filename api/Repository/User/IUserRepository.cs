﻿namespace TestingPlatform.Repository.User;

using Microsoft.AspNetCore.JsonPatch;
using TestingPlatform.Models.User;

public interface IUserRepository
{
    User? GetUserById(Guid userId);
    User? GetByUserName(string userName);
    User? GetByEmail(string email);
    User? AuthenticateUser(string email, string password);
    IEnumerable<User> GetAllUsers();
    IEnumerable<User> GetUsers();
    Task AddUser(User user);
    Task DeleteUser(User user);
    bool IsValidEmail(string email);
    bool IsValidUserName(string userName);
    Task UpdateUser(User user, JsonPatchDocument<User> patchDoc);
}