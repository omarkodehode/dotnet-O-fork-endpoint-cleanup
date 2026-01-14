using Microsoft.EntityFrameworkCore;
using TimeTrackingApi.Models;

namespace TimeTrackingApi.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options)
        { }

        public DbSet<User> Users { get; set; } = null!;
        public DbSet<Employee> Employees { get; set; } = null!;
        public DbSet<TimeEntry> TimeEntries { get; set; } = null!;
        public DbSet<Absence> Absences { get; set; } = null!;

        public DbSet<Department> Departments {get;set;} = null!;
        public DbSet<Payroll> Payrolls { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<User>()
                .HasIndex(u => u.Username)
                .IsUnique()
;

            modelBuilder.Entity<Employee>()
                .HasMany(e => e.TimeEntries)
                .WithOne(te => te.Employee)
                .HasForeignKey(te => te.EmployeeId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Employee>()
                .HasMany(e => e.Absences)
                .WithOne(a => a.Employee)
                .HasForeignKey(a => a.EmployeeId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<User>()
                .HasOne(u => u.Employee)
                .WithOne(e => e.User)
                .HasForeignKey<Employee>(e => e.UserId)
                .OnDelete(DeleteBehavior.SetNull);
        }
    }
}
