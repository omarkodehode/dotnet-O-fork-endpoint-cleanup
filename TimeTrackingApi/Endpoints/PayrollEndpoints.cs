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
                // Fix: Ensure dates are handled as full days in UTC
                var start = DateTime.SpecifyKind(req.StartDate.Date, DateTimeKind.Utc);
                var end = DateTime.SpecifyKind(req.EndDate.Date.AddDays(1).AddTicks(-1), DateTimeKind.Utc);
                
                var endUtc = DateTime.SpecifyKind(req.EndDate.Date, DateTimeKind.Utc);
                
                // Cleanup existing payroll for this exact period to avoid duplicates
                var existing = await db.Payroll
                    .Where(p => p.PayPeriodStart == start && p.PayPeriodEnd == endUtc) 
                    .ToListAsync();
                if (existing.Any()) db.Payroll.RemoveRange(existing);

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
                        PayPeriodEnd = endUtc, // Store the logical end date
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