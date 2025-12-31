using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using TimeTrackingApi.Data;
using TimeTrackingApi.Services;
using TimeTrackingApi.Endpoints;
using TimeTrackingApi.Utils;


var builder = WebApplication.CreateBuilder(args);

// ---------------------------- CORS ----------------------------
var defaultFrontendOrigins = new[]
{
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "https://localhost:5173",
    "https://localhost:3000"
};

var allowedFrontendOrigins = builder.Configuration.GetSection("Frontend:AllowedOrigins").Get<string[]>() ?? defaultFrontendOrigins;

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(allowedFrontendOrigins)
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

// ---------------------------- DB ----------------------------
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// ---------------------------- JWT ----------------------------
var jwtKey = builder.Configuration["Jwt:Key"] ?? "default_dev_key_12345";
builder.Services.AddSingleton(new JwtService(jwtKey));

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.RequireHttpsMetadata = false;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
        };
    });

// ---------------------------- Services ----------------------------
builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<EmployeeService>();
builder.Services.AddScoped<TimeEntryService>();
builder.Services.AddScoped<AbsenceService>();

// ---------------------------- Authorization ----------------------------
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminOnly", policy => policy.RequireRole("admin"));
    options.AddPolicy("EmployeeOnly", policy => policy.RequireRole("employee"));
});

var app = builder.Build();

// ---------------------------- Middleware ----------------------------
app.UseCors("AllowFrontend");
app.UseAuthentication();
app.UseAuthorization();

// ---------------------------- Dev helpers ----------------------------
// Expose a development-only endpoint to list users and their password hash (base64)
// so developers can inspect what's stored in the DB when debugging login issues.
if (app.Environment.IsDevelopment())
{
    app.MapGet("/dev/users", async (TimeTrackingApi.Data.AppDbContext db) =>
    {
        var list = await db.Users
            .Select(u => new
            {
                u.Id,
                u.Username,
                u.Role,
                PasswordHash = Convert.ToBase64String(u.PasswordHash)
            })
            .ToListAsync();

        return Results.Ok(list);
    });
}

// ---------------------------- Auto-Migrate DB ----------------------------
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();

    Seed.Initialize(db);
}

// ---------------------------- Register Endpoints ----------------------------
app.MapAuthEndpoints();
app.MapEmployeeEndpoints();
app.MapTimeEntryEndpoints();
app.MapAdminTimeEntryEndpoints();
app.MapAbsenceEndpoints();
app.MapEmployeeAreaEndpoints();
app.MapDashboard();

// Root test endpoint
app.MapGet("/", () => "Time Tracking API is running! 🚀");

app.Run();
