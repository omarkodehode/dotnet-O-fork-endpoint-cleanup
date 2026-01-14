using Microsoft.EntityFrameworkCore;
using System.Text;
using TimeTrackingApi.Data;
using TimeTrackingApi.Models;

namespace TimeTrackingApi.Services;

public class PayrollService
{
    private readonly AppDbContext _context;

    public PayrollService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<byte[]> GeneratePayrollCsvAsync(int year, int month, int? employeeId = null)
    {
        var startDate = new DateTime(year, month, 1);
        var endDate = startDate.AddMonths(1).AddDays(-1);

        var query = _context.Employees.Include(e => e.Department).AsQueryable();
        if (employeeId.HasValue) query = query.Where(e => e.Id == employeeId.Value);

        var employees = await query.ToListAsync();
        var csvBuilder = new StringBuilder();

        csvBuilder.AppendLine("EmployeeId,FullName,Department,Position,TotalHours,RegularHours,OvertimeHours,Month,Year");

        foreach (var emp in employees)
        {
            var timeEntries = await _context.TimeEntries
                .Where(t => t.EmployeeId == emp.Id &&
                            t.ClockIn >= startDate && t.ClockIn <= endDate && t.ClockOut != null)
                .ToListAsync();

            double totalHours = timeEntries.Sum(t => 
                t.ClockOut.HasValue ? (t.ClockOut.Value - t.ClockIn).TotalHours : 0);
            
            double regularHours = Math.Min(totalHours, 160);
            double overtimeHours = Math.Max(0, totalHours - 160);

            csvBuilder.AppendLine($"{emp.Id},{emp.FullName},{emp.Department?.Name},{emp.Position},{totalHours:F2},{regularHours:F2},{overtimeHours:F2},{month},{year}");
        }

        return Encoding.UTF8.GetBytes(csvBuilder.ToString());
    }
}