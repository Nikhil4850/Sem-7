USE AIProctoringDB;
GO

CREATE OR ALTER PROCEDURE sp_DeleteExam
    @ExamId INT
AS
BEGIN
    SET NOCOUNT ON;

    -- Check exam exists first
    IF NOT EXISTS (SELECT 1 FROM Exams WHERE ExamId = @ExamId)
    BEGIN
        SELECT 0 AS RowsAffected;
        RETURN;
    END

    -- Delete child records in correct dependency order
    DELETE FROM ProctoringLogs
    WHERE SessionId IN (SELECT SessionId FROM ExamSessions WHERE ExamId = @ExamId);

    DELETE FROM ProctorVerdicts
    WHERE SessionId IN (SELECT SessionId FROM ExamSessions WHERE ExamId = @ExamId);

    DELETE FROM IdentityVerifications
    WHERE SessionId IN (SELECT SessionId FROM ExamSessions WHERE ExamId = @ExamId);

    DELETE FROM Certificates WHERE ExamId = @ExamId;

    DELETE FROM ExamSessions WHERE ExamId = @ExamId;

    DELETE FROM Questions WHERE ExamId = @ExamId;

    DELETE FROM Exams WHERE ExamId = @ExamId;

    SELECT 1 AS RowsAffected;
END
GO
