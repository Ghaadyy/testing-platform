using Microsoft.AspNetCore.JsonPatch;
using RestrictedNL.Context;

namespace RestrictedNL.Models.User;

public class UserRepository(TestContext context) : IUserRepository
{
    public IEnumerable<User> GetAllUsers() => context.Users;

    public IEnumerable<User> GetUsers() => context.Users;

    public User? GetUserById(int userId)
        => (from u in context.Users
            where u.Id == userId
            select u).FirstOrDefault();

    public User? GetByUserName(string userName)
        => (from u in context.Users
            where u.UserName == userName
            select u).FirstOrDefault();

    public User? GetByEmail(string email)
        => (from u in context.Users
            where u.Email == email
            select u).FirstOrDefault();

    public async Task AddUser(User user)
    {
        context.Users.Add(user);
        await context.SaveChangesAsync();
    }

    public async Task DeleteUser(User user)
    {
        context.Users.Remove(user);
        await context.SaveChangesAsync();
    }

    public User? AuthenticateUser(string email, string password)
        => (from u in context.Users
            where u.Email == email && u.Password == password
            select u).FirstOrDefault();

    public bool IsValidEmail(string email)
        => (from u in context.Users
            where u.Email == email
            select u).FirstOrDefault() is null;

    public bool IsValidUserName(string userName)
    {
        return (from u in context.Users
                where u.UserName == userName
                select u).FirstOrDefault() is null;
    }

    public async Task UpdateUser(User user, JsonPatchDocument<User> patchDoc)
    {
        patchDoc.ApplyTo(user);
        await context.SaveChangesAsync();
    }
}