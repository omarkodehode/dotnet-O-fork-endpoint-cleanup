using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TimeTrackingApi.Migrations
{
    /// <inheritdoc />
    public partial class AddNe : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Payrolls_Employees_EmployeeId",
                table: "Payrolls");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Payrolls",
                table: "Payrolls");

            migrationBuilder.RenameTable(
                name: "Payrolls",
                newName: "Payroll");

            migrationBuilder.RenameColumn(
                name: "PeriodStart",
                table: "Payroll",
                newName: "PayPeriodStart");

            migrationBuilder.RenameColumn(
                name: "PeriodEnd",
                table: "Payroll",
                newName: "PayPeriodEnd");

            migrationBuilder.RenameIndex(
                name: "IX_Payrolls_EmployeeId",
                table: "Payroll",
                newName: "IX_Payroll_EmployeeId");

            migrationBuilder.AddColumn<string>(
                name: "Email",
                table: "Employees",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "VacationDaysBalance",
                table: "Employees",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<bool>(
                name: "IsPaid",
                table: "Payroll",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<decimal>(
                name: "NetPay",
                table: "Payroll",
                type: "numeric(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddPrimaryKey(
                name: "PK_Payroll",
                table: "Payroll",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Payroll_Employees_EmployeeId",
                table: "Payroll",
                column: "EmployeeId",
                principalTable: "Employees",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Payroll_Employees_EmployeeId",
                table: "Payroll");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Payroll",
                table: "Payroll");

            migrationBuilder.DropColumn(
                name: "Email",
                table: "Employees");

            migrationBuilder.DropColumn(
                name: "VacationDaysBalance",
                table: "Employees");

            migrationBuilder.DropColumn(
                name: "IsPaid",
                table: "Payroll");

            migrationBuilder.DropColumn(
                name: "NetPay",
                table: "Payroll");

            migrationBuilder.RenameTable(
                name: "Payroll",
                newName: "Payrolls");

            migrationBuilder.RenameColumn(
                name: "PayPeriodStart",
                table: "Payrolls",
                newName: "PeriodStart");

            migrationBuilder.RenameColumn(
                name: "PayPeriodEnd",
                table: "Payrolls",
                newName: "PeriodEnd");

            migrationBuilder.RenameIndex(
                name: "IX_Payroll_EmployeeId",
                table: "Payrolls",
                newName: "IX_Payrolls_EmployeeId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Payrolls",
                table: "Payrolls",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Payrolls_Employees_EmployeeId",
                table: "Payrolls",
                column: "EmployeeId",
                principalTable: "Employees",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
