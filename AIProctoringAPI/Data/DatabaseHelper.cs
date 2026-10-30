using Microsoft.Data.SqlClient;
using System.Data;

namespace AIProctoringAPI.Data;

/// <summary>
/// Central database access helper. All stored procedure calls go through here.
/// </summary>
public class DatabaseHelper
{
    private readonly string _connectionString;
    private readonly ILogger<DatabaseHelper> _logger;

    public DatabaseHelper(IConfiguration configuration, ILogger<DatabaseHelper> logger)
    {
        _connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");
        _logger = logger;
    }

    /// <summary>Creates an open SqlConnection asynchronously.</summary>
    public async Task<SqlConnection> CreateConnectionAsync()
    {
        var connection = new SqlConnection(_connectionString);
        await connection.OpenAsync();
        return connection;
    }

    /// <summary>
    /// Executes a stored procedure and returns all rows from the first result set
    /// via a callback that maps SqlDataReader rows to T.
    /// </summary>
    public async Task<List<T>> ExecuteReaderAsync<T>(
        string procedureName,
        Action<SqlCommand> parameterSetup,
        Func<SqlDataReader, T> mapper)
    {
        var results = new List<T>();
        await using var connection = await CreateConnectionAsync();
        await using var command = new SqlCommand(procedureName, connection)
        {
            CommandType = CommandType.StoredProcedure
        };
        parameterSetup(command);

        await using var reader = await command.ExecuteReaderAsync();
        while (await reader.ReadAsync())
            results.Add(mapper(reader));

        return results;
    }

    /// <summary>
    /// Executes a stored procedure and returns the first row only (or default).
    /// </summary>
    public async Task<T?> ExecuteSingleAsync<T>(
        string procedureName,
        Action<SqlCommand> parameterSetup,
        Func<SqlDataReader, T> mapper) where T : class
    {
        await using var connection = await CreateConnectionAsync();
        await using var command = new SqlCommand(procedureName, connection)
        {
            CommandType = CommandType.StoredProcedure
        };
        parameterSetup(command);

        await using var reader = await command.ExecuteReaderAsync();
        if (await reader.ReadAsync())
            return mapper(reader);

        return null;
    }

    /// <summary>
    /// Executes a stored procedure with no result set (INSERT/UPDATE/DELETE).
    /// Returns the number of rows affected.
    /// </summary>
    public async Task<int> ExecuteNonQueryAsync(
        string procedureName,
        Action<SqlCommand> parameterSetup)
    {
        await using var connection = await CreateConnectionAsync();
        await using var command = new SqlCommand(procedureName, connection)
        {
            CommandType = CommandType.StoredProcedure
        };
        parameterSetup(command);
        return await command.ExecuteNonQueryAsync();
    }

    /// <summary>
    /// Executes a stored procedure and returns the scalar value from the first column of the first row.
    /// </summary>
    public async Task<object?> ExecuteScalarAsync(
        string procedureName,
        Action<SqlCommand> parameterSetup)
    {
        await using var connection = await CreateConnectionAsync();
        await using var command = new SqlCommand(procedureName, connection)
        {
            CommandType = CommandType.StoredProcedure
        };
        parameterSetup(command);
        return await command.ExecuteScalarAsync();
    }

    /// <summary>
    /// Executes a stored procedure that sets output parameters.
    /// The parameterSetup callback should add both input and output parameters.
    /// Returns the command so the caller can read output parameter values.
    /// </summary>
    public async Task ExecuteWithOutputAsync(
        string procedureName,
        Action<SqlCommand> parameterSetup,
        SqlConnection connection,
        SqlCommand command)
    {
        command.Connection = connection;
        command.CommandType = CommandType.StoredProcedure;
        command.CommandText = procedureName;
        parameterSetup(command);
        await command.ExecuteNonQueryAsync();
    }

    /// <summary>Safely reads a nullable string column.</summary>
    public static string? GetString(SqlDataReader reader, string column)
    {
        int ordinal = reader.GetOrdinal(column);
        return reader.IsDBNull(ordinal) ? null : reader.GetString(ordinal);
    }

    /// <summary>Safely reads a non-null string column (returns empty string if null).</summary>
    public static string GetStringOrEmpty(SqlDataReader reader, string column)
        => GetString(reader, column) ?? string.Empty;

    /// <summary>Safely reads a nullable int column.</summary>
    public static int? GetNullableInt(SqlDataReader reader, string column)
    {
        int ordinal = reader.GetOrdinal(column);
        return reader.IsDBNull(ordinal) ? null : reader.GetInt32(ordinal);
    }

    /// <summary>Safely reads a nullable decimal column.</summary>
    public static decimal? GetNullableDecimal(SqlDataReader reader, string column)
    {
        int ordinal = reader.GetOrdinal(column);
        return reader.IsDBNull(ordinal) ? null : reader.GetDecimal(ordinal);
    }

    /// <summary>Safely reads a nullable DateTime column.</summary>
    public static DateTime? GetNullableDateTime(SqlDataReader reader, string column)
    {
        int ordinal = reader.GetOrdinal(column);
        return reader.IsDBNull(ordinal) ? null : reader.GetDateTime(ordinal);
    }

    /// <summary>Safely reads a nullable bool column.</summary>
    public static bool? GetNullableBool(SqlDataReader reader, string column)
    {
        int ordinal = reader.GetOrdinal(column);
        return reader.IsDBNull(ordinal) ? null : reader.GetBoolean(ordinal);
    }

    /// <summary>Tests database connectivity. Returns true if reachable.</summary>
    public async Task<bool> TestConnectionAsync()
    {
        try
        {
            await using var connection = await CreateConnectionAsync();
            return connection.State == System.Data.ConnectionState.Open;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Database connectivity check failed.");
            return false;
        }
    }
}
