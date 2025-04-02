using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TestingPlatform.Migrations
{
    /// <inheritdoc />
    public partial class EnhanceRun : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "passed",
                table: "test_runs");

            migrationBuilder.AddColumn<int>(
                name: "status",
                table: "test_runs",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "status",
                table: "test_runs");

            migrationBuilder.AddColumn<bool>(
                name: "passed",
                table: "test_runs",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }
    }
}
