using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using RestrictedNL.Context;
using RestrictedNL.Middlewares;
using RestrictedNL.Models;
using RestrictedNL.Models.Token;
using RestrictedNL.Models.Redis;
using RestrictedNL.Models.User;
using RestrictedNL.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddCors();

builder.Services.AddControllers().AddNewtonsoftJson();
builder.Services.AddScoped<ITestsRepository, TestsRepository>();
builder.Services.AddSingleton<SocketsRepository>();
builder.Services.AddScoped<TestExecutionService>();
builder.Services.AddScoped<RedisLogsRepository>();
builder.Services.AddScoped<RedisProcessRepository>();
builder.Services.AddSingleton<HttpRepository>();

builder.Services.AddScoped<ITokenRepository, TokenRepository>();
builder.Services.AddScoped<TokenGenerator>();
builder.Services.AddScoped<IUserRepository, UserRepository>();

builder.Services.AddDbContext<TestContext>(options =>
{
    options.UseNpgsql(builder.Configuration["ConnectionStrings:DB"]);
});

builder.Services.AddStackExchangeRedisCache(options =>
 {
     options.Configuration = builder.Configuration["ConnectionStrings:Redis"];
     options.InstanceName = "SampleInstance";
 });

// Configure authentication & JWT
builder.Services
    .AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.RequireHttpsMetadata = false;
        options.SaveToken = false;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["JWT:Secret"]!)
            ),
            ValidateIssuer = false,
            ValidateAudience = false,
            ClockSkew = TimeSpan.Zero
        };
    });

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors(builder => builder.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod());

app.UseAuthentication();

app.UseAuthorization();

app.UseWebSockets();

app.UseMiddleware<WebSocketMiddleware>();

app.MapControllers();

app.Run();