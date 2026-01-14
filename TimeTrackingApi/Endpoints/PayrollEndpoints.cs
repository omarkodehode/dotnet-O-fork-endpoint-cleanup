using Microsoft.AspNetCore.Mvc;
using TimeTrackingApi.Data;
using TimeTrackingApi.Models;
using Microsoft.EntityFrameworkCore;

namespace TimeTrackingApi.Endpoints
{
    public static class PayrollEndpoints
    {
        public static void MapPayrollEndpoints(this IEndpointRouteBuilder app)
        {
            var group = app.MapGroup("/api/payroll").RequireAuthorization("AdminOnly");

            // GET /payroll - Get all payroll records
            group.MapGet("/", async (AppDbContext db) =>
            {
                var payrolls = await db.Payroll
                    .Include(p => p.Employee)
                    .OrderByDescending(p => p.PayPeriodStart)
                    .ToListAsync();
                return Results.Ok(payrolls);
            });

            // POST /payroll/generate - Generate payroll for a period
            group.MapPost("/generate", async (AppDbContext db) =>
            {
                // Simple placeholder logic: Create a dummy payroll record for now
                // In a real app, you would calculate hours * rate here
                var employees = await db.Employees.ToListAsync();
                var payrolls = new List<Payroll>();

                foreach (var emp in employees)
                {
                    payrolls.Add(new Payroll
                    {
                        EmployeeId = emp.Id,
                        PayPeriodStart = DateTime.UtcNow.AddDays(-30),
                        PayPeriodEnd = DateTime.UtcNow,
                        TotalHours = 160, // Dummy data
                        GrossPay = 3000,  // Dummy data
                        NetPay = 2500,    // Dummy data
                        IsPaid = false
                    });
                }

                await db.Payroll.AddRangeAsync(payrolls);
                await db.SaveChangesAsync();

                return Results.Ok(new { message = "Payroll generated successfully" });
            });
        }
    }
}