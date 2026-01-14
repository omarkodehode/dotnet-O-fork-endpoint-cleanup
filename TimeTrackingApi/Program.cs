using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims; 
using System.Text;
using System.Text.Json.Serialization;
using TimeTrackingApi.Data;
using TimeTrackingApi.Services;
using TimeTrackingApi.Endpoints;
using TimeTrackingApi.Utils;

var builder = WebApplication.CreateBuilder(args);

// --- CORS ---
var defaultFrontendOrigins = new[] { "http://localhost:5173", "http://localhost:3000" };
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

// --- Database ---
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// --- JSON Configuration (Minimal APIs) ---
builder.Services.Configure<Microsoft.AspNetCore.Http.Json.JsonOptions>(options =>
{
    options.SerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
    options.SerializerOptions.Converters.Add(new JsonStringEnumConverter());
});

// --- JWT Authentication ---
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
            RoleClaimType = ClaimTypes.Role,
            NameClaimType = ClaimTypes.Name
        };
    });

// --- Services ---
builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<EmployeeService>();
builder.Services.AddScoped<TimeEntryService>();
builder.Services.AddScoped<AbsenceService>();
builder.Services.AddScoped<DepartmentService>();

// --- Authorization ---
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminOnly", policy => policy.RequireRole("admin", "Admin"));
    options.AddPolicy("ManagerOnly", policy => policy.RequireRole("Manager", "manager", "Admin", "admin"));
    options.AddPolicy("EmployeeOnly", policy => policy.RequireRole("employee", "Employee", "Admin", "admin", "Manager", "manager"));
});

var app = builder.Build();

// --- Middleware ---
app.UseCors("AllowFrontend");
app.UseAuthentication();
app.UseAuthorization();

// --- DB Seed ---
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();
    Seed.Initialize(db);
}

// --- Endpoints ---
app.MapAuthEndpoints();
app.MapEmployeeEndpoints();
app.MapAdminTimeEntryEndpoints(); 
app.MapAbsenceEndpoints();
app.MapEmployeeAreaEndpoints();
app.MapDashboardEndpoints(); 
app.MapLogEndpoints(); 
app.MapDepartmentEndpoints();
app.MapManagerEndpoints();
app.MapPayrollEndpoints();

app.MapGet("/", () => "Time Tracking API is running! 🚀");

app.Run();