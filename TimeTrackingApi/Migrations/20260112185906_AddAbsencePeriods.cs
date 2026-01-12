using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TimeTrackingApi.Migrations
{
    /// <inheritdoc />
    public partial class AddAbsencePeriods : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Reason",
                table: "Absences");

            migrationBuilder.RenameColumn(
                name: "Date",
                table: "Absences",
                newName: "StartDate");

            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "Absences",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "EndDate",
                table: "Absences",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<int>(
                name: "Type",
                table: "Absences",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Description",
                table: "Absences");

            migrationBuilder.DropColumn(
                name: "EndDate",
                table: "Absences");

            migrationBuilder.DropColumn(
                name: "Type",
                table: "Absences");

            migrationBuilder.RenameColumn(
                name: "StartDate",
                table: "Absences",
                newName: "Date");

            migrationBuilder.AddColumn<string>(
                name: "Reason",
                table: "Absences",
                type: "text",
                nullable: false,
                defaultValue: "");
        }
    }
}
