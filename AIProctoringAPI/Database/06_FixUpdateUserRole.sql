USE AIProctoringDB;
GO

-- Fix sp_UpdateUserRole: remove SELECT so ExecuteNonQuery returns correct row count
CREATE OR ALTER PROCEDURE sp_UpdateUserRole
    @Username NVARCHAR(100),
    @Role     NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT OFF;  -- OFF so UPDATE rows affected is returned to caller
    UPDATE Users SET Role = @Role WHERE Username = @Username;
END
GO

PRINT 'sp_UpdateUserRole fixed.';
GO
