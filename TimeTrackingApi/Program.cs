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
    "http://localhost:3000"
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
    // Allow Admins to access Employee routes too
    options.AddPolicy("EmployeeOnly", policy => policy.RequireRole("employee", "admin"));
});

var app = builder.Build();

// ---------------------------- Middleware ----------------------------
app.UseCors("AllowFrontend");
app.UseAuthentication();
app.UseAuthorization();

// ---------------------------- Auto-Migrate ----------------------------
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();
    Seed.Initialize(db);
}

// ---------------------------- Register Endpoints ----------------------------
app.MapAuthEndpoints();
app.MapEmployeeEndpoints();
// app.MapTimeEntryEndpoints(); <--- DELETED THIS LINE (Fixes Build Error)
app.MapAdminTimeEntryEndpoints(); // Ensure you create this file below
app.MapAbsenceEndpoints();
app.MapEmployeeAreaEndpoints();
app.MapDashboard();

app.MapGet("/", () => "Time Tracking API is running! 🚀");

app.Run();