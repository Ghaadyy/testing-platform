using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using TestingPlatform.Context;
using TestingPlatform.Middlewares;
using TestingPlatform.Services.Redis;
using TestingPlatform.Repository.Test;
using TestingPlatform.Services.Token;
using TestingPlatform.Repository.User;
using TestingPlatform.Services.Http;
using TestingPlatform.Services.Test;
using TestingPlatform.Services.Compiler;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddCors();

builder.Services.AddControllers().AddNewtonsoftJson();

builder.Services.AddHttpContextAccessor();

// Register repositories
builder.Services.AddScoped<ITestRepository, TestRepository>();
builder.Services.AddScoped<IUserRepository, UserRepository>();

// Register services
builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddSingleton<TestExecutionService>();
builder.Services.AddScoped<RedisLogService>();
builder.Services.AddScoped<RedisRunService>();
builder.Services.AddSingleton<RedisProcessService>();
builder.Services.AddSingleton<HttpService>();
builder.Services.AddSingleton<CompilerService>();

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