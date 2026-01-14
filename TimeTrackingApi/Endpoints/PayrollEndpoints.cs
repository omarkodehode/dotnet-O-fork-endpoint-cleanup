using System;
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
            group.MapPost("/generate", async ([FromBody] PayrollGenerateRequest req, AppDbContext db) =>
            {
                var start = req.StartDate.ToUniversalTime();
                var end = req.EndDate.ToUniversalTime();

                var employees = await db.Employees
                    .Include(e => e.TimeEntries)
                    .ToListAsync();
                    
                var payrolls = new List<Payroll>();

                foreach (var emp in employees)
                {
                    // Calculate total hours in the period
                    var totalHours = emp.TimeEntries
                        .Where(t => t.ClockIn >= start && t.ClockIn <= end && t.ClockOut != null)
                        .Sum(t => (t.ClockOut!.Value - t.ClockIn).TotalHours);

                    var gross = (decimal)totalHours * emp.HourlyRate;
                    var taxRate = 0.20m; // Simple 20% tax
                    var net = gross * (1 - taxRate);

                    payrolls.Add(new Payroll
                    {
                        EmployeeId = emp.Id,
                        PayPeriodStart = start,
                        PayPeriodEnd = end,
                        TotalHours = (decimal)Math.Round(totalHours, 2),
                        GrossPay = Math.Round(gross, 2),
                        NetPay = Math.Round(net, 2),
                        IsPaid = false
                    });
                }

                await db.Payroll.AddRangeAsync(payrolls);
                await db.SaveChangesAsync();

                return Results.Ok(new { message = "Payroll generated successfully" });
            });
        }
    }

    public class PayrollGenerateRequest
    {
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
    }
}